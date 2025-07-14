// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/Escrow.sol";

contract EscrowTest is Test {
    Escrow escrow;

    function setUp() public {
        escrow = new Escrow();
    }

    // TODO: Add tests for placeOrder, confirmDelivery, refund, getOrder
}
