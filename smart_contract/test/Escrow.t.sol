// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Escrow.sol";

contract EscrowTest is Test {
    Escrow escrow;
    address user = address(0x1);
    address vendor = address(0x2);
    string orderId = "order-1";
    uint256 amount = 1 ether;

    function setUp() public {
        escrow = new Escrow();
    }

    function testPlaceOrderStoresOrder() public {
        vm.prank(user);
        escrow.placeOrder{value: amount}(vendor, amount, orderId);
        (address storedUser, address storedVendor, uint256 storedAmount, bool confirmed) = escrow.getOrder(orderId);
        assertEq(storedUser, user);
        assertEq(storedVendor, vendor);
        assertEq(storedAmount, amount);
        assertEq(confirmed, false);
    }

    function testConfirmDeliverySetsConfirmed() public {
        vm.prank(user);
        escrow.placeOrder{value: amount}(vendor, amount, orderId);
        vm.prank(user);
        escrow.confirmDelivery(orderId);
        (,,, bool confirmed) = escrow.getOrder(orderId);
        assertEq(confirmed, true);
    }

    function testRefundOnlyOnce() public {
        vm.prank(user);
        escrow.placeOrder{value: amount}(vendor, amount, orderId);
        vm.prank(user);
        escrow.refund(orderId);
        // Try refund again, should revert (implement revert in contract for this test to pass)
        vm.expectRevert();
        escrow.refund(orderId);
    }

    function testUnauthorizedConfirmDeliveryReverts() public {
        vm.prank(user);
        escrow.placeOrder{value: amount}(vendor, amount, orderId);
        // Only user can confirm
        vm.prank(vendor);
        vm.expectRevert();
        escrow.confirmDelivery(orderId);
    }

    function testInvalidOrderIdReverts() public {
        vm.expectRevert();
        escrow.getOrder("invalid");
    }
}
