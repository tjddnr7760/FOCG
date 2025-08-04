// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMap {
    struct MapMetadata {
        uint16 width;
        uint16 height;
        string terrainInfo;
    }

    // 맵 메타데이터 관리
    function setMapMetadata(uint16 width, uint16 height, string calldata terrainInfo) external;
    function getMapMetadata() external view returns (MapMetadata memory);
} 