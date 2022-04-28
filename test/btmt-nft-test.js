const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("BTMT nft", function () {
  beforeEach(async () => {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    NFT = await ethers.getContractFactory("BTMTCollection");
    nft = await NFT.deploy();
    await nft.deployed();
  });

  describe("Check static info", () => {
      it("Name should be 'BTMT Collection'", async () => {
          const name = await nft.name()
          expect(name).to.equal("BTMT Collection")
      })

      it("Symbol should be 'BTMT'", async () => {
        const name = await nft.symbol()
        expect(name).to.equal("BTMT")
      })

      it("It should be return false support interface", async () => {
        var size = 1;
        var sizeBytes = new Buffer(4);
        sizeBytes.writeUInt32LE(size, 0);

        const sp = await nft.supportsInterface(sizeBytes)
        expect(sp).to.equal(false)
      })

  })

  describe("Check mint NFT", () => {
      
  })


});
