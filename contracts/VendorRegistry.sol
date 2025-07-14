// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VendorRegistry {
    mapping(address => bool) public isVendor;

    event VendorRegistered(address indexed vendor);

    function registerVendor() external {
        require(!isVendor[msg.sender], "Already registered");
        isVendor[msg.sender] = true;
        emit VendorRegistered(msg.sender);
    }
}
