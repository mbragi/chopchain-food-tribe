// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IVendorRegistry.sol";
import "./interfaces/IErrors.sol";

/**
 * @title VendorRegistry
 * @notice Registry for ChopChain vendors with verification
 */
contract VendorRegistry is IVendorRegistry, Ownable {
    mapping(address => bool) public override isVendor;

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Registers the caller as a vendor
     */
    function registerVendor() external override {
        if (isVendor[msg.sender]) revert Errors.AlreadyRegistered(msg.sender);
        isVendor[msg.sender] = true;
        emit VendorRegistered(msg.sender);
    }

    /**
     * @notice Deregisters a vendor (only owner can call)
     * @param vendor The address of the vendor to deregister
     */
    function deregisterVendor(address vendor) external override onlyOwner {
        if (vendor == address(0)) revert Errors.ZeroAddress();
        if (!isVendor[vendor]) revert Errors.NotRegistered(vendor);

        isVendor[vendor] = false;
        emit VendorDeregistered(vendor);
    }

    /**
     * @notice Emergency deregistration of multiple vendors (only owner)
     * @param vendors Array of vendor addresses to deregister
     */
    function batchDeregisterVendors(address[] calldata vendors) external onlyOwner {
        uint256 length = vendors.length;
        if (length == 0) revert Errors.InvalidAmount(0);

        for (uint256 i = 0; i < length;) {
            address vendor = vendors[i];
            if (vendor == address(0)) revert Errors.ZeroAddress();
            if (isVendor[vendor]) {
                isVendor[vendor] = false;
                emit VendorDeregistered(vendor);
            }
            unchecked {
                // Safe because i < length and length is bounded by calldata size
                i++;
            }
        }
    }
}
