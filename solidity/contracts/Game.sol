pragma solidity ^0.8.0;

contract Game {
    struct Player {
        uint256 x;
        uint256 y;
        uint256 hp;
        bool active;
    }

    struct Monster {
        uint256 x;
        uint256 y;
        uint256 hp;
    }

    uint256 public mapSize = 5;
    mapping(address => Player) public players;
    Monster public monster;
    bool public turn = true;
    uint256 private actionCounter;

    event ActionProcessed(address indexed player, uint256 actionId, string actionType, bool success);

    constructor() {
        monster = Monster(4, 4, 50);
    }

    function submitAction(string memory actionType, uint256 x, uint256 y) public {
        require(players[msg.sender].active || !players[msg.sender].active, "Player not initialized");
        require(turn, "Not player's turn");
        require(x < mapSize && y < mapSize, "Out of bounds");

        uint256 actionId = actionCounter++;
        
        if (!players[msg.sender].active) {
            players[msg.sender] = Player(x, y, 100, true);
            emit ActionProcessed(msg.sender, actionId, actionType, true);
            turn = false;
            return;
        }

        if (keccak256(abi.encodePacked(actionType)) == keccak256(abi.encodePacked("move"))) {
            if (x == monster.x && y == monster.y) {
                emit ActionProcessed(msg.sender, actionId, actionType, false);
                return;
            }

            players[msg.sender].x = x;
            players[msg.sender].y = y;
            turn = false;
            emit ActionProcessed(msg.sender, actionId, actionType, true);
        } else {
            emit ActionProcessed(msg.sender, actionId, actionType, false);
        }
    }

    function getPlayerState(address player) public view returns (uint256 x, uint256 y, uint256 hp) {
        return (players[player].x, players[player].y, players[player].hp);
    }

    function getMonsterState() public view returns (uint256 x, uint256 y, uint256 hp) {
        return (monster.x, monster.y, monster.hp);
    }

    function getMapSize() public view returns (uint256) {
        return mapSize;
    }

    function getTurn() public view returns (bool) {
        return turn;
    }

    function moveMonster(uint256 newX, uint256 newY) public {
        require(!turn, "Not monster's turn");
        require(newX < mapSize && newY < mapSize, "Out of bounds");
        require(newX != players[msg.sender].x || newY != players[msg.sender].y, "Cannot move to player's position");
        
        monster.x = newX;
        monster.y = newY;
        turn = true;
    }
}