// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/CHOPToken.sol";

contract CHOPTokenTest is Test {
    CHOPToken token;

    function setUp() public {
        token = new CHOPToken();
    }

    // TODO: Add tests for minting, minter permissions, balanceOf
}
