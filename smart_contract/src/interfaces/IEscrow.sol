// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IEscrow
 * @notice Interface for the ChopChain Escrow contract that handles order payments and delivery confirmation
 */
interface IEscrow {
    /**
     * @notice Order struct containing all order information
     * @param user The user who placed the order
     * @param vendor The vendor fulfilling the order
     * @param deliveryAgent The assigned delivery agent (address(0) if unassigned)
     * @param amount The order amount in stablecoin
     * @param confirmed Whether the delivery has been confirmed
     * @param refunded Whether the order has been refunded
     * @param paid Whether the vendor has been paid
     * @param assignedAt Timestamp when delivery agent was assigned
     */
    struct Order {
        address user;
        address vendor;
        address deliveryAgent;
        uint256 amount;
        bool confirmed;
        bool refunded;
        bool paid;
        uint256 assignedAt;
    }

    /**
     * @notice Emitted when a new order is placed
     */
    event OrderPlaced(address indexed user, address indexed vendor, uint256 amount, string orderId);

    /**
     * @notice Emitted when a delivery agent is assigned to an order
     */
    event DeliveryAgentAssigned(string indexed orderId, address indexed agent, address indexed vendor);

    /**
     * @notice Emitted when an order delivery is confirmed
     */
    event DeliveryConfirmed(string orderId, address confirmedBy);

    /**
     * @notice Emitted when an order is refunded
     */
    event Refunded(string orderId);

    /**
     * @notice Emitted when a vendor is paid for an order
     */
    event VendorPaid(string orderId, address vendor, uint256 amount);

    /**
     * @notice Emitted when CHOP rewards are minted for an order
     */
    event RewardMinted(address indexed user, uint256 amount, string orderId);

    /**
     * @notice Emitted when a delivery agent starts delivery
     */
    event DeliveryStarted(string indexed orderId, address indexed agent);

    /**
     * @notice Places a new order using stablecoin
     * @param vendor The vendor's address
     * @param amount The order amount in stablecoin
     * @param orderId Unique identifier for the order
     */
    function placeOrder(address vendor, uint256 amount, string calldata orderId) external;

    /**
     * @notice Assigns a delivery agent to an order
     * @param orderId The order identifier
     */
    function assignDeliveryAgent(string calldata orderId) external;

    /**
     * @notice Starts delivery process (called by assigned delivery agent)
     * @param orderId The order identifier
     */
    function startDelivery(string calldata orderId) external;

    /**
     * @notice Confirms delivery of an order and releases payment to vendor
     * Can be called by customer or assigned delivery agent
     * @param orderId The order identifier
     */
    function confirmDelivery(string calldata orderId) external;

    /**
     * @notice Rates a delivery agent after order completion
     * @param orderId The order identifier
     * @param rating Rating from 1-5 stars (scaled by 100, e.g., 450 = 4.5 stars)
     */
    function rateDeliveryAgent(string calldata orderId, uint256 rating) external;

    /**
     * @notice Refunds an order to the user
     * @param orderId The order identifier
     */
    function refund(string calldata orderId) external;

    /**
     * @notice Gets the details of an order
     * @param orderId The order identifier
     * @return user The address of the user who placed the order
     * @return vendor The address of the vendor
     * @return deliveryAgent The address of the assigned delivery agent
     * @return amount The order amount in stablecoin
     * @return confirmed Whether the order delivery is confirmed
     * @return refunded Whether the order has been refunded
     * @return paid Whether the vendor has been paid
     * @return assignedAt Timestamp when delivery agent was assigned
     */
    function getOrder(string calldata orderId)
        external
        view
        returns (
            address user,
            address vendor,
            address deliveryAgent,
            uint256 amount,
            bool confirmed,
            bool refunded,
            bool paid,
            uint256 assignedAt
        );

    /**
     * @notice Gets all unassigned orders available for delivery agents
     * @return orderIds Array of unassigned order IDs
     */
    function getUnassignedOrders() external view returns (string[] memory orderIds);

    /**
     * @notice Gets all orders assigned to a specific delivery agent
     * @param agent The delivery agent's address
     * @return orderIds Array of assigned order IDs
     */
    function getAgentOrders(address agent) external view returns (string[] memory orderIds);

    /**
     * @notice Gets the reward percentage for orders
     * @return The reward percentage (e.g., 5 for 5%)
     */
    function REWARD_PERCENTAGE() external view returns (uint256);

    /**
     * @notice Gets the reward decimal places
     * @return The number of decimal places for reward calculation
     */
    function REWARD_DECIMALS() external view returns (uint256);
}
