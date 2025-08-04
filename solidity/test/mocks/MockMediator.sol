
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../contracts/mediators/IMediator.sol";

contract MockMediator is IMediator {
    mapping(bytes32 => bytes) private mockStorage;

    function setWorld(bytes32 key, bytes calldata data) external override {
        mockStorage[key] = data;
    }

    function getWorld(bytes32 key) external view override returns (bytes memory) {
        return mockStorage[key];
    }

    function upgradeToNewMediator(address newMediator) external override {
        // Mock implementation: Do nothing or revert if called, as it's not used in tests
        revert("upgradeToNewMediator not implemented in mock");
    }
} 