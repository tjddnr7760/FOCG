// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMediator {
    function setWorld(bytes32 key, bytes calldata data) external;
    function getWorld(bytes32 key) external view returns (bytes memory);
    function upgradeToNewMediator(address newMediator) external;
}