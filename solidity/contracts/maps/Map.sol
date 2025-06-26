// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IMediator.sol";

contract Map {
    address public admin;
    IMediator public mediator;

    struct TileData {
        uint8 tileType;
        uint8 playerCount;
        uint32 timestamp;
    }

    event MapTileUpdated(uint8 x, uint8 y, uint8 tileType);

    constructor(address _mediator) {
        require(_mediator != address(0), "Mediator address cannot be zero");
        admin = msg.sender;
        mediator = IMediator(_mediator);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    function updateTile(uint8 x, uint8 y, uint8 tileType) external onlyAdmin {
        bytes32 key = _getTileKey(x, y);
        
        TileData memory existing = getTileData(key);
        
        bytes memory data = abi.encodePacked(
            uint8(tileType),
            uint8(existing.playerCount),
            uint32(block.timestamp)
        );
        
        mediator.setWorld(key, data);
        emit MapTileUpdated(x, y, tileType);
    }

    function getMap(uint8 x, uint8 y) external view returns (TileData memory) {
        bytes32 tileKey = _getTileKey(x, y);
        return getTileData(tileKey);
    }

    function getTileData(bytes32 key) internal view returns (TileData memory) {
        bytes memory data = mediator.getWorld(key);
        if (data.length == 0) {
            return TileData(0, 0, 0);
        }
        
        require(data.length == 6, "Invalid data length");
        
        uint8 tileType = uint8(data[0]);
        uint8 playerCount = uint8(data[1]);
        uint32 timestamp = uint32(
            uint8(data[2]) |
            (uint8(data[3]) << 8) |
            (uint8(data[4]) << 16) |
            (uint8(data[5]) << 24)
        );
        
        return TileData(tileType, playerCount, timestamp);
    }

    function _getTileKey(uint8 x, uint8 y) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("tile", x, y));
    }
} 