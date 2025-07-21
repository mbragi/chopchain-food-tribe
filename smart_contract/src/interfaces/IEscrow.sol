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
     * @param amount The order amount in stablecoin
     * @param confirmed Whether the delivery has been confirmed
     * @param refunded Whether the order has been refunded
     * @param paid Whether the vendor has been paid
     */
    struct Order {
        address user;
        address vendor;
        uint256 amount;
        bool confirmed;
        bool refunded;
        bool paid;
    }

    /**
     * @notice Emitted when a new order is placed
     */
    event OrderPlaced(address indexed user, address indexed vendor, uint256 amount, string orderId);

    /**
     * @notice Emitted when an order delivery is confirmed
     */
    event DeliveryConfirmed(string orderId);

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
     * @notice Places a new order using stablecoin
     * @param vendor The vendor's address
     * @param amount The order amount in stablecoin
     * @param orderId Unique identifier for the order
     */
    function placeOrder(address vendor, uint256 amount, string calldata orderId) external;

    /**
     * @notice Confirms delivery of an order and releases payment to vendor
     * @param orderId The order identifier
     */
    function confirmDelivery(string calldata orderId) external;

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
     * @return amount The order amount in stablecoin
     * @return confirmed Whether the order delivery is confirmed
     * @return refunded Whether the order has been refunded
     * @return paid Whether the vendor has been paid
     */
    function getOrder(string calldata orderId)
        external
        view
        returns (address user, address vendor, uint256 amount, bool confirmed, bool refunded, bool paid);

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
