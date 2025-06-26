import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";

describe("WorldState", function () {
  let WorldState: any;
  let worldState: any;
  let owner: Signer;

  function createKey(keyName: string): string {
    return ethers.keccak256(ethers.toUtf8Bytes(keyName));
  }

  async function createWorld(account: Signer = owner) {
    const worldStateWithAccount = account === owner ? worldState : worldState.connect(account);
    const tx = await worldStateWithAccount.createNewWorld();
    await tx.wait();
    return await worldState.ownerWorld(await account.getAddress());
  }

  async function getWorldId(account: Signer = owner) {
    return await worldState.ownerWorld(await account.getAddress());
  }

  beforeEach(async function () {
    WorldState = await ethers.getContractFactory("WorldState");
    [owner] = await ethers.getSigners();
    worldState = await WorldState.deploy();
    worldState = worldState.connect(owner);
  });

  describe("기본 기능", function () {
    it("존재하지 않는 키 조회 시 빈 데이터가 반환되어야 한다", async function () {
      // given
      await createWorld();
      const nonExistentKey = createKey("non_existent");
      
      // when
      const result = await worldState.get(await getWorldId(), nonExistentKey);
      
      // then
      expect(result).to.equal("0x");
    });
  });

  describe("World 생성 및 소유권", function () {
    it("월드 생성 시 totalWorlds가 올바르게 증가해야 한다", async function () {
      // given
      const initialTotalWorlds = await worldState.totalWorlds();
      
      // when
      await createWorld();
      
      // then
      const newTotalWorlds = await worldState.totalWorlds();
      expect(newTotalWorlds).to.equal(initialTotalWorlds + 1n);
    });

    it("월드 생성 시 반환값이 올바른 totalWorlds 값이어야 한다", async function () {
      // when
      const worldId = await createWorld();
      
      // then
      const totalWorlds = await worldState.totalWorlds();
      expect(worldId).to.equal(totalWorlds);
    });

    it("월드 생성 시 ownerWorld 매핑이 올바르게 설정되어야 한다", async function () {
      // when
      const worldId = await createWorld();
      
      // then
      const ownerWorldId = await getWorldId();
      expect(ownerWorldId).to.equal(worldId);
    });

    it("월드를 생성하지 않은 계정의 ownerWorld 값은 0이어야 한다", async function () {
      // given
      const [, otherAccount] = await ethers.getSigners();
      
      // when
      const ownerWorldId = await getWorldId(otherAccount);
      
      // then
      expect(ownerWorldId).to.equal(0n);
    });

    it("이미 월드를 가진 계정은 새로운 월드를 생성할 수 없어야 한다", async function () {
      // given
      await createWorld();
      
      // when & then
      await expect(createWorld()).to.be.revertedWith("Address already owns a world");
    });

    it("여러 계정이 각각 월드를 생성할 수 있어야 한다", async function () {
      // given
      const [, otherAccount] = await ethers.getSigners();
      
      // when
      const ownerWorldId = await createWorld();
      const otherWorldId = await createWorld(otherAccount);
      
      const ownerWorldIdFromMapping = await getWorldId();
      const otherWorldIdFromMapping = await getWorldId(otherAccount);
      
      // then
      expect(ownerWorldIdFromMapping).to.equal(ownerWorldId);
      expect(otherWorldIdFromMapping).to.equal(otherWorldId);
      expect(ownerWorldId).to.not.equal(otherWorldId);
    });

    it("월드를 가진 계정이 새로운 월드 생성을 시도하면 totalWorlds가 증가하지 않아야 한다", async function () {
      // given
      await createWorld();
      const totalWorldsBefore = await worldState.totalWorlds();
      
      // when & then
      await expect(createWorld()).to.be.revertedWith("Address already owns a world");
      
      // then
      const totalWorldsAfter = await worldState.totalWorlds();
      expect(totalWorldsAfter).to.equal(totalWorldsBefore);
    });
  });
}); 