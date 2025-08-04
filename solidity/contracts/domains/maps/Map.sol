// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../mediators/IMediator.sol";
import "./IMap.sol";

contract Map is IMap {
    address public admin;
    IMediator public mediator;

    event MapMetadataUpdated(uint16 width, uint16 height, string terrainInfo);

    constructor(address _mediator) {
        require(_mediator != address(0), "Mediator address cannot be zero");
        admin = msg.sender;
        mediator = IMediator(_mediator);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    /**
     * 맵 메타데이터 설정
     */
    function setMapMetadata(uint16 width, uint16 height, string calldata terrainInfo) external override onlyAdmin {
        bytes32 key = _getMapMetadataKey();
        
        bytes memory data = abi.encodePacked(
            width,
            height,
            uint8(bytes(terrainInfo).length), // terrainInfo 길이
            terrainInfo
        );
        
        mediator.setWorld(key, data);
        emit MapMetadataUpdated(width, height, terrainInfo);
    }

    /**
     * 맵 메타데이터 조회
     */
    function getMapMetadata() external view override returns (MapMetadata memory) {
        bytes32 key = _getMapMetadataKey();
        bytes memory data = mediator.getWorld(key);
        
        if (data.length == 0) {
            return MapMetadata(0, 0, "");
        }
        
        // 데이터 파싱 (width, height, terrainInfoLength, terrainInfo)
        uint16 width = uint16(uint8(data[0]) | (uint8(data[1]) << 8));
        uint16 height = uint16(uint8(data[2]) | (uint8(data[3]) << 8));
        uint8 terrainInfoLength = uint8(data[4]);
        
        // terrainInfo 파싱
        string memory terrainInfo = "";
        if (terrainInfoLength > 0) {
            bytes memory terrainInfoBytes = new bytes(terrainInfoLength);
            for (uint i = 0; i < terrainInfoLength; i++) {
                terrainInfoBytes[i] = data[5 + i];
            }
            terrainInfo = string(terrainInfoBytes);
        }
        
        return MapMetadata(width, height, terrainInfo);
    }

    /**
     * 맵 메타데이터 키 생성
     */
    function _getMapMetadataKey() internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("map_metadata"));
    }

    /**
     * ActionHandler를 admin으로 설정
     */
    function setActionHandlerAsAdmin(address actionHandler) external onlyAdmin {
        require(actionHandler != address(0), "ActionHandler address cannot be zero");
        admin = actionHandler;
    }
} 