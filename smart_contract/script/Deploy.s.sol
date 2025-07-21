// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "../src/CHOPToken.sol";
import "../src/Escrow.sol";
import "../src/VendorRegistry.sol";

contract DeployScript {
    function run() external returns (address escrow, address chopToken, address vendorRegistry) {
        // Deploy VendorRegistry
        VendorRegistry registry = new VendorRegistry();
        // Deploy CHOPToken
        CHOPToken token = new CHOPToken();
        // Deploy Escrow with addresses of stablecoin, chopToken, and vendorRegistry
        // For deployment, you would use a real stablecoin address. Here, we use address(0) as a placeholder.
        address stablecoin = address(0); // TODO: Replace with actual stablecoin address
        Escrow escrowContract = new Escrow(stablecoin, address(token), address(registry));
        // Set Escrow as minter for CHOPToken
        token.setMinter(address(escrowContract));
        // Return deployed addresses
        return (address(escrowContract), address(token), address(registry));
    }
}
