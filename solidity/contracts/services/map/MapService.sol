// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../handlers/IActionHandler.sol";
import "../../domains/maps/IMap.sol";

contract MapService is IActionHandler {
    IMap public map;
    
    // 맵 관련 명령어 타입
    enum MapCommand {
        GET_MAP_METADATA,    // 0
        SET_MAP_METADATA     // 1
    }
    
    constructor(address _map) {
        map = IMap(_map);
    }
    
    function handle(bytes calldata payload) external override returns (bytes memory) {
        require(payload.length >= 1, "Invalid map command payload");
        
        MapCommand command = MapCommand(uint8(payload[0]));
        
        if (command == MapCommand.GET_MAP_METADATA) {
            return _handleGetMapMetadata();
        } else if (command == MapCommand.SET_MAP_METADATA) {
            return _handleSetMapMetadata(payload[1:]);
        } else {
            revert("Unsupported map command");
        }
    }
    
    /**
     * 맵 메타데이터 조회 처리
     */
    function _handleGetMapMetadata() internal view returns (bytes memory) {
        IMap.MapMetadata memory metadata = map.getMapMetadata();
        
        // 결과를 bytes로 인코딩하여 반환
        bytes memory result = abi.encodePacked(
            uint8(1), // 성공 상태
            metadata.width,
            metadata.height,
            uint8(bytes(metadata.terrainInfo).length), // terrainInfo 길이
            metadata.terrainInfo
        );
        
        return result;
    }

    /**
     * 맵 메타데이터 설정 처리
     * @param payload [width(2)][height(2)][terrainInfoLength(1)][terrainInfo(string)]
     */
    function _handleSetMapMetadata(bytes calldata payload) internal returns (bytes memory) {
        require(payload.length >= 5, "Invalid payload length for SET_MAP_METADATA");
        
        uint16 width = uint16(uint8(payload[0]) | (uint8(payload[1]) << 8));
        uint16 height = uint16(uint8(payload[2]) | (uint8(payload[3]) << 8));
        uint8 terrainInfoLength = uint8(payload[4]);
        
        require(payload.length >= 5 + terrainInfoLength, "Invalid terrain info length");
        
        string memory terrainInfo = string(payload[5:5 + terrainInfoLength]);
        
        map.setMapMetadata(width, height, terrainInfo);
        
        // 성공 응답
        bytes memory result = abi.encodePacked(uint8(1)); // 성공 상태
        
        return result;
    }
} 