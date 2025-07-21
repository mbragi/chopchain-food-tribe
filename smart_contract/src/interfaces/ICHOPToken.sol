// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title ICHOPToken
 * @notice Interface for the ChopChain reward token (CHOP)
 */
interface ICHOPToken is IERC20 {
    /**
     * @notice Sets the minter address that can mint new tokens
     * @param minter The address to set as minter
     */
    function setMinter(address minter) external;

    /**
     * @notice Mints new tokens to the specified address
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) external;

    /**
     * @notice Gets the current minter address
     * @return The address of the current minter
     */
    function minter() external view returns (address);
}
