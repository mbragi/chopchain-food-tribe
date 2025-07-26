// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./interfaces/IEscrow.sol";
import "./interfaces/ICHOPToken.sol";
import "./interfaces/IVendorRegistry.sol";
import "./interfaces/IDeliveryAgentRegistry.sol";
import "./interfaces/IErrors.sol";

/**
 * @title Escrow
 * @notice Handles order payments, vendor payments, delivery assignments, and reward distribution for ChopChain
 */
contract Escrow is IEscrow, Ownable {
    using Math for uint256;

    mapping(string => Order) public orders;
    
    // Order tracking arrays
    string[] public unassignedOrders;
    mapping(address => string[]) public agentOrders;
    mapping(string => uint256) public unassignedOrderIndex;

    IERC20 public immutable stablecoin;
    ICHOPToken public immutable chopToken;
    IVendorRegistry public immutable vendorRegistry;
    IDeliveryAgentRegistry public immutable deliveryAgentRegistry;

    uint256 public constant override REWARD_PERCENTAGE = 5; // 5% rewards in CHOP tokens
    uint256 public constant override REWARD_DECIMALS = 2;
    uint256 private constant PERCENTAGE_BASE = 100;
    uint256 private constant MINIMUM_ORDER_AMOUNT = 1e18; // Minimum amount to ensure non-zero rewards (1 USDC)

    constructor(
        address _stablecoin,
        address _chopToken,
        address _vendorRegistry,
        address _deliveryAgentRegistry
    ) Ownable(msg.sender) {
        if (
            _stablecoin == address(0) ||
            _chopToken == address(0) ||
            _vendorRegistry == address(0) ||
            _deliveryAgentRegistry == address(0)
        ) {
            revert Errors.ZeroAddress();
        }
        stablecoin = IERC20(_stablecoin);
        chopToken = ICHOPToken(_chopToken);
        vendorRegistry = IVendorRegistry(_vendorRegistry);
        deliveryAgentRegistry = IDeliveryAgentRegistry(_deliveryAgentRegistry);
    }

    /**
     * @inheritdoc IEscrow
     */
    function placeOrder(address vendor, uint256 amount, string calldata orderId) external override {
        if (orders[orderId].user != address(0)) revert Errors.OrderAlreadyExists(orderId);
        if (amount < MINIMUM_ORDER_AMOUNT) revert Errors.InvalidAmount(amount);
        if (!vendorRegistry.isVendor(vendor)) revert Errors.UnauthorizedVendor(vendor);

        // Transfer stablecoin from user to escrow
        bool success = stablecoin.transferFrom(msg.sender, address(this), amount);
        if (!success) revert Errors.PaymentFailed(address(stablecoin), msg.sender, address(this), amount);

        // Store order
        orders[orderId] = Order({
            user: msg.sender,
            vendor: vendor,
            deliveryAgent: address(0),
            amount: amount,
            confirmed: false,
            refunded: false,
            paid: false,
            assignedAt: 0
        });

        // Add to unassigned orders
        unassignedOrderIndex[orderId] = unassignedOrders.length;
        unassignedOrders.push(orderId);

        // Calculate and mint CHOP rewards - using safe math
        uint256 rewardAmount;
        unchecked {
            rewardAmount = amount.mulDiv(REWARD_PERCENTAGE, PERCENTAGE_BASE);
        }

        chopToken.mint(msg.sender, rewardAmount);

        emit OrderPlaced(msg.sender, vendor, amount, orderId);
        emit RewardMinted(msg.sender, rewardAmount, orderId);
    }

    /**
     * @inheritdoc IEscrow
     */
    function assignDeliveryAgent(string calldata orderId) external override {
        Order storage order = orders[orderId];
        if (order.user == address(0)) revert Errors.OrderNotFound(orderId);
        if (order.deliveryAgent != address(0)) revert Errors.AlreadyConfirmed(orderId); // Already assigned
        if (order.refunded || order.paid) revert Errors.AlreadyPaid(orderId);
        if (!deliveryAgentRegistry.isAgentActive(msg.sender)) revert Errors.UnauthorizedCaller(msg.sender);

        order.deliveryAgent = msg.sender;
        order.assignedAt = block.timestamp;

        // Remove from unassigned orders
        _removeFromUnassignedOrders(orderId);

        // Add to agent's orders
        agentOrders[msg.sender].push(orderId);

        emit DeliveryAgentAssigned(orderId, msg.sender, order.vendor);
    }

    /**
     * @inheritdoc IEscrow
     */
    function startDelivery(string calldata orderId) external override {
        Order storage order = orders[orderId];
        if (order.user == address(0)) revert Errors.OrderNotFound(orderId);
        if (order.deliveryAgent != msg.sender) revert Errors.UnauthorizedCaller(msg.sender);
        if (order.confirmed || order.refunded || order.paid) revert Errors.AlreadyPaid(orderId);

        emit DeliveryStarted(orderId, msg.sender);
    }

    /**
     * @inheritdoc IEscrow
     */
    function confirmDelivery(string calldata orderId) external override {
        Order storage order = orders[orderId];
        if (order.user == address(0)) revert Errors.OrderNotFound(orderId);
        if (order.confirmed) revert Errors.AlreadyConfirmed(orderId);
        if (order.refunded) revert Errors.AlreadyRefunded(orderId);
        if (order.paid) revert Errors.AlreadyPaid(orderId);

        // Can be confirmed by customer OR assigned delivery agent
        if (msg.sender != order.user && msg.sender != order.deliveryAgent) {
            revert Errors.UnauthorizedCaller(msg.sender);
        }

        order.confirmed = true;
        order.paid = true;

        // Transfer payment to vendor
        bool success = stablecoin.transfer(order.vendor, order.amount);
        if (!success) revert Errors.PaymentFailed(address(stablecoin), address(this), order.vendor, order.amount);

        emit DeliveryConfirmed(orderId, msg.sender);
        emit VendorPaid(orderId, order.vendor, order.amount);
    }

    /**
     * @inheritdoc IEscrow
     */
    function rateDeliveryAgent(string calldata orderId, uint256 rating) external override {
        Order storage order = orders[orderId];
        if (order.user == address(0)) revert Errors.OrderNotFound(orderId);
        if (order.user != msg.sender) revert Errors.NotOrderUser(msg.sender, order.user);
        if (!order.confirmed) revert Errors.InvalidAmount(0); // Order must be confirmed first
        if (order.deliveryAgent == address(0)) revert Errors.UnauthorizedCaller(address(0));
        if (rating < 100 || rating > 500) revert Errors.InvalidAmount(rating); // 1.00 to 5.00 stars

        // Update delivery agent rating
        deliveryAgentRegistry.updateAgentRating(order.deliveryAgent, rating);
        
        // Also update vendor rating
        vendorRegistry.updateVendorRating(order.vendor, rating);
    }

    /**
     * @inheritdoc IEscrow
     */
    function refund(string calldata orderId) external override {
        Order storage order = orders[orderId];
        if (order.user == address(0)) revert Errors.OrderNotFound(orderId);
        if (order.refunded) revert Errors.AlreadyRefunded(orderId);
        if (order.confirmed) revert Errors.AlreadyConfirmed(orderId);
        if (order.user != msg.sender) revert Errors.NotOrderUser(msg.sender, order.user);
        if (order.paid) revert Errors.AlreadyPaid(orderId);

        order.refunded = true;

        // Remove from unassigned orders if not assigned yet
        if (order.deliveryAgent == address(0)) {
            _removeFromUnassignedOrders(orderId);
        }

        // Return stablecoin to user
        bool success = stablecoin.transfer(order.user, order.amount);
        if (!success) revert Errors.PaymentFailed(address(stablecoin), address(this), order.user, order.amount);

        emit Refunded(orderId);
    }

    /**
     * @inheritdoc IEscrow
     */
    function getOrder(string calldata orderId)
        external
        view
        override
        returns (
            address user,
            address vendor,
            address deliveryAgent,
            uint256 amount,
            bool confirmed,
            bool refunded,
            bool paid,
            uint256 assignedAt
        )
    {
        Order storage order = orders[orderId];
        if (order.user == address(0)) revert Errors.OrderNotFound(orderId);
        return (
            order.user,
            order.vendor,
            order.deliveryAgent,
            order.amount,
            order.confirmed,
            order.refunded,
            order.paid,
            order.assignedAt
        );
    }

    /**
     * @inheritdoc IEscrow
     */
    function getUnassignedOrders() external view override returns (string[] memory orderIds) {
        return unassignedOrders;
    }

    /**
     * @inheritdoc IEscrow
     */
    function getAgentOrders(address agent) external view override returns (string[] memory orderIds) {
        return agentOrders[agent];
    }

    /**
     * @notice Internal function to remove an order from unassigned orders array
     * @param orderId The order identifier to remove
     */
    function _removeFromUnassignedOrders(string calldata orderId) internal {
        uint256 index = unassignedOrderIndex[orderId];
        uint256 lastIndex = unassignedOrders.length - 1;

        if (index != lastIndex) {
            string memory lastOrderId = unassignedOrders[lastIndex];
            unassignedOrders[index] = lastOrderId;
            unassignedOrderIndex[lastOrderId] = index;
        }

        unassignedOrders.pop();
        delete unassignedOrderIndex[orderId];
    }

    /**
     * @notice Emergency function to clear stale unassigned orders (only owner)
     * @param orderIds Array of order IDs to remove from unassigned list
     */
    function clearStaleOrders(string[] calldata orderIds) external onlyOwner {
        for (uint256 i = 0; i < orderIds.length; i++) {
            _removeFromUnassignedOrders(orderIds[i]);
        }
    }
}
