// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IWorldState.sol";

contract Mediator {
    address public admin;
    IWorldState public worldState;
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    constructor(address _worldState) {
        admin = msg.sender;
        worldState = IWorldState(_worldState);
    }
    
    function updateWorldState(address _newWorldState) external onlyAdmin {
        worldState = IWorldState(_newWorldState);
    }
    
    function setPlayerHP(uint256 playerId, uint256 hp) external {
        bytes32 key = keccak256("player_hp");
        bytes memory packedHP = abi.encodePacked(hp);
        worldState.setWorld(playerId, key, packedHP);
    }
    
    function getPlayerHP(uint256 playerId) external view returns (uint256) {
        bytes32 key = keccak256("player_hp");
        bytes memory data = worldState.getWorld(playerId, key);
        if (data.length == 0) return 0;
        return abi.decode(data, (uint256));
    }
}