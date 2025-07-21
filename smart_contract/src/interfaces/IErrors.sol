// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IErrors
 * @notice Shared error definitions for the ChopChain protocol
 */
library Errors {
    // Order errors
    error OrderAlreadyExists(string orderId);
    error OrderNotFound(string orderId);
    error InvalidAmount(uint256 amount);
    error DuplicateOrderId(string orderId);

    // Authorization errors
    error NotOrderUser(address caller, address expectedUser);
    error UnauthorizedVendor(address vendor);
    error NotMinter(address caller);
    error NotOwner(address caller);
    error UnauthorizedCaller(address caller);

    // State errors
    error AlreadyConfirmed(string orderId);
    error AlreadyRefunded(string orderId);
    error AlreadyPaid(string orderId);
    error AlreadyRegistered(address vendor);
    error NotRegistered(address vendor);

    // Operation errors
    error PaymentFailed(address token, address from, address to, uint256 amount);
    error MintFailed(address token, address to, uint256 amount);
    error TransferFailed(address token, address to, uint256 amount);
    error InvalidAddress(address invalidAddress);
    error ZeroAddress();
}
