// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IWorldState {
    function createNewWorld() external returns (uint16);
    function setWorld(uint256 worldId, bytes32 key, bytes calldata value) external;
    function getWorld(uint256 worldId, bytes32 key) external view returns (bytes memory);
} 