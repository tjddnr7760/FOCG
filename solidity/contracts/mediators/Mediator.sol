// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../core/IWorldState.sol";

contract Mediator {
    address public admin;
    IWorldState public immutable worldState;
    uint16 public immutable worldId;

    event MediatorUpgraded(address indexed oldMediator, address indexed newMediator);

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

    function setWorld(bytes32 key, bytes calldata data) external onlyAdmin {
        worldState.store(worldId, key, data);
    }

    function getWorld(bytes32 key) external view returns (bytes memory) {
        return worldState.get(worldId, key);
    }

    function upgradeToNewMediator(address newMediator) external onlyAdmin {
        require(newMediator != address(0), "New mediator cannot be zero address");
        require(newMediator != address(this), "New mediator cannot be current mediator");
        
        address oldMediator = address(this);
        worldState.setMediator(worldId, newMediator);
        
        emit MediatorUpgraded(oldMediator, newMediator);
    }
}