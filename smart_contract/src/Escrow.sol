// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Escrow {
    struct Order {
        address user;
        address vendor;
        uint256 amount;
        bool confirmed;
        bool refunded;
    }

    event OrderPlaced(address indexed user, address indexed vendor, uint256 amount, string orderId);
    event DeliveryConfirmed(string orderId);
    event Refunded(string orderId);

    mapping(string => Order) public orders;

    error OrderAlreadyExists();
    error OrderNotFound();
    error NotOrderUser();
    error AlreadyConfirmed();
    error AlreadyRefunded();

    // Place an order
    function placeOrder(address vendor, uint256 amount, string calldata orderId) external payable {
        if (orders[orderId].user != address(0)) revert OrderAlreadyExists();
        require(msg.value == amount, "Incorrect ETH sent");
        orders[orderId] = Order({user: msg.sender, vendor: vendor, amount: amount, confirmed: false, refunded: false});
        emit OrderPlaced(msg.sender, vendor, amount, orderId);
    }

    // Confirm delivery
    function confirmDelivery(string calldata orderId) external {
        Order storage order = orders[orderId];
        if (order.user == address(0)) revert OrderNotFound();
        if (order.user != msg.sender) revert NotOrderUser();
        if (order.confirmed) revert AlreadyConfirmed();
        if (order.refunded) revert AlreadyRefunded();
        order.confirmed = true;
        emit DeliveryConfirmed(orderId);
    }

    // Refund order
    function refund(string calldata orderId) external {
        Order storage order = orders[orderId];
        if (order.user == address(0)) revert OrderNotFound();
        if (order.refunded) revert AlreadyRefunded();
        if (order.confirmed) revert AlreadyConfirmed();
        if (order.user != msg.sender) revert NotOrderUser();
        order.refunded = true;
        (bool sent,) = order.user.call{value: order.amount}("");
        require(sent, "Refund failed");
        emit Refunded(orderId);
    }

    // Get order details
    function getOrder(string calldata orderId)
        external
        view
        returns (address user, address vendor, uint256 amount, bool confirmed)
    {
        Order storage order = orders[orderId];
        if (order.user == address(0)) revert OrderNotFound();
        return (order.user, order.vendor, order.amount, order.confirmed);
    }
}
