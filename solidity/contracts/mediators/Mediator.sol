// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IWorldState.sol";

contract Mediator {
    uint16 public immutable worldId;
    address public admin;
    IWorldState public worldState;
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    constructor(address _worldState) {
        admin = msg.sender;
        worldState = IWorldState(_worldState);
        worldId = worldState.createNewWorld();
    }
    
    function updateWorldState(address _newWorldState) external onlyAdmin {
        worldState = IWorldState(_newWorldState);
    }
    
    function setPlayerHP(string memory hp_key, uint256 hp) external {
        bytes32 key = keccak256(abi.encodePacked(hp_key));
        bytes memory packedHP = abi.encodePacked(hp);
        worldState.setWorld(worldId, key, packedHP);
    }
    
    function getPlayerHP(string memory hp_key) external view returns (uint256) {
        bytes32 key = keccak256(abi.encodePacked(hp_key));
        bytes memory data = worldState.getWorld(worldId, key);
        if (data.length == 0) return 0;
        return abi.decode(data, (uint256));
    }
}