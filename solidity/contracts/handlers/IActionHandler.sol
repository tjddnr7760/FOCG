// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IActionHandler {
    function handle(bytes calldata payload) external returns (bytes memory);
} 