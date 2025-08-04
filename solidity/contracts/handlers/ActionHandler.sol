// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IActionHandler.sol";
import "../services/map/MapService.sol";

contract ActionHandler {
    address public admin;
    
    // 액션 타입별 핸들러 매핑
    mapping(uint8 => IActionHandler) public actionHandlers;

    // 액션 타입 정의
    enum ActionType {
        MAP_ACTION    // 맵 관련 액션
    }

    event ActionProcessed(
        uint8 indexed actionType,
        address indexed user,
        bytes payload,
        bool success
    );

    event HandlerRegistered(uint8 indexed actionType, address indexed handler);

    constructor(address _map) {
        require(_map != address(0), "Map address cannot be zero");
        admin = msg.sender;
        
        // 초기 핸들러 등록
        _registerHandler(uint8(ActionType.MAP_ACTION), new MapService(_map));
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    /**
     * 프론트엔드에서 받은 payload를 처리하는 메인 함수
     * @param payload 프론트엔드에서 전송된 액션 데이터
     */
    function processAction(bytes calldata payload) external returns (bytes memory) {
        require(payload.length >= 1, "Invalid payload: too short");
        
        // 첫 번째 바이트로 액션 타입 파싱
        uint8 actionType = uint8(payload[0]);
        
        // 매핑에서 핸들러 찾기
        IActionHandler handler = actionHandlers[actionType];
        require(address(handler) != address(0), "Unsupported action type");
        
        // 핸들러 호출
        bytes memory result = handler.handle(payload[1:]);
        
        emit ActionProcessed(actionType, msg.sender, payload, true);
        return result;
    }

    /**
     * 핸들러 등록 (내부 함수)
     */
    function _registerHandler(uint8 actionType, IActionHandler handler) internal {
        require(address(handler) != address(0), "Handler address cannot be zero");
        actionHandlers[actionType] = handler;
        emit HandlerRegistered(actionType, address(handler));
    }

    /**
     * 핸들러 등록 (외부 함수)
     */
    function registerHandler(uint8 actionType, IActionHandler handler) external onlyAdmin {
        _registerHandler(actionType, handler);
    }

    /**
     * 핸들러 주소 조회
     */
    function getHandler(uint8 actionType) external view returns (address) {
        return address(actionHandlers[actionType]);
    }

    /**
     * 핸들러 존재 여부 확인
     */
    function hasHandler(uint8 actionType) external view returns (bool) {
        return address(actionHandlers[actionType]) != address(0);
    }
}