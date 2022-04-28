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

      it("Check URI", async () => {
        await expect(nft.tokenURI(100)).to.be.reverted;
      })

  })

  describe("Check mint NFT", () => {
    it("Check safeMintMultiple not owner", async () => {
      await expect(
        nft.connect(addr1).safeMintMultiple(addr2.address, 3)
      ).to.be.reverted

    })
    it("Check safeMintMultiple owner", async () => {
        await nft.connect(owner).safeMintMultiple(addr2.address, 3);
        const ad = await  nft.ownerOf(2)
        expect(ad).to.equal(addr2.address)

    })
  })


});
