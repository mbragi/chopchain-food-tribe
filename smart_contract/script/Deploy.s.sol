// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../src/CHOPToken.sol";
import "../src/Escrow.sol";
import "../src/VendorRegistry.sol";
import "../src/DeliveryAgentRegistry.sol";

// Mock Stablecoin for local deployment
contract MockStablecoin is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}

contract DeployScript {
    function run()
        external
        returns (
            address escrow,
            address chopToken,
            address vendorRegistry,
            address deliveryAgentRegistry,
            address stablecoin
        )
    {
        // Deploy Mock Stablecoin for local testing
        MockStablecoin mockStablecoin = new MockStablecoin();

        // Deploy VendorRegistry
        VendorRegistry registry = new VendorRegistry();

        // Deploy DeliveryAgentRegistry
        DeliveryAgentRegistry agentRegistry = new DeliveryAgentRegistry();

        // Deploy CHOPToken
        CHOPToken token = new CHOPToken();

        // Deploy Escrow with mock stablecoin
        Escrow escrowContract =
            new Escrow(address(mockStablecoin), address(token), address(registry), address(agentRegistry));

        // Set Escrow as minter for CHOPToken
        token.setMinter(address(escrowContract));

        // Set Escrow contract address in DeliveryAgentRegistry
        agentRegistry.setEscrowContract(address(escrowContract));

        // Return deployed addresses
        return (
            address(escrowContract), address(token), address(registry), address(agentRegistry), address(mockStablecoin)
        );
    }
}
