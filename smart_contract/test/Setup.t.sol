// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../src/Escrow.sol";
import "../src/CHOPToken.sol";
import "../src/VendorRegistry.sol";
import "../src/DeliveryAgentRegistry.sol";

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
    DeliveryAgentRegistry deliveryAgentRegistry;
    MockStablecoin stablecoin;

    address user = address(0x1);
    address vendor = address(0x2);
    address deliveryAgent = address(0x3);
    string orderId = "order-1";
    uint256 amount = 100 * 10**18; // 100 USDC

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

    function testIntegrationPlaceOrderAndMintReward() public {
        vm.startPrank(user);
        
        // Approve and place order
        stablecoin.approve(address(escrow), amount);
        escrow.placeOrder(vendor, amount, orderId);

        // Verify order stored correctly
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
        assertEq(storedDeliveryAgent, address(0)); // Not assigned yet
        assertEq(storedAmount, amount);
        assertEq(confirmed, false);
        assertEq(refunded, false);
        assertEq(paid, false);
        assertEq(assignedAt, 0);

        // Verify CHOP rewards minted
        uint256 expectedReward = (amount * 5) / 100; // 5% reward
        assertEq(chopToken.balanceOf(user), expectedReward);

        // Confirm delivery and verify vendor payment
        escrow.confirmDelivery(orderId);
        assertEq(stablecoin.balanceOf(vendor), amount);
        
        vm.stopPrank();
    }

    function testIntegrationWithDeliveryAgent() public {
        vm.startPrank(user);
        
        // Place order
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

        // Start delivery
        vm.prank(deliveryAgent);
        escrow.startDelivery(orderId);

        // Delivery agent confirms delivery
        vm.prank(deliveryAgent);
        escrow.confirmDelivery(orderId);

        // Verify vendor payment
        assertEq(stablecoin.balanceOf(vendor), amount);

        // Test rating system
        vm.prank(user);
        escrow.rateDeliveryAgent(orderId, 450); // 4.5 stars

        // Verify agent rating updated
        IDeliveryAgentRegistry.DeliveryAgent memory agent = deliveryAgentRegistry.getDeliveryAgent(deliveryAgent);
        assertEq(agent.totalDeliveries, 1);
        assertEq(agent.rating, 450); // First rating becomes the rating
    }
}
