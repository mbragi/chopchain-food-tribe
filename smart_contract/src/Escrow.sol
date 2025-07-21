// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./interfaces/IEscrow.sol";
import "./interfaces/ICHOPToken.sol";
import "./interfaces/IVendorRegistry.sol";
import "./interfaces/IErrors.sol";

/**
 * @title Escrow
 * @notice Handles order payments, vendor payments, and reward distribution for ChopChain
 */
contract Escrow is IEscrow, Ownable {
    using Math for uint256;

    mapping(string => Order) public orders;

    IERC20 public immutable stablecoin;
    ICHOPToken public immutable chopToken;
    IVendorRegistry public immutable vendorRegistry;

    uint256 public constant override REWARD_PERCENTAGE = 5; // 5% rewards in CHOP tokens
    uint256 public constant override REWARD_DECIMALS = 2;
    uint256 private constant PERCENTAGE_BASE = 100;
    uint256 private constant MINIMUM_ORDER_AMOUNT = 1e18; // Minimum amount to ensure non-zero rewards (1 USDC)

    constructor(address _stablecoin, address _chopToken, address _vendorRegistry) Ownable(msg.sender) {
        if (_stablecoin == address(0) || _chopToken == address(0) || _vendorRegistry == address(0)) {
            revert Errors.ZeroAddress();
        }
        stablecoin = IERC20(_stablecoin);
        chopToken = ICHOPToken(_chopToken);
        vendorRegistry = IVendorRegistry(_vendorRegistry);
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
        orders[orderId] =
            Order({user: msg.sender, vendor: vendor, amount: amount, confirmed: false, refunded: false, paid: false});

        // Calculate and mint CHOP rewards - using safe math
        // amount * REWARD_PERCENTAGE / PERCENTAGE_BASE
        uint256 rewardAmount;
        unchecked {
            // Safe because REWARD_PERCENTAGE is constant 5 and PERCENTAGE_BASE is constant 100
            rewardAmount = amount.mulDiv(REWARD_PERCENTAGE, PERCENTAGE_BASE);
        }

        // At this point rewardAmount is guaranteed to be > 0 because:
        // 1. amount >= MINIMUM_ORDER_AMOUNT (100)
        // 2. REWARD_PERCENTAGE is 5
        // 3. PERCENTAGE_BASE is 100
        // So minimum reward is (100 * 5) / 100 = 5
        chopToken.mint(msg.sender, rewardAmount);

        emit OrderPlaced(msg.sender, vendor, amount, orderId);
        emit RewardMinted(msg.sender, rewardAmount, orderId);
    }

    /**
     * @inheritdoc IEscrow
     */
    function confirmDelivery(string calldata orderId) external override {
        Order storage order = orders[orderId];
        if (order.user == address(0)) revert Errors.OrderNotFound(orderId);
        if (order.user != msg.sender) revert Errors.NotOrderUser(msg.sender, order.user);
        if (order.confirmed) revert Errors.AlreadyConfirmed(orderId);
        if (order.refunded) revert Errors.AlreadyRefunded(orderId);
        if (order.paid) revert Errors.AlreadyPaid(orderId);

        order.confirmed = true;
        order.paid = true;

        // Transfer payment to vendor
        bool success = stablecoin.transfer(order.vendor, order.amount);
        if (!success) revert Errors.PaymentFailed(address(stablecoin), address(this), order.vendor, order.amount);

        emit DeliveryConfirmed(orderId);
        emit VendorPaid(orderId, order.vendor, order.amount);
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
        returns (address user, address vendor, uint256 amount, bool confirmed, bool refunded, bool paid)
    {
        Order storage order = orders[orderId];
        if (order.user == address(0)) revert Errors.OrderNotFound(orderId);
        return (order.user, order.vendor, order.amount, order.confirmed, order.refunded, order.paid);
    }
}
