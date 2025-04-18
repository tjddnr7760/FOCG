import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";

// Game 컨트랙트 테스트 스위트
describe("Game", function () {
  let Game: any;
  let game: any;
  let owner: Signer;
  let player1: Signer;
  let player2: Signer;

  beforeEach(async function () {
    Game = await ethers.getContractFactory("Game");
    [owner, player1, player2] = await ethers.getSigners();
    game = await Game.deploy();
  });

  describe("초기화", function () {
    it("맵 크기가 5로 초기화되어야 한다", async function () {
      expect(await game.mapSize()).to.equal(5);
    });

    it("몬스터가 올바른 초기 위치와 HP로 설정되어야 한다", async function () {
      const monsterState = await game.getMonsterState();
      expect(monsterState.x).to.equal(4);
      expect(monsterState.y).to.equal(4);
      expect(monsterState.hp).to.equal(50);
    });

    it("초기 턴이 플레이어 턴이어야 한다", async function () {
      expect(await game.getTurn()).to.equal(true);
    });
  });
});