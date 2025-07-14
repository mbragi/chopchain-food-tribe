// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Escrow {
    // Order struct
    struct Order {
        address user;
        address vendor;
        uint256 amount;
        bool confirmed;
    }

    // Events
    event OrderPlaced(address indexed user, address indexed vendor, uint256 amount, string orderId);
    event DeliveryConfirmed(string orderId);
    event Refunded(string orderId);

    // Storage for orders
    mapping(string => Order) public orders;

    // Place an order
    function placeOrder(address vendor, uint256 amount, string calldata orderId) external payable {
        // TODO: Implement logic
    }

    // Confirm delivery
    function confirmDelivery(string calldata orderId) external {
        // TODO: Implement logic
    }

    // Refund order
    function refund(string calldata orderId) external {
        // TODO: Implement logic
    }

    // Get order details
    function getOrder(string calldata orderId)
        external
        view
        returns (address user, address vendor, uint256 amount, bool confirmed)
    {
        Order storage order = orders[orderId];
        return (order.user, order.vendor, order.amount, order.confirmed);
    }
}
