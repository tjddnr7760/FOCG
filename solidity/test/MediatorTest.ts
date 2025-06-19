import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";

describe("Mediator", function () {
  let WorldState: any;
  let worldState: any;
  let Mediator: any;
  let mediator: any;
  let owner: Signer;

  // 헬퍼 함수들
  function createKey(keyName: string): string {
    return ethers.keccak256(ethers.toUtf8Bytes(keyName));
  }

  function createBytes(value: string): Uint8Array {
    return ethers.toUtf8Bytes(value);
  }

  function expectBytesEqual(actual: string, expected: string) {
    expect(actual).to.equal(ethers.hexlify(createBytes(expected)));
  }

  beforeEach(async function () {
    WorldState = await ethers.getContractFactory("WorldState");
    [owner] = await ethers.getSigners();
    worldState = await WorldState.deploy();
    worldState = worldState.connect(owner);
    
    Mediator = await ethers.getContractFactory("Mediator");
    mediator = await Mediator.deploy(await worldState.getAddress());
  });

  describe("Mediator, WorldState 연동 테스트", function () {
    it("HP를 저장하고 올바르게 조회되어야 한다", async function () {
      // given
      const key = createKey("player_hp");
      const hpBytes = createBytes("100");
      
      // when
      await mediator.setWorldData(key, hpBytes);
      const result = await mediator.getWorldData(key);
      
      // then
      expectBytesEqual(result, "100");
    });

    it("HP가 0일 때 정상적으로 저장하고 조회되어야 한다", async function () {
      // given
      const key = createKey("player_hp");
      const hpBytes = createBytes("0");
      
      // when
      await mediator.setWorldData(key, hpBytes);
      const result = await mediator.getWorldData(key);
      
      // then
      expectBytesEqual(result, "0");
    });

    it("빈 데이터를 저장하고 조회할 수 있어야 한다", async function () {
      // given
      const key = createKey("empty_data");
      const emptyData = "0x";
      
      // when
      await mediator.setWorldData(key, emptyData);
      const result = await mediator.getWorldData(key);
      
      // then
      expect(result).to.equal(emptyData);
    });

    it("같은 ID에 서로 다른 키로 여러 데이터를 저장할 수 있어야 한다", async function () {
      // given
      const hpKey = createKey("player_hp");
      const mpKey = createKey("player_mp");
      
      // when
      await mediator.setWorldData(hpKey, createBytes("100"));
      await mediator.setWorldData(mpKey, createBytes("50"));
      
      const resultHp = await mediator.getWorldData(hpKey);
      const resultMp = await mediator.getWorldData(mpKey);
      
      // then
      expectBytesEqual(resultHp, "100");
      expectBytesEqual(resultMp, "50");
    });

    it("같은 키에 새로운 값을 저장하면 기존 값이 덮어써져야 한다", async function () {
      // given
      const key = createKey("player_hp");
      
      // when
      await mediator.setWorldData(key, createBytes("100"));
      const initialResult = await mediator.getWorldData(key);
      
      await mediator.setWorldData(key, createBytes("150"));
      const updatedResult = await mediator.getWorldData(key);
      
      // then
      expectBytesEqual(initialResult, "100");
      expectBytesEqual(updatedResult, "150");
      expect(updatedResult).to.not.equal(initialResult);
    });
  });
}); 