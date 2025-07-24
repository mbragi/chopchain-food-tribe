// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IDeliveryAgentRegistry.sol";
import "./interfaces/IErrors.sol";

/**
 * @title DeliveryAgentRegistry
 * @notice Registry for ChopChain delivery agents with verification and rating system
 */
contract DeliveryAgentRegistry is IDeliveryAgentRegistry, Ownable {
    mapping(address => DeliveryAgent) public deliveryAgents;
    mapping(address => bool) public override isDeliveryAgent;
    
    address[] public agentAddresses;
    uint256 public override getTotalAgents;

    // Only Escrow contract can update ratings
    address public escrowContract;

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Sets the escrow contract address (only owner)
     * @param _escrowContract The address of the escrow contract
     */
    function setEscrowContract(address _escrowContract) external onlyOwner {
        if (_escrowContract == address(0)) revert Errors.ZeroAddress();
        escrowContract = _escrowContract;
    }

    /**
     * @inheritdoc IDeliveryAgentRegistry
     */
    function registerDeliveryAgent() external override {
        if (isDeliveryAgent[msg.sender]) revert Errors.AlreadyRegistered(msg.sender);
        
        deliveryAgents[msg.sender] = DeliveryAgent({
            agent: msg.sender,
            isActive: true,
            totalDeliveries: 0,
            rating: 500, // Default 5.00 rating (scaled by 100)
            registeredAt: block.timestamp
        });
        
        isDeliveryAgent[msg.sender] = true;
        agentAddresses.push(msg.sender);
        getTotalAgents++;

        emit DeliveryAgentRegistered(msg.sender, block.timestamp);
    }

    /**
     * @inheritdoc IDeliveryAgentRegistry
     */
    function deregisterDeliveryAgent(address agent) external override onlyOwner {
        if (agent == address(0)) revert Errors.ZeroAddress();
        if (!isDeliveryAgent[agent]) revert Errors.NotRegistered(agent);

        isDeliveryAgent[agent] = false;
        delete deliveryAgents[agent];
        
        // Remove from agentAddresses array
        for (uint256 i = 0; i < agentAddresses.length; i++) {
            if (agentAddresses[i] == agent) {
                agentAddresses[i] = agentAddresses[agentAddresses.length - 1];
                agentAddresses.pop();
                break;
            }
        }
        
        getTotalAgents--;
        emit DeliveryAgentDeregistered(agent);
    }

    /**
     * @inheritdoc IDeliveryAgentRegistry
     */
    function setAgentStatus(bool isActive) external override {
        if (!isDeliveryAgent[msg.sender]) revert Errors.NotRegistered(msg.sender);
        
        deliveryAgents[msg.sender].isActive = isActive;
        emit DeliveryAgentStatusChanged(msg.sender, isActive);
    }

    /**
     * @inheritdoc IDeliveryAgentRegistry
     */
    function updateAgentRating(address agent, uint256 rating) external override {
        if (msg.sender != escrowContract) revert Errors.UnauthorizedCaller(msg.sender);
        if (!isDeliveryAgent[agent]) revert Errors.NotRegistered(agent);
        if (rating < 100 || rating > 500) revert Errors.InvalidAmount(rating); // 1.00 to 5.00 stars

        DeliveryAgent storage agentData = deliveryAgents[agent];
        
        // Calculate new average rating
        uint256 totalRatingPoints = agentData.rating * agentData.totalDeliveries;
        totalRatingPoints += rating;
        agentData.totalDeliveries++;
        agentData.rating = totalRatingPoints / agentData.totalDeliveries;

        emit DeliveryAgentRated(agent, agentData.rating, agentData.totalDeliveries);
    }

    /**
     * @inheritdoc IDeliveryAgentRegistry
     */
    function isAgentActive(address agent) external view override returns (bool status) {
        return isDeliveryAgent[agent] && deliveryAgents[agent].isActive;
    }

    /**
     * @inheritdoc IDeliveryAgentRegistry
     */
    function getDeliveryAgent(address agent) external view override returns (DeliveryAgent memory agentData) {
        if (!isDeliveryAgent[agent]) revert Errors.NotRegistered(agent);
        return deliveryAgents[agent];
    }

    /**
     * @notice Gets all active delivery agents
     * @return activeAgents Array of active delivery agent addresses
     */
    function getActiveAgents() external view returns (address[] memory activeAgents) {
        uint256 activeCount = 0;
        
        // First pass: count active agents
        for (uint256 i = 0; i < agentAddresses.length; i++) {
            if (deliveryAgents[agentAddresses[i]].isActive) {
                activeCount++;
            }
        }
        
        // Second pass: populate array
        activeAgents = new address[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < agentAddresses.length; i++) {
            if (deliveryAgents[agentAddresses[i]].isActive) {
                activeAgents[index] = agentAddresses[i];
                index++;
            }
        }
        
        return activeAgents;
    }

    /**
     * @notice Emergency batch deregistration of delivery agents (only owner)
     * @param agents Array of delivery agent addresses to deregister
     */
    function batchDeregisterAgents(address[] calldata agents) external onlyOwner {
        uint256 length = agents.length;
        if (length == 0) revert Errors.InvalidAmount(0);

        for (uint256 i = 0; i < length;) {
            address agent = agents[i];
            if (agent == address(0)) revert Errors.ZeroAddress();
            if (isDeliveryAgent[agent]) {
                isDeliveryAgent[agent] = false;
                delete deliveryAgents[agent];
                getTotalAgents--;
                emit DeliveryAgentDeregistered(agent);
            }
            unchecked {
                i++;
            }
        }
        
        // Rebuild agentAddresses array to remove deregistered agents
        address[] memory newAgentAddresses = new address[](getTotalAgents);
        uint256 index = 0;
        for (uint256 i = 0; i < agentAddresses.length; i++) {
            if (isDeliveryAgent[agentAddresses[i]]) {
                newAgentAddresses[index] = agentAddresses[i];
                index++;
            }
        }
        agentAddresses = newAgentAddresses;
    }
}