// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IWorldState.sol";

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
}