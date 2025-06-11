import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";

describe("WorldState", function () {
  let WorldState: any;
  let worldState: any;
  let owner: Signer;

  beforeEach(async function () {
    WorldState = await ethers.getContractFactory("WorldState");
    [owner] = await ethers.getSigners();
    worldState = await WorldState.deploy();
  });

  describe("기본 기능", function () {
    it("데이터를 저장하고 올바르게 조회되어야 한다", async function () {
      // given
      const worldId = 1;
      const key = ethers.keccak256(ethers.toUtf8Bytes("player_hp"));
      const hp = ethers.toUtf8Bytes("100");
      
      // when
      await worldState.setWorld(worldId, key, hp);
      const result_hp = await worldState.getWorld(worldId, key);
      
      // then
      expect(result_hp).to.equal(ethers.hexlify(hp));
    });

    it("빈 데이터를 저장하고 조회할 수 있어야 한다", async function () {
      // given
      const worldId = 1;
      const key = ethers.keccak256(ethers.toUtf8Bytes("empty_data"));
      const emptyData = "0x";
      
      // when
      await worldState.setWorld(worldId, key, emptyData);
      const result = await worldState.getWorld(worldId, key);
      
      // then
      expect(result).to.equal(emptyData);
    });

    it("존재하지 않는 키 조회 시 빈 데이터가 반환되어야 한다", async function () {
      // given
      const worldId = 1;
      const nonExistentKey = ethers.keccak256(ethers.toUtf8Bytes("non_existent"));
      
      // when
      const result = await worldState.getWorld(worldId, nonExistentKey);
      
      // then
      expect(result).to.equal("0x");
    });

    it("같은 ID에 서로 다른 키로 여러 데이터를 저장할 수 있어야 한다", async function () {
      // given
      const worldId = 1;
      const hpKey = ethers.keccak256(ethers.toUtf8Bytes("player_hp"));
      const mpKey = ethers.keccak256(ethers.toUtf8Bytes("player_mp"));
      
      const hpData = ethers.toUtf8Bytes("100");
      const mpData = ethers.toUtf8Bytes("50");
      
      // when
      await worldState.setWorld(worldId, hpKey, hpData);
      await worldState.setWorld(worldId, mpKey, mpData);
      
      const resultHp = await worldState.getWorld(worldId, hpKey);
      const resultMp = await worldState.getWorld(worldId, mpKey);
      
      // then
      expect(resultHp).to.equal(ethers.hexlify(hpData));
      expect(resultMp).to.equal(ethers.hexlify(mpData));
    });

    it("같은 키에 새로운 값을 저장하면 기존 값이 덮어써져야 한다", async function () {
      // given
      const worldId = 1;
      const key = ethers.keccak256(ethers.toUtf8Bytes("player_hp"));
      const initialHp = ethers.toUtf8Bytes("100");
      const updatedHp = ethers.toUtf8Bytes("150");
      
      // when 초기 값 저장
      await worldState.setWorld(worldId, key, initialHp);
      const initialResult = await worldState.getWorld(worldId, key);
      
      // when 같은 키에 새로운 값 저장
      await worldState.setWorld(worldId, key, updatedHp);
      const updatedResult = await worldState.getWorld(worldId, key);
      
      // then
      expect(initialResult).to.equal(ethers.hexlify(initialHp));
      expect(updatedResult).to.equal(ethers.hexlify(updatedHp));
    });
  });
}); 