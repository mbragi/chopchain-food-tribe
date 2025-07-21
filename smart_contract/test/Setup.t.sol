// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../src/Escrow.sol";
import "../src/CHOPToken.sol";
import "../src/VendorRegistry.sol";

// Mock Stablecoin for testing
contract MockStablecoin is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {
        _mint(msg.sender, 1000000 * 10**decimals());
    }
}

contract SetupTest is Test {
    Escrow escrow;
    CHOPToken chopToken;
    VendorRegistry vendorRegistry;
    MockStablecoin stablecoin;

    address user = address(0x1);
    address vendor = address(0x2);
    string orderId = "order-1";
    uint256 amount = 100 * 10**18; // 100 USDC

    function setUp() public {
        // Deploy contracts
        stablecoin = new MockStablecoin();
        chopToken = new CHOPToken();
        vendorRegistry = new VendorRegistry();
        escrow = new Escrow(
            address(stablecoin),
            address(chopToken),
            address(vendorRegistry)
        );

        // Setup permissions
        chopToken.setMinter(address(escrow));
        
        // Register vendor
        vm.prank(vendor);
        vendorRegistry.registerVendor();

        // Fund user with stablecoin
        stablecoin.transfer(user, amount * 2);
    }

    function testIntegrationPlaceOrderAndMintReward() public {
        vm.startPrank(user);
        
        // Approve and place order
        stablecoin.approve(address(escrow), amount);
        escrow.placeOrder(vendor, amount, orderId);

        // Verify order stored correctly
        (
            address storedUser,
            address storedVendor,
            uint256 storedAmount,
            bool confirmed,
            bool refunded,
            bool paid
        ) = escrow.getOrder(orderId);

        assertEq(storedUser, user);
        assertEq(storedVendor, vendor);
        assertEq(storedAmount, amount);
        assertEq(confirmed, false);
        assertEq(refunded, false);
        assertEq(paid, false);

        // Verify CHOP rewards minted
        uint256 expectedReward = (amount * 5) / 100; // 5% reward
        assertEq(chopToken.balanceOf(user), expectedReward);

        // Confirm delivery and verify vendor payment
        escrow.confirmDelivery(orderId);
        assertEq(stablecoin.balanceOf(vendor), amount);
        
        vm.stopPrank();
    }
}
