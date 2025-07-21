// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IVendorRegistry
 * @notice Interface for the ChopChain VendorRegistry contract that manages vendor registration
 */
interface IVendorRegistry {
    /**
     * @notice Emitted when a new vendor is registered
     * @param vendor The address of the registered vendor
     */
    event VendorRegistered(address indexed vendor);

    /**
     * @notice Emitted when a vendor is deregistered
     * @param vendor The address of the deregistered vendor
     */
    event VendorDeregistered(address indexed vendor);

    /**
     * @notice Registers the caller as a vendor
     */
    function registerVendor() external;

    /**
     * @notice Deregisters a vendor
     * @param vendor The address of the vendor to deregister
     */
    function deregisterVendor(address vendor) external;

    /**
     * @notice Checks if an address is a registered vendor
     * @param vendor The address to check
     * @return status True if the address is a registered vendor
     */
    function isVendor(address vendor) external view returns (bool status);
}
