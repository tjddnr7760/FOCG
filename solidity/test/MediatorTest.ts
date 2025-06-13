import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";

describe("Mediator", function () {
  let WorldState: any;
  let worldState: any;
  let Mediator: any;
  let mediator: any;
  let owner: Signer;

  beforeEach(async function () {
    WorldState = await ethers.getContractFactory("WorldState");
    [owner] = await ethers.getSigners();
    worldState = await WorldState.deploy();
    
    Mediator = await ethers.getContractFactory("Mediator");
    mediator = await Mediator.deploy(await worldState.getAddress());
  });

  describe("Mediator, WorldState 연동 테스트", function () {
    it("HP를 저장하고 올바르게 조회되어야 한다", async function () {
      // given
      const hp = 100;
      const keyName = "player_hp";
      
      // when
      await mediator.setPlayerHP(keyName, hp);
      const result = await mediator.getPlayerHP(keyName);
      
      // then
      expect(result).to.equal(hp);
    });

    it("HP가 0일 때 정상적으로 저장하고 조회되어야 한다", async function () {
      // given
      const hp = 0;
      const keyName = "player_hp";
      
      // when
      await mediator.setPlayerHP(keyName, hp);
      const result = await mediator.getPlayerHP(keyName);
      
      // then
      expect(result).to.equal(hp);
    });

    it("같은 플레이어의 HP를 업데이트하면 새로운 값으로 덮어써져야 한다", async function () {
      // given
      const initialHP = 100;
      const updatedHP = 150;
      const keyName = "player_hp";
      
      // when
      await mediator.setPlayerHP(keyName, initialHP);
      const initialResult = await mediator.getPlayerHP(keyName);
      
      await mediator.setPlayerHP(keyName, updatedHP);
      const updatedResult = await mediator.getPlayerHP(keyName);
      
      // then
      expect(initialResult).to.equal(initialHP);
      expect(updatedResult).to.equal(updatedHP);
      expect(updatedResult).to.not.equal(initialResult);
    });
  });
}); 