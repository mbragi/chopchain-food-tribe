// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Escrow.sol";
import "../src/CHOPToken.sol";

contract SetupTest is Test {
    Escrow escrow;
    CHOPToken token;
    address user = address(0x1);
    address vendor = address(0x2);
    string orderId = "order-1";
    uint256 amount = 1 ether;

    function setUp() public {
        escrow = new Escrow();
        token = new CHOPToken();
    }

    function testIntegrationPlaceOrderAndMintReward() public {
        // Place order
        vm.prank(user);
        escrow.placeOrder{value: amount}(vendor, amount, orderId);
        // Simulate reward mint (would be called by Escrow in real integration)
        token.setMinter(address(this));
        token.mint(user, 100);
        assertEq(token.balanceOf(user), 100);
    }
}
