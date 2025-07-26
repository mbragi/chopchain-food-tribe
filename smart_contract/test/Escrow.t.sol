// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../src/Escrow.sol";
import "../src/CHOPToken.sol";
import "../src/VendorRegistry.sol";
import "../src/DeliveryAgentRegistry.sol";
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
    DeliveryAgentRegistry deliveryAgentRegistry;
    MockStablecoin stablecoin;

    // Error selector for OpenZeppelin's ERC20InsufficientAllowance
    bytes4 constant ERC20_INSUFFICIENT_ALLOWANCE_SELECTOR = 0x1086541f;

    address user = address(0x1);
    address vendor = address(0x2);
    address deliveryAgent = address(0x3);
    address unauthorizedAgent = address(0x4);
    string orderId = "order-1";
    uint256 amount = 1e18; // 1 USDC

    function setUp() public {
        // Deploy contracts
        stablecoin = new MockStablecoin();
        chopToken = new CHOPToken();
        vendorRegistry = new VendorRegistry();
        deliveryAgentRegistry = new DeliveryAgentRegistry();
        escrow = new Escrow(
            address(stablecoin), 
            address(chopToken), 
            address(vendorRegistry),
            address(deliveryAgentRegistry)
        );

        // Setup permissions
        chopToken.setMinter(address(escrow));
        deliveryAgentRegistry.setEscrowContract(address(escrow));
        vendorRegistry.setEscrowContract(address(escrow));

        // Register vendor
        vm.prank(vendor);
        string[] memory cuisineTypes = new string[](2);
        cuisineTypes[0] = "Nigerian";
        cuisineTypes[1] = "African";
        vendorRegistry.registerVendor(
            "Test Kitchen",
            "Test description",
            cuisineTypes,
            "+234 801 234 5678",
            "test@chopchain.com",
            "Test Address",
            10, // delivery radius
            5 * 1e18, // minimum order
            2 * 1e18, // delivery fee
            30 // preparation time
        );

        // Register delivery agent
        vm.prank(deliveryAgent);
        deliveryAgentRegistry.registerDeliveryAgent();

        // Fund user with stablecoin
        stablecoin.transfer(user, amount * 2);
    }

    function testPlaceOrderStoresOrder() public {
        vm.startPrank(user);
        stablecoin.approve(address(escrow), amount);
        escrow.placeOrder(vendor, amount, orderId);
        vm.stopPrank();

        (
            address storedUser, 
            address storedVendor, 
            address storedDeliveryAgent,
            uint256 storedAmount, 
            bool confirmed, 
            bool refunded, 
            bool paid,
            uint256 assignedAt
        ) = escrow.getOrder(orderId);

        assertEq(storedUser, user);
        assertEq(storedVendor, vendor);
        assertEq(storedDeliveryAgent, address(0));
        assertEq(storedAmount, amount);
        assertEq(confirmed, false);
        assertEq(refunded, false);
        assertEq(paid, false);
        assertEq(assignedAt, 0);

        // Check CHOP rewards
        uint256 expectedReward = (amount * 5) / 100; // 5% reward
        assertEq(chopToken.balanceOf(user), expectedReward);

        // Check order is in unassigned list
        string[] memory unassignedOrders = escrow.getUnassignedOrders();
        assertEq(unassignedOrders.length, 1);
        assertEq(unassignedOrders[0], orderId);
    }

    function testAssignDeliveryAgent() public {
        // Place order
        vm.startPrank(user);
        stablecoin.approve(address(escrow), amount);
        escrow.placeOrder(vendor, amount, orderId);
        vm.stopPrank();

        // Assign delivery agent
        vm.prank(deliveryAgent);
        escrow.assignDeliveryAgent(orderId);

        // Verify assignment
        (,, address assignedAgent,,,,, uint256 assignedAt) = escrow.getOrder(orderId);
        assertEq(assignedAgent, deliveryAgent);
        assertGt(assignedAt, 0);

        // Check order moved from unassigned to agent orders
        string[] memory unassignedOrders = escrow.getUnassignedOrders();
        assertEq(unassignedOrders.length, 0);

        string[] memory agentOrders = escrow.getAgentOrders(deliveryAgent);
        assertEq(agentOrders.length, 1);
        assertEq(agentOrders[0], orderId);
    }

    function testUnauthorizedAgentCannotAssign() public {
        // Place order
        vm.startPrank(user);
        stablecoin.approve(address(escrow), amount);
        escrow.placeOrder(vendor, amount, orderId);
        vm.stopPrank();

        // Try to assign with unauthorized agent
        vm.prank(unauthorizedAgent);
        vm.expectRevert(abi.encodeWithSelector(Errors.UnauthorizedCaller.selector, unauthorizedAgent));
        escrow.assignDeliveryAgent(orderId);
    }

    function testInactiveAgentCannotAssign() public {
        // Register but deactivate agent
        vm.prank(unauthorizedAgent);
        deliveryAgentRegistry.registerDeliveryAgent();
        
        vm.prank(unauthorizedAgent);
        deliveryAgentRegistry.setAgentStatus(false);

        // Place order
        vm.startPrank(user);
        stablecoin.approve(address(escrow), amount);
        escrow.placeOrder(vendor, amount, orderId);
        vm.stopPrank();

        // Try to assign with inactive agent
        vm.prank(unauthorizedAgent);
        vm.expectRevert(abi.encodeWithSelector(Errors.UnauthorizedCaller.selector, unauthorizedAgent));
        escrow.assignDeliveryAgent(orderId);
    }

    function testStartDelivery() public {
        // Place and assign order
        vm.startPrank(user);
        stablecoin.approve(address(escrow), amount);
        escrow.placeOrder(vendor, amount, orderId);
        vm.stopPrank();

        vm.prank(deliveryAgent);
        escrow.assignDeliveryAgent(orderId);

        // Start delivery
        vm.prank(deliveryAgent);
        vm.expectEmit(true, false, false, false);
        emit IEscrow.DeliveryStarted(orderId, deliveryAgent);
        escrow.startDelivery(orderId);
    }

    function testOnlyAssignedAgentCanStartDelivery() public {
        // Place and assign order to one agent
        vm.startPrank(user);
        stablecoin.approve(address(escrow), amount);
        escrow.placeOrder(vendor, amount, orderId);
        vm.stopPrank();

        vm.prank(deliveryAgent);
        escrow.assignDeliveryAgent(orderId);

        // Try to start delivery with different agent
        vm.prank(unauthorizedAgent);
        vm.expectRevert(abi.encodeWithSelector(Errors.UnauthorizedCaller.selector, unauthorizedAgent));
        escrow.startDelivery(orderId);
    }

    function testConfirmDeliveryByCustomer() public {
        vm.startPrank(user);
        stablecoin.approve(address(escrow), amount);
        escrow.placeOrder(vendor, amount, orderId);
        escrow.confirmDelivery(orderId);
        vm.stopPrank();

        (,,,, bool confirmed, bool refunded, bool paid,) = escrow.getOrder(orderId);
        assertEq(confirmed, true);
        assertEq(paid, true);
        assertEq(stablecoin.balanceOf(vendor), amount);
    }

    function testConfirmDeliveryByAgent() public {
        // Place and assign order
        vm.startPrank(user);
        stablecoin.approve(address(escrow), amount);
        escrow.placeOrder(vendor, amount, orderId);
        vm.stopPrank();

        vm.prank(deliveryAgent);
        escrow.assignDeliveryAgent(orderId);

        // Delivery agent confirms
        vm.prank(deliveryAgent);
        escrow.confirmDelivery(orderId);

        (,,,, bool confirmed, bool refunded, bool paid,) = escrow.getOrder(orderId);
        assertEq(confirmed, true);
        assertEq(paid, true);
        assertEq(stablecoin.balanceOf(vendor), amount);
    }

    function testUnauthorizedCannotConfirmDelivery() public {
        // Place and assign order
        vm.startPrank(user);
        stablecoin.approve(address(escrow), amount);
        escrow.placeOrder(vendor, amount, orderId);
        vm.stopPrank();

        vm.prank(deliveryAgent);
        escrow.assignDeliveryAgent(orderId);

        // Try to confirm with unauthorized address
        vm.prank(unauthorizedAgent);
        vm.expectRevert(abi.encodeWithSelector(Errors.UnauthorizedCaller.selector, unauthorizedAgent));
        escrow.confirmDelivery(orderId);
    }

    function testRateDeliveryAgent() public {
        // Complete full delivery flow
        vm.startPrank(user);
        stablecoin.approve(address(escrow), amount);
        escrow.placeOrder(vendor, amount, orderId);
        vm.stopPrank();

        vm.prank(deliveryAgent);
        escrow.assignDeliveryAgent(orderId);

        vm.prank(deliveryAgent);
        escrow.confirmDelivery(orderId);

        // Rate the delivery agent
        vm.prank(user);
        escrow.rateDeliveryAgent(orderId, 450); // 4.5 stars

        // Verify rating was recorded
        IDeliveryAgentRegistry.DeliveryAgent memory agent = deliveryAgentRegistry.getDeliveryAgent(deliveryAgent);
        assertEq(agent.totalDeliveries, 1);
        assertEq(agent.rating, 450);
    }

    function testCannotRateBeforeDelivery() public {
        vm.startPrank(user);
        stablecoin.approve(address(escrow), amount);
        escrow.placeOrder(vendor, amount, orderId);

        vm.expectRevert(abi.encodeWithSelector(Errors.InvalidAmount.selector, 0));
        escrow.rateDeliveryAgent(orderId, 450);
        vm.stopPrank();
    }

    function testCannotRateWithInvalidRating() public {
        // Complete delivery with assigned agent
        vm.startPrank(user);
        stablecoin.approve(address(escrow), amount);
        escrow.placeOrder(vendor, amount, orderId);
        vm.stopPrank();

        // Assign delivery agent
        vm.prank(deliveryAgent);
        escrow.assignDeliveryAgent(orderId);

        // Confirm delivery
        vm.prank(deliveryAgent);
        escrow.confirmDelivery(orderId);

        // Try invalid ratings
        vm.startPrank(user);
        vm.expectRevert(abi.encodeWithSelector(Errors.InvalidAmount.selector, 50)); // Too low
        escrow.rateDeliveryAgent(orderId, 50);

        vm.expectRevert(abi.encodeWithSelector(Errors.InvalidAmount.selector, 600)); // Too high
        escrow.rateDeliveryAgent(orderId, 600);
        vm.stopPrank();
    }

    function testRefundRemovesFromUnassignedOrders() public {
        vm.startPrank(user);
        stablecoin.approve(address(escrow), amount);
        escrow.placeOrder(vendor, amount, orderId);

        // Verify order in unassigned list
        string[] memory unassignedOrders = escrow.getUnassignedOrders();
        assertEq(unassignedOrders.length, 1);

        uint256 initialBalance = stablecoin.balanceOf(user);
        escrow.refund(orderId);

        // Verify refund received
        assertEq(stablecoin.balanceOf(user), initialBalance + amount);

        // Verify order removed from unassigned list
        unassignedOrders = escrow.getUnassignedOrders();
        assertEq(unassignedOrders.length, 0);
        vm.stopPrank();
    }

    function testCannotAssignAlreadyAssignedOrder() public {
        // Place and assign order
        vm.startPrank(user);
        stablecoin.approve(address(escrow), amount);
        escrow.placeOrder(vendor, amount, orderId);
        vm.stopPrank();

        vm.prank(deliveryAgent);
        escrow.assignDeliveryAgent(orderId);

        // Try to assign again
        vm.prank(deliveryAgent);
        vm.expectRevert(abi.encodeWithSelector(Errors.AlreadyConfirmed.selector, orderId));
        escrow.assignDeliveryAgent(orderId);
    }

    function testCannotAssignRefundedOrder() public {
        vm.startPrank(user);
        stablecoin.approve(address(escrow), amount);
        escrow.placeOrder(vendor, amount, orderId);
        escrow.refund(orderId);
        vm.stopPrank();

        vm.prank(deliveryAgent);
        vm.expectRevert(abi.encodeWithSelector(Errors.AlreadyPaid.selector, orderId));
        escrow.assignDeliveryAgent(orderId);
    }

    // Original tests updated for new getOrder signature
    function testRefundOnlyOnce() public {
        vm.startPrank(user);
        stablecoin.approve(address(escrow), amount);
        escrow.placeOrder(vendor, amount, orderId);

        uint256 initialBalance = stablecoin.balanceOf(user);
        escrow.refund(orderId);
        assertEq(stablecoin.balanceOf(user), initialBalance + amount);

        vm.expectRevert(abi.encodeWithSelector(Errors.AlreadyRefunded.selector, orderId));
        escrow.refund(orderId);
        vm.stopPrank();
    }

    function testInvalidOrderIdReverts() public {
        vm.expectRevert(abi.encodeWithSelector(Errors.OrderNotFound.selector, "invalid"));
        escrow.getOrder("invalid");
    }

    function testUnauthorizedVendorReverts() public {
        address unauthorizedVendor = address(0x5);

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
        address poorUser = address(0x6);
        vm.startPrank(poorUser);
        stablecoin.approve(address(escrow), amount);
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

    function testCannotPlaceTooSmallOrder() public {
        uint256 tooSmallAmount = 1e17; // 0.1 USDC, less than minimum

        vm.startPrank(user);
        deal(address(stablecoin), user, tooSmallAmount);
        stablecoin.approve(address(escrow), tooSmallAmount);

        vm.expectRevert(abi.encodeWithSelector(Errors.InvalidAmount.selector, tooSmallAmount));
        escrow.placeOrder(vendor, tooSmallAmount, orderId);
        vm.stopPrank();
    }
}
