import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";

describe("Mediator", function () {
  let WorldState: any;
  let worldState: any;
  let Mediator: any;
  let mediator: any;
  let owner: Signer;
  let newAdmin: Signer;
  let nonAdmin: Signer;

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

  async function deployNewMediator(admin: Signer) {
    return await Mediator.connect(admin).deploy(await worldState.getAddress());
  }

  beforeEach(async function () {
    WorldState = await ethers.getContractFactory("WorldState");
    [owner, newAdmin, nonAdmin] = await ethers.getSigners();
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

  describe("Mediator 업그레이드 테스트", function () {
    it("새로운 Mediator로 업그레이드할 수 있어야 한다", async function () {
      // given
      const newMediator = await deployNewMediator(newAdmin);
      
      // when
      await mediator.upgradeToNewMediator(await newMediator.getAddress());
      
      // then
      const worldId = await mediator.worldId();
      const currentMediator = await worldState.worldMediator(worldId);
      expect(currentMediator).to.equal(await newMediator.getAddress());
    });

    it("업그레이드 후 새로운 Mediator로 데이터를 설정할 수 있어야 한다", async function () {
      // given
      const newMediator = await deployNewMediator(newAdmin);
      const key = createKey("player_hp");
      
      // when
      await mediator.upgradeToNewMediator(await newMediator.getAddress());
      await newMediator.setWorldData(key, createBytes("200"));
      
      // then
      const result = await newMediator.getWorldData(key);
      expectBytesEqual(result, "200");
    });

    it("업그레이드 후 기존 Mediator로는 데이터를 설정할 수 없어야 한다", async function () {
      // given
      const newMediator = await deployNewMediator(newAdmin);
      const key = createKey("player_hp");
      
      // when
      await mediator.upgradeToNewMediator(await newMediator.getAddress());
      
      // then
      await expect(
        mediator.setWorldData(key, createBytes("200"))
      ).to.be.revertedWith("Unauthorized: Not mediator of this world");
    });

    it("zero address로 업그레이드할 수 없어야 한다", async function () {
      // when & then
      await expect(
        mediator.upgradeToNewMediator(ethers.ZeroAddress)
      ).to.be.revertedWith("New mediator cannot be zero address");
    });

    it("현재 Mediator 주소로 업그레이드할 수 없어야 한다", async function () {
      // when & then
      await expect(
        mediator.upgradeToNewMediator(await mediator.getAddress())
      ).to.be.revertedWith("New mediator cannot be current mediator");
    });

    it("admin이 아닌 계정은 업그레이드할 수 없어야 한다", async function () {
      // given
      const newMediator = await deployNewMediator(nonAdmin);
      
      // when & then
      await expect(
        mediator.connect(nonAdmin).upgradeToNewMediator(await newMediator.getAddress())
      ).to.be.revertedWith("Only admin can call this function");
    });

    it("업그레이드 시 MediatorUpgraded 이벤트가 발생해야 한다", async function () {
      // given
      const newMediator = await deployNewMediator(newAdmin);
      
      // when
      const tx = await mediator.upgradeToNewMediator(await newMediator.getAddress());
      
      // then
      await expect(tx)
        .to.emit(mediator, "MediatorUpgraded")
        .withArgs(await mediator.getAddress(), await newMediator.getAddress());
    });
  });
}); 