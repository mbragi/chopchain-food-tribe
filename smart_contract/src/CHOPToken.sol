// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ICHOPToken.sol";
import "./interfaces/IErrors.sol";

/**
 * @title CHOPToken
 * @notice ChopChain's reward token implementation
 */
contract CHOPToken is ERC20, Ownable, ICHOPToken {
    address public override minter;

    constructor() ERC20("CHOP Token", "CHOP") Ownable(msg.sender) {}

    /**
     * @notice Sets the minter address that can mint new tokens
     * @param _minter The address to set as minter
     */
    function setMinter(address _minter) external override onlyOwner {
        if (_minter == address(0)) revert Errors.ZeroAddress();
        minter = _minter;
    }

    /**
     * @notice Mints new tokens to the specified address
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) external override {
        if (msg.sender != minter) revert Errors.NotMinter(msg.sender);
        if (to == address(0)) revert Errors.ZeroAddress();
        if (amount == 0) revert Errors.InvalidAmount(amount);
        _mint(to, amount);
    }
}
