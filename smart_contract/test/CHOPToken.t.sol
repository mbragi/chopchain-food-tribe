// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CHOPToken.sol";

contract CHOPTokenTest is Test {
    CHOPToken token;
    address owner = address(this);
    address minter = address(0x1);
    address user = address(0x2);

    function setUp() public {
        token = new CHOPToken();
    }

    function testOwnerCanSetMinter() public {
        token.setMinter(minter);
        assertEq(token.minter(), minter);
    }

    function testNonOwnerCannotSetMinter() public {
        vm.prank(user);
        vm.expectRevert();
        token.setMinter(user);
    }

    function testMinterCanMint() public {
        token.setMinter(minter);
        vm.prank(minter);
        token.mint(user, 100);
        assertEq(token.balanceOf(user), 100);
    }

    function testNonMinterCannotMint() public {
        token.setMinter(minter);
        vm.prank(user);
        vm.expectRevert();
        token.mint(user, 100);
    }
}
