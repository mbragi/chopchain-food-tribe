// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/Escrow.sol";
import "../contracts/CHOPToken.sol";

contract SetupTest is Test {
    Escrow escrow;
    CHOPToken token;

    function setUp() public {
        escrow = new Escrow();
        token = new CHOPToken();
    }

    // TODO: Add shared setup logic for integration tests
}
