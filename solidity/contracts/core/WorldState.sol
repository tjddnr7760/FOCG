// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IWorldState.sol";

contract WorldState is IWorldState {
    mapping(uint256 => mapping(bytes32 => bytes)) private worldState;

    constructor() {
    }

    function setWorld(uint256 id, bytes32 key, bytes calldata value) external {
        worldState[id][key] = value;
    }

    function getWorld(uint256 id, bytes32 key) external view returns (bytes memory) {
        return worldState[id][key];
    }
}