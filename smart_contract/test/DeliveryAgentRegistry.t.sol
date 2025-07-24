// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/DeliveryAgentRegistry.sol";
import "../src/interfaces/IErrors.sol";
import {Errors} from "../src/interfaces/IErrors.sol";

contract DeliveryAgentRegistryTest is Test {
    DeliveryAgentRegistry registry;
    
    address agent1 = address(0x1);
    address agent2 = address(0x2);
    address agent3 = address(0x3);
    address escrowContract = address(0x4);
    address unauthorized = address(0x5);

    function setUp() public {
        registry = new DeliveryAgentRegistry();
        registry.setEscrowContract(escrowContract);
    }

    function testRegisterDeliveryAgent() public {
        vm.prank(agent1);
        registry.registerDeliveryAgent();

        assertTrue(registry.isDeliveryAgent(agent1));
        assertTrue(registry.isAgentActive(agent1));
        assertEq(registry.getTotalAgents(), 1);

        // Verify agent details
        IDeliveryAgentRegistry.DeliveryAgent memory agent = registry.getDeliveryAgent(agent1);
        assertEq(agent.agent, agent1);
        assertTrue(agent.isActive);
        assertEq(agent.totalDeliveries, 0);
        assertEq(agent.rating, 500); // Default 5.00 rating
        assertGt(agent.registeredAt, 0);
    }

    function testCannotRegisterTwice() public {
        vm.startPrank(agent1);
        registry.registerDeliveryAgent();
        
        vm.expectRevert(abi.encodeWithSelector(Errors.AlreadyRegistered.selector, agent1));
        registry.registerDeliveryAgent();
        vm.stopPrank();
    }

    function testSetAgentStatus() public {
        // Register agent first
        vm.prank(agent1);
        registry.registerDeliveryAgent();

        // Set to inactive
        vm.prank(agent1);
        registry.setAgentStatus(false);

        assertFalse(registry.isAgentActive(agent1));
        assertTrue(registry.isDeliveryAgent(agent1)); // Still registered

        // Set back to active
        vm.prank(agent1);
        registry.setAgentStatus(true);

        assertTrue(registry.isAgentActive(agent1));
    }

    function testUnregisteredCannotSetStatus() public {
        vm.prank(agent1);
        vm.expectRevert(abi.encodeWithSelector(Errors.NotRegistered.selector, agent1));
        registry.setAgentStatus(false);
    }

    function testOnlyEscrowCanUpdateRating() public {
        // Register agent
        vm.prank(agent1);
        registry.registerDeliveryAgent();

        // Only escrow contract can update rating
        vm.prank(escrowContract);
        registry.updateAgentRating(agent1, 450);

        IDeliveryAgentRegistry.DeliveryAgent memory agent = registry.getDeliveryAgent(agent1);
        assertEq(agent.rating, 450);
        assertEq(agent.totalDeliveries, 1);
    }

    function testUnauthorizedCannotUpdateRating() public {
        vm.prank(agent1);
        registry.registerDeliveryAgent();

        vm.prank(unauthorized);
        vm.expectRevert(abi.encodeWithSelector(Errors.UnauthorizedCaller.selector, unauthorized));
        registry.updateAgentRating(agent1, 450);
    }

    function testRatingValidation() public {
        vm.prank(agent1);
        registry.registerDeliveryAgent();

        // Test invalid ratings
        vm.startPrank(escrowContract);
        
        // Too low
        vm.expectRevert(abi.encodeWithSelector(Errors.InvalidAmount.selector, 50));
        registry.updateAgentRating(agent1, 50);

        // Too high
        vm.expectRevert(abi.encodeWithSelector(Errors.InvalidAmount.selector, 600));
        registry.updateAgentRating(agent1, 600);
        
        vm.stopPrank();
    }

    function testRatingCalculation() public {
        vm.prank(agent1);
        registry.registerDeliveryAgent();

        vm.startPrank(escrowContract);
        
        // First rating: 4.5 stars (450)
        registry.updateAgentRating(agent1, 450);
        IDeliveryAgentRegistry.DeliveryAgent memory agent = registry.getDeliveryAgent(agent1);
        assertEq(agent.rating, 450);
        assertEq(agent.totalDeliveries, 1);

        // Second rating: 5.0 stars (500)
        // Average should be (450 + 500) / 2 = 475
        registry.updateAgentRating(agent1, 500);
        agent = registry.getDeliveryAgent(agent1);
        assertEq(agent.rating, 475);
        assertEq(agent.totalDeliveries, 2);

        // Third rating: 3.0 stars (300)
        // Average should be (450 + 500 + 300) / 3 = 416.67 = 416 (rounded down)
        registry.updateAgentRating(agent1, 300);
        agent = registry.getDeliveryAgent(agent1);
        assertEq(agent.rating, 416);
        assertEq(agent.totalDeliveries, 3);
        
        vm.stopPrank();
    }

    function testDeregisterAgent() public {
        // Register multiple agents
        vm.prank(agent1);
        registry.registerDeliveryAgent();
        vm.prank(agent2);
        registry.registerDeliveryAgent();

        assertEq(registry.getTotalAgents(), 2);

        // Owner can deregister
        registry.deregisterDeliveryAgent(agent1);

        assertFalse(registry.isDeliveryAgent(agent1));
        assertTrue(registry.isDeliveryAgent(agent2));
        assertEq(registry.getTotalAgents(), 1);
    }

    function testCannotDeregisterUnregistered() public {
        vm.expectRevert(abi.encodeWithSelector(Errors.NotRegistered.selector, agent1));
        registry.deregisterDeliveryAgent(agent1);
    }

    function testCannotDeregisterZeroAddress() public {
        vm.expectRevert(abi.encodeWithSelector(Errors.ZeroAddress.selector));
        registry.deregisterDeliveryAgent(address(0));
    }

    function testOnlyOwnerCanDeregister() public {
        vm.prank(agent1);
        registry.registerDeliveryAgent();

        vm.prank(unauthorized);
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("OwnableUnauthorizedAccount(address)")), unauthorized));
        registry.deregisterDeliveryAgent(agent1);
    }

    function testGetActiveAgents() public {
        // Register agents
        vm.prank(agent1);
        registry.registerDeliveryAgent();
        vm.prank(agent2);
        registry.registerDeliveryAgent();
        vm.prank(agent3);
        registry.registerDeliveryAgent();

        // Deactivate one agent
        vm.prank(agent2);
        registry.setAgentStatus(false);

        address[] memory activeAgents = registry.getActiveAgents();
        assertEq(activeAgents.length, 2);
        
        // Check that only active agents are returned
        bool foundAgent1 = false;
        bool foundAgent3 = false;
        bool foundAgent2 = false;
        
        for (uint256 i = 0; i < activeAgents.length; i++) {
            if (activeAgents[i] == agent1) foundAgent1 = true;
            if (activeAgents[i] == agent2) foundAgent2 = true;
            if (activeAgents[i] == agent3) foundAgent3 = true;
        }
        
        assertTrue(foundAgent1);
        assertTrue(foundAgent3);
        assertFalse(foundAgent2); // Should not be in active list
    }

    function testBatchDeregisterAgents() public {
        // Register agents
        vm.prank(agent1);
        registry.registerDeliveryAgent();
        vm.prank(agent2);
        registry.registerDeliveryAgent();
        vm.prank(agent3);
        registry.registerDeliveryAgent();

        assertEq(registry.getTotalAgents(), 3);

        // Batch deregister
        address[] memory agentsToDeregister = new address[](2);
        agentsToDeregister[0] = agent1;
        agentsToDeregister[1] = agent3;

        registry.batchDeregisterAgents(agentsToDeregister);

        assertFalse(registry.isDeliveryAgent(agent1));
        assertTrue(registry.isDeliveryAgent(agent2));
        assertFalse(registry.isDeliveryAgent(agent3));
        assertEq(registry.getTotalAgents(), 1);
    }

    function testBatchDeregisterEmptyArray() public {
        address[] memory emptyArray = new address[](0);
        vm.expectRevert(abi.encodeWithSelector(Errors.InvalidAmount.selector, 0));
        registry.batchDeregisterAgents(emptyArray);
    }

    function testBatchDeregisterWithZeroAddress() public {
        address[] memory agentsWithZero = new address[](2);
        agentsWithZero[0] = agent1;
        agentsWithZero[1] = address(0);

        vm.expectRevert(abi.encodeWithSelector(Errors.ZeroAddress.selector));
        registry.batchDeregisterAgents(agentsWithZero);
    }

    function testBatchDeregisterSkipsUnregistered() public {
        // Register only one agent
        vm.prank(agent1);
        registry.registerDeliveryAgent();

        // Try to batch deregister including unregistered agent
        address[] memory agents = new address[](2);
        agents[0] = agent1;
        agents[1] = agent2; // Not registered

        registry.batchDeregisterAgents(agents);

        // agent1 should be deregistered, agent2 was never registered
        assertFalse(registry.isDeliveryAgent(agent1));
        assertFalse(registry.isDeliveryAgent(agent2));
        assertEq(registry.getTotalAgents(), 0);
    }

    function testCannotGetUnregisteredAgentDetails() public {
        vm.expectRevert(abi.encodeWithSelector(Errors.NotRegistered.selector, agent1));
        registry.getDeliveryAgent(agent1);
    }

    function testCannotUpdateRatingForUnregisteredAgent() public {
        vm.prank(escrowContract);
        vm.expectRevert(abi.encodeWithSelector(Errors.NotRegistered.selector, agent1));
        registry.updateAgentRating(agent1, 450);
    }

    function testSetEscrowContract() public {
        address newEscrow = address(0x6);
        registry.setEscrowContract(newEscrow);

        // Verify old escrow can't update ratings
        vm.prank(agent1);
        registry.registerDeliveryAgent();

        vm.prank(escrowContract);
        vm.expectRevert(abi.encodeWithSelector(Errors.UnauthorizedCaller.selector, escrowContract));
        registry.updateAgentRating(agent1, 450);

        // Verify new escrow can update ratings
        vm.prank(newEscrow);
        registry.updateAgentRating(agent1, 450);

        IDeliveryAgentRegistry.DeliveryAgent memory agent = registry.getDeliveryAgent(agent1);
        assertEq(agent.rating, 450);
    }

    function testOnlyOwnerCanSetEscrowContract() public {
        vm.prank(unauthorized);
        vm.expectRevert(abi.encodeWithSelector(bytes4(keccak256("OwnableUnauthorizedAccount(address)")), unauthorized));
        registry.setEscrowContract(address(0x6));
    }

    function testCannotSetZeroEscrowContract() public {
        vm.expectRevert(abi.encodeWithSelector(Errors.ZeroAddress.selector));
        registry.setEscrowContract(address(0));
    }

    function testAgentRegistrationEvents() public {
        vm.prank(agent1);
        vm.expectEmit(true, false, false, true);
        emit IDeliveryAgentRegistry.DeliveryAgentRegistered(agent1, block.timestamp);
        registry.registerDeliveryAgent();
    }

    function testAgentDeregistrationEvents() public {
        vm.prank(agent1);
        registry.registerDeliveryAgent();

        vm.expectEmit(true, false, false, false);
        emit IDeliveryAgentRegistry.DeliveryAgentDeregistered(agent1);
        registry.deregisterDeliveryAgent(agent1);
    }

    function testAgentStatusChangeEvents() public {
        vm.prank(agent1);
        registry.registerDeliveryAgent();

        vm.prank(agent1);
        vm.expectEmit(true, false, false, true);
        emit IDeliveryAgentRegistry.DeliveryAgentStatusChanged(agent1, false);
        registry.setAgentStatus(false);
    }

    function testAgentRatingEvents() public {
        vm.prank(agent1);
        registry.registerDeliveryAgent();

        vm.prank(escrowContract);
        vm.expectEmit(true, false, false, true);
        emit IDeliveryAgentRegistry.DeliveryAgentRated(agent1, 450, 1);
        registry.updateAgentRating(agent1, 450);
    }
}