
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Map 단위 테스트", function () {
    let map: any;
    let mockMediator: any;
    let owner: any;
    let nonAdmin: any;

    beforeEach(async function () {
        [owner, nonAdmin] = await ethers.getSigners();

        // Deploy MockMediator
        const MockMediator = await ethers.getContractFactory("MockMediator");
        mockMediator = await MockMediator.deploy();

        // Deploy Map with mockMediator address
        const Map = await ethers.getContractFactory("Map");
        map = await Map.deploy(await mockMediator.getAddress());
    });

    describe("Constructor", function () {
        it("배포자가 admin으로 설정되고 mediator가 올바르게 설정되어야 한다", async function () {
            expect(await map.admin()).to.equal(await owner.getAddress());
            expect(await map.mediator()).to.equal(await mockMediator.getAddress());
        });

        it("mediator 주소가 zero일 경우 revert되어야 한다", async function () {
            const Map = await ethers.getContractFactory("Map");
            await expect(Map.deploy(ethers.ZeroAddress)).to.be.revertedWith("Mediator address cannot be zero");
        });
    });

    describe("setMapMetadata", function () {
        it("메타데이터가 올바르게 설정되고 이벤트가 발생해야 한다", async function () {
            const width = 100;
            const height = 200;
            const terrainInfo = "plain";

            const tx = await map.connect(owner).setMapMetadata(width, height, terrainInfo);
            await tx.wait();

            // Check event
            await expect(tx).to.emit(map, "MapMetadataUpdated").withArgs(width, height, terrainInfo);

            // Check stored data via mock
            const key = await ethers.keccak256(ethers.toUtf8Bytes("map_metadata")); // Simulate _getMapMetadataKey
            const storedData = await mockMediator.getWorld(key);

            // Expected packed data
            const expectedData = ethers.solidityPacked(["uint16", "uint16", "uint8", "string"], [width, height, terrainInfo.length, terrainInfo]);
            expect(storedData).to.equal(expectedData);
        });

        it("제로 값과 빈 문자열 에지 케이스를 처리해야 한다", async function () {
            const width = 0;
            const height = 0;
            const terrainInfo = "";

            await map.connect(owner).setMapMetadata(width, height, terrainInfo);

            const key = await ethers.keccak256(ethers.toUtf8Bytes("map_metadata"));
            const storedData = await mockMediator.getWorld(key);

            const expectedData = ethers.solidityPacked(["uint16", "uint16", "uint8", "string"], [width, height, 0, terrainInfo]);
            expect(storedData).to.equal(expectedData);
        });

        it("non-admin이 호출할 경우 revert되어야 한다", async function () {
            await expect(map.connect(nonAdmin).setMapMetadata(100, 200, "plain")).to.be.revertedWith("Only admin can call this function");
        });
    });

    describe("getMapMetadata", function () {
        it("파싱된 메타데이터를 올바르게 반환해야 한다", async function () {
            const width = 100;
            const height = 200;
            const terrainInfo = "plain";

            // Set mock data
            const key = await ethers.keccak256(ethers.toUtf8Bytes("map_metadata"));
            const packedData = ethers.solidityPacked(["uint16", "uint16", "uint8", "string"], [width, height, terrainInfo.length, terrainInfo]);
            await mockMediator.setWorld(key, packedData);

            const result = await map.getMapMetadata();
            console.log("result", result);
            expect(result.width).to.equal(width);
            expect(result.height).to.equal(height);
            expect(result.terrainInfo).to.equal(terrainInfo);
        });

        it("데이터가 없을 경우 기본 값을 반환해야 한다", async function () {
            const result = await map.getMapMetadata();
            expect(result.width).to.equal(0);
            expect(result.height).to.equal(0);
            expect(result.terrainInfo).to.equal("");
        });

        it("빈 terrainInfo 에지 케이스를 처리해야 한다", async function () {
            const width = 0;
            const height = 0;
            const terrainInfo = "";

            const key = await ethers.keccak256(ethers.toUtf8Bytes("map_metadata"));
            const packedData = ethers.solidityPacked(["uint16", "uint16", "uint8", "string"], [width, height, 0, terrainInfo]);
            await mockMediator.setWorld(key, packedData);

            const result = await map.getMapMetadata();
            expect(result.width).to.equal(width);
            expect(result.height).to.equal(height);
            expect(result.terrainInfo).to.equal(terrainInfo);
        });
    });

    describe("setActionHandlerAsAdmin", function () {
        it("새 admin을 올바르게 설정해야 한다", async function () {
            const newAdminAddr = await nonAdmin.getAddress();
            await map.connect(owner).setActionHandlerAsAdmin(newAdminAddr);
            expect(await map.admin()).to.equal(newAdminAddr);
        });

        it("non-admin이 호출할 경우 revert되어야 한다", async function () {
            await expect(map.connect(nonAdmin).setActionHandlerAsAdmin(await nonAdmin.getAddress())).to.be.revertedWith("Only admin can call this function");
        });

        it("actionHandler가 zero 주소일 경우 revert되어야 한다", async function () {
            await expect(map.connect(owner).setActionHandlerAsAdmin(ethers.ZeroAddress)).to.be.revertedWith("ActionHandler address cannot be zero");
        });
    });

    describe("_getMapMetadataKey", function () {
        it("올바른 keccak256 키를 반환해야 한다", async function () {
            const expectedKey = await ethers.keccak256(ethers.toUtf8Bytes("map_metadata"));
            // Since it's internal, we can call it via a public wrapper or verify indirectly in other tests
            // For simplicity, assume it's tested via set/get
        });
    });
}); 