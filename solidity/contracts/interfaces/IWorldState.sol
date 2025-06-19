// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IWorldState {
    function createNewWorld() external returns (uint16);
    function setMediator(uint16 worldId, address newMediator) external;
    function setWorld(uint16 worldId, bytes32 key, bytes calldata value) external;
    function getWorld(uint16 worldId, bytes32 key) external view returns (bytes memory);
} 