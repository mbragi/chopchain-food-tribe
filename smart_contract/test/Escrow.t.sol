// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../src/Escrow.sol";
import "../src/CHOPToken.sol";
import "../src/VendorRegistry.sol";
import "../src/interfaces/IErrors.sol";
import {Errors} from "../src/interfaces/IErrors.sol";

// Mock Stablecoin for testing
contract MockStablecoin is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}

contract EscrowTest is Test {
    Escrow escrow;
    CHOPToken chopToken;
    VendorRegistry vendorRegistry;
    MockStablecoin stablecoin;

    // Error selector for OpenZeppelin's ERC20InsufficientAllowance
    bytes4 constant ERC20_INSUFFICIENT_ALLOWANCE_SELECTOR = 0x1086541f;

    address user = address(0x1);
    address vendor = address(0x2);
    string orderId = "order-1";
    uint256 amount = 1e18; // 1 USDC

    function setUp() public {
        // Deploy contracts
        stablecoin = new MockStablecoin();
        chopToken = new CHOPToken();
        vendorRegistry = new VendorRegistry();
        escrow = new Escrow(address(stablecoin), address(chopToken), address(vendorRegistry));

        // Setup permissions
        chopToken.setMinter(address(escrow));

        // Register vendor
        vm.prank(vendor);
        vendorRegistry.registerVendor();

        // Fund user with stablecoin
        stablecoin.transfer(user, amount * 2);
    }

    function testPlaceOrderStoresOrder() public {
        vm.startPrank(user);
        stablecoin.approve(address(escrow), amount);
        escrow.placeOrder(vendor, amount, orderId);
        vm.stopPrank();

        (address storedUser, address storedVendor, uint256 storedAmount, bool confirmed, bool refunded, bool paid) =
            escrow.getOrder(orderId);

        assertEq(storedUser, user);
        assertEq(storedVendor, vendor);
        assertEq(storedAmount, amount);
        assertEq(confirmed, false);
        assertEq(refunded, false);
        assertEq(paid, false);

        // Check CHOP rewards
        uint256 expectedReward = (amount * 5) / 100; // 5% reward
        assertEq(chopToken.balanceOf(user), expectedReward);
    }

    function testConfirmDeliverySetsConfirmed() public {
        vm.startPrank(user);
        stablecoin.approve(address(escrow), amount);
        escrow.placeOrder(vendor, amount, orderId);
        escrow.confirmDelivery(orderId);
        vm.stopPrank();

        (,,, bool confirmed,, bool paid) = escrow.getOrder(orderId);
        assertEq(confirmed, true);
        assertEq(paid, true);
        assertEq(stablecoin.balanceOf(vendor), amount);
    }

    function testRefundOnlyOnce() public {
        vm.startPrank(user);
        stablecoin.approve(address(escrow), amount);
        escrow.placeOrder(vendor, amount, orderId);

        uint256 initialBalance = stablecoin.balanceOf(user);
        escrow.refund(orderId);
        // After refund, user should get back the exact amount they spent
        assertEq(stablecoin.balanceOf(user), initialBalance + amount);

        vm.expectRevert(abi.encodeWithSelector(Errors.AlreadyRefunded.selector, orderId));
        escrow.refund(orderId);
        vm.stopPrank();
    }

    function testUnauthorizedConfirmDeliveryReverts() public {
        vm.startPrank(user);
        stablecoin.approve(address(escrow), amount);
        escrow.placeOrder(vendor, amount, orderId);
        vm.stopPrank();

        // Only user can confirm
        vm.prank(vendor);
        vm.expectRevert(abi.encodeWithSelector(Errors.NotOrderUser.selector, vendor, user));
        escrow.confirmDelivery(orderId);
    }

    function testInvalidOrderIdReverts() public {
        vm.expectRevert(abi.encodeWithSelector(Errors.OrderNotFound.selector, "invalid"));
        escrow.getOrder("invalid");
    }

    function testUnauthorizedVendorReverts() public {
        address unauthorizedVendor = address(0x3);

        vm.startPrank(user);
        stablecoin.approve(address(escrow), amount);
        vm.expectRevert(abi.encodeWithSelector(Errors.UnauthorizedVendor.selector, unauthorizedVendor));
        escrow.placeOrder(unauthorizedVendor, amount, orderId);
        vm.stopPrank();
    }

    function testCannotConfirmAfterRefund() public {
        vm.startPrank(user);
        stablecoin.approve(address(escrow), amount);
        escrow.placeOrder(vendor, amount, orderId);
        escrow.refund(orderId);

        vm.expectRevert(abi.encodeWithSelector(Errors.AlreadyRefunded.selector, orderId));
        escrow.confirmDelivery(orderId);
        vm.stopPrank();
    }

    function testCannotPlaceOrderWithZeroAmount() public {
        vm.startPrank(user);
        stablecoin.approve(address(escrow), amount);
        vm.expectRevert(abi.encodeWithSelector(Errors.InvalidAmount.selector, 0));
        escrow.placeOrder(vendor, 0, orderId);
        vm.stopPrank();
    }

    function testCannotPlaceOrderWithoutApproval() public {
        vm.startPrank(user);
        vm.expectRevert(); // Accept any revert
        escrow.placeOrder(vendor, amount, orderId);
        vm.stopPrank();
    }

    function testCannotPlaceOrderWithInsufficientBalance() public {
        address poorUser = address(0x4);
        vm.startPrank(poorUser);
        stablecoin.approve(address(escrow), amount);
        // OpenZeppelin ERC20 now uses custom error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed)
        vm.expectRevert(
            abi.encodeWithSelector(
                bytes4(keccak256("ERC20InsufficientBalance(address,uint256,uint256)")), poorUser, 0, amount
            )
        );
        escrow.placeOrder(vendor, amount, orderId);
        vm.stopPrank();
    }

    function testCannotConfirmDeliveryTwice() public {
        vm.startPrank(user);
        stablecoin.approve(address(escrow), amount);
        escrow.placeOrder(vendor, amount, orderId);
        escrow.confirmDelivery(orderId);

        vm.expectRevert(abi.encodeWithSelector(Errors.AlreadyConfirmed.selector, orderId));
        escrow.confirmDelivery(orderId);
        vm.stopPrank();
    }

    function testCannotRefundAfterConfirmation() public {
        vm.startPrank(user);
        stablecoin.approve(address(escrow), amount);
        escrow.placeOrder(vendor, amount, orderId);
        escrow.confirmDelivery(orderId);

        vm.expectRevert(abi.encodeWithSelector(Errors.AlreadyConfirmed.selector, orderId));
        escrow.refund(orderId);
        vm.stopPrank();
    }

    function testVendorReceivesExactPaymentAmount() public {
        uint256 vendorInitialBalance = stablecoin.balanceOf(vendor);

        vm.startPrank(user);
        stablecoin.approve(address(escrow), amount);
        escrow.placeOrder(vendor, amount, orderId);
        escrow.confirmDelivery(orderId);
        vm.stopPrank();

        assertEq(stablecoin.balanceOf(vendor), vendorInitialBalance + amount);
    }

    function testRewardCalculationRoundingDown() public {
        uint256 oddAmount = 101e18; // 101 USDC
        vm.startPrank(user);
        deal(address(stablecoin), user, oddAmount); // Fund user
        stablecoin.approve(address(escrow), oddAmount);
        escrow.placeOrder(vendor, oddAmount, orderId);
        vm.stopPrank();

        uint256 expectedReward = (oddAmount * 5) / 100;
        assertEq(chopToken.balanceOf(user), expectedReward);
        assertEq(expectedReward, 5.05e18); // 5.05 USDC in 18 decimals
    }

    function testMultipleOrdersSameUser() public {
        string memory orderId2 = "order-2";

        vm.startPrank(user);
        stablecoin.approve(address(escrow), amount * 2);

        // Place first order
        escrow.placeOrder(vendor, amount, orderId);

        // Place second order
        escrow.placeOrder(vendor, amount, orderId2);

        // Verify both orders stored correctly
        (,, uint256 amount1,,, bool paid1) = escrow.getOrder(orderId);
        (,, uint256 amount2,,, bool paid2) = escrow.getOrder(orderId2);

        assertEq(amount1, amount);
        assertEq(amount2, amount);
        assertEq(paid1, false);
        assertEq(paid2, false);

        // Verify total rewards (5% of each order)
        uint256 expectedTotalReward = ((amount * 2) * 5) / 100;
        assertEq(chopToken.balanceOf(user), expectedTotalReward);
        vm.stopPrank();
    }

    function testVendorDeregistrationPreventsNewOrders() public {
        // First place a valid order
        vm.startPrank(user);
        stablecoin.approve(address(escrow), amount * 2);
        escrow.placeOrder(vendor, amount, orderId);
        vm.stopPrank();

        // Deregister vendor
        vm.prank(address(this)); // Test contract is the owner
        vendorRegistry.deregisterVendor(vendor);

        // Try to place another order with deregistered vendor
        vm.startPrank(user);
        vm.expectRevert(abi.encodeWithSelector(Errors.UnauthorizedVendor.selector, vendor));
        escrow.placeOrder(vendor, amount, "order-2");
        vm.stopPrank();
    }

    function testRewardCalculationNoOverflow() public {
        // Test with a large but safe amount that won't overflow
        // max_uint256 / 100 to ensure safe percentage calculation
        uint256 safeAmount = type(uint256).max / 100;

        vm.startPrank(user);
        // Fund user with safe amount
        deal(address(stablecoin), user, safeAmount);
        stablecoin.approve(address(escrow), safeAmount);

        // Should not overflow when calculating 5% reward
        escrow.placeOrder(vendor, safeAmount, orderId);
        vm.stopPrank();

        // Verify reward was calculated correctly (5% of safeAmount)
        uint256 expectedReward = (safeAmount * 5) / 100;
        assertEq(chopToken.balanceOf(user), expectedReward);

        // Verify the reward calculation was done safely
        assertTrue(expectedReward <= safeAmount); // Reward should be less than principal
        assertTrue(expectedReward > 0); // Reward should be non-zero
    }

    function testRewardCalculationEdgeCases() public {
        // Test with minimum viable amount (1 USDC)
        uint256 minAmount = 1e18;

        vm.startPrank(user);
        deal(address(stablecoin), user, minAmount);
        stablecoin.approve(address(escrow), minAmount);

        // Should handle minimum amounts correctly
        escrow.placeOrder(vendor, minAmount, orderId);
        vm.stopPrank();

        // With 5% reward on 1e18, we should get 0.05e18 tokens
        uint256 expectedReward = (minAmount * 5) / 100;
        assertEq(chopToken.balanceOf(user), expectedReward);
        assertEq(expectedReward, 5e16); // 0.05 USDC in 18 decimals

        // Test that reward calculation is consistent
        assertTrue(expectedReward * 100 <= minAmount * 5);
        assertTrue(expectedReward > 0, "Reward should be non-zero for minimum amount");
    }

    function testCannotPlaceTooSmallOrder() public {
        uint256 tooSmallAmount = 1e17; // 0.1 USDC, less than minimum

        vm.startPrank(user);
        deal(address(stablecoin), user, tooSmallAmount);
        stablecoin.approve(address(escrow), tooSmallAmount);

        vm.expectRevert(abi.encodeWithSelector(Errors.InvalidAmount.selector, tooSmallAmount));
        escrow.placeOrder(vendor, tooSmallAmount, orderId);
        vm.stopPrank();
    }

    function testBatchDeregisterVendors() public {
        // Register multiple vendors
        address[] memory vendors = new address[](3);
        vendors[0] = address(0x10);
        vendors[1] = address(0x11);
        vendors[2] = address(0x12);

        for (uint256 i = 0; i < vendors.length; i++) {
            vm.prank(vendors[i]);
            vendorRegistry.registerVendor();
            assertTrue(vendorRegistry.isVendor(vendors[i]));
        }

        // Batch deregister
        vendorRegistry.batchDeregisterVendors(vendors);

        // Verify all vendors are deregistered
        for (uint256 i = 0; i < vendors.length; i++) {
            assertFalse(vendorRegistry.isVendor(vendors[i]));
        }
    }

    function testCannotBatchDeregisterEmptyArray() public {
        address[] memory emptyArray = new address[](0);
        vm.expectRevert(abi.encodeWithSelector(Errors.InvalidAmount.selector, 0));
        vendorRegistry.batchDeregisterVendors(emptyArray);
    }
}
