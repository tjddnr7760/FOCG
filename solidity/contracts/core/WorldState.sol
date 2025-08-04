// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IWorldState.sol";

contract WorldState is IWorldState {
    uint16 public totalWorlds;
    mapping(uint16 => mapping(bytes32 => bytes)) private worldState;
    mapping(address => uint16) public ownerWorld;
    mapping(uint16 => address) public worldMediator;

    event WorldCreated(uint16 indexed worldId, address indexed owner);
    event MediatorSet(uint16 indexed worldId, address indexed mediator);
    event WorldDataUpdated(uint16 indexed worldId, bytes32 indexed key);

    constructor() {
        totalWorlds = 0;
    }

    function createNewWorld() external returns (uint16) {
        require(ownerWorld[msg.sender] == 0, "Address already owns a world");
        totalWorlds++;
        ownerWorld[msg.sender] = totalWorlds;
        
        emit WorldCreated(totalWorlds, msg.sender);
        return totalWorlds;
    }

    function setMediator(uint16 worldId, address newMediator) external {
        require(ownerWorld[msg.sender] == worldId, "Not the owner of this world");
        worldMediator[worldId] = newMediator;
        
        emit MediatorSet(worldId, newMediator);
    }

    function store(uint16 worldId, bytes32 key, bytes calldata value) external {
        require(worldMediator[worldId] == msg.sender, "Unauthorized: Not mediator of this world");
        worldState[worldId][key] = value;
        
        emit WorldDataUpdated(worldId, key);
    }

    function get(uint16 worldId, bytes32 key) external view returns (bytes memory) {
        return worldState[worldId][key];
    }
}