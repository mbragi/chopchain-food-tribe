// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IDeliveryAgentRegistry
 * @notice Interface for the ChopChain DeliveryAgentRegistry contract that manages delivery agent registration and verification
 */
interface IDeliveryAgentRegistry {
    /**
     * @notice Delivery agent struct containing all agent information
     * @param agent The address of the delivery agent
     * @param isActive Whether the agent is currently active and accepting orders
     * @param totalDeliveries The total number of completed deliveries
     * @param rating The agent's average rating (scaled by 100, e.g., 450 = 4.50)
     * @param registeredAt Timestamp when the agent registered
     */
    struct DeliveryAgent {
        address agent;
        bool isActive;
        uint256 totalDeliveries;
        uint256 rating;
        uint256 registeredAt;
    }

    /**
     * @notice Emitted when a new delivery agent is registered
     * @param agent The address of the registered delivery agent
     * @param timestamp The registration timestamp
     */
    event DeliveryAgentRegistered(address indexed agent, uint256 timestamp);

    /**
     * @notice Emitted when a delivery agent is deregistered
     * @param agent The address of the deregistered delivery agent
     */
    event DeliveryAgentDeregistered(address indexed agent);

    /**
     * @notice Emitted when a delivery agent's status changes
     * @param agent The address of the delivery agent
     * @param isActive Whether the agent is now active
     */
    event DeliveryAgentStatusChanged(address indexed agent, bool isActive);

    /**
     * @notice Emitted when a delivery agent's rating is updated
     * @param agent The address of the delivery agent
     * @param newRating The new rating
     * @param totalDeliveries Updated total deliveries count
     */
    event DeliveryAgentRated(address indexed agent, uint256 newRating, uint256 totalDeliveries);

    /**
     * @notice Registers the caller as a delivery agent
     */
    function registerDeliveryAgent() external;

    /**
     * @notice Deregisters a delivery agent (only owner can call)
     * @param agent The address of the delivery agent to deregister
     */
    function deregisterDeliveryAgent(address agent) external;

    /**
     * @notice Toggles the active status of a delivery agent
     * @param isActive Whether the agent should be active
     */
    function setAgentStatus(bool isActive) external;

    /**
     * @notice Updates a delivery agent's rating after a completed delivery
     * @param agent The address of the delivery agent
     * @param rating The rating to add (1-5 stars, scaled by 100)
     */
    function updateAgentRating(address agent, uint256 rating) external;

    /**
     * @notice Checks if an address is a registered delivery agent
     * @param agent The address to check
     * @return status True if the address is a registered delivery agent
     */
    function isDeliveryAgent(address agent) external view returns (bool status);

    /**
     * @notice Checks if a delivery agent is currently active
     * @param agent The address to check
     * @return status True if the agent is active and accepting orders
     */
    function isAgentActive(address agent) external view returns (bool status);

    /**
     * @notice Gets the details of a delivery agent
     * @param agent The address of the delivery agent
     * @return agentData The delivery agent struct
     */
    function getDeliveryAgent(address agent) external view returns (DeliveryAgent memory agentData);

    /**
     * @notice Gets the total number of registered delivery agents
     * @return count The total count of registered agents
     */
    function getTotalAgents() external view returns (uint256 count);
}