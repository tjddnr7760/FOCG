// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IWorldState.sol";

contract Mediator {
    address public admin;
    IWorldState public immutable worldState;
    uint16 public immutable worldId;

    event MediatorUpgraded(address indexed oldMediator, address indexed newMediator);
    event WorldDataChanged(bytes32 indexed key);

    constructor(address _worldState) {
        require(_worldState != address(0), "WorldState address cannot be zero");
        admin = msg.sender;
        worldState = IWorldState(_worldState);
        
        worldId = worldState.createNewWorld();
        worldState.setMediator(worldId, address(this));
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    function upgradeToNewMediator(address newMediator) external onlyAdmin {
        require(newMediator != address(0), "New mediator cannot be zero address");
        require(newMediator != address(this), "New mediator cannot be current mediator");
        
        address oldMediator = address(this);
        worldState.setMediator(worldId, newMediator);
        
        emit MediatorUpgraded(oldMediator, newMediator);
    }

    function setWorldData(bytes32 key, bytes calldata value) external onlyAdmin {
        worldState.setWorld(worldId, key, value);
        emit WorldDataChanged(key);
    }

    function getWorldData(bytes32 key) external view returns (bytes memory) {
        return worldState.getWorld(worldId, key);
    }
}