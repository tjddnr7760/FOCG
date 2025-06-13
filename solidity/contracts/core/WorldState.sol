// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IWorldState.sol";

contract WorldState is IWorldState {
    uint16 public totalWorlds;
    mapping(uint256 => mapping(bytes32 => bytes)) private worldState;
    mapping(address => uint16) public ownerWorld;

    constructor() {
        totalWorlds = 0;
    }

    function createNewWorld() external returns (uint16) {
        require(ownerWorld[msg.sender] == 0, "Already owns a world");
        totalWorlds++;
        ownerWorld[msg.sender] = totalWorlds;
        
        return totalWorlds;
    }

    function setWorld(uint256 worldId, bytes32 key, bytes calldata value) external {
        require(ownerWorld[msg.sender] == worldId, "Unauthorized: Not owner of this world");
        worldState[worldId][key] = value;
    }

    function getWorld(uint256 worldId, bytes32 key) external view returns (bytes memory) {
        return worldState[worldId][key];
    }
}