const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
require('@openzeppelin/hardhat-upgrades');

describe("BTMT reward token", function () {
  beforeEach(async () => {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    RewardToken = await ethers.getContractFactory("BTMTRewardToken");
    rewardToken = await upgrades.deployProxy(RewardToken, [], {
      kind: "uups",
    });
    await rewardToken.deployed();
  });

  describe("Check static info", () => {
    beforeEach(async () =>{
      // await rewardToken.initialize()

    })
    it("Check re initialize: It should be reverted", async () => {
      await expect(
        rewardToken.initialize()
      ).to.be.reverted
    })

    it("Name should be 'BTMT Reward Token'", async () => {
      const name = await rewardToken.name()
      expect(name).to.equal("BTMT Reward Token")
    })

    it("Symbol should be 'BTMT'", async () => {
      const symbol = await rewardToken.symbol()
      expect(symbol).to.equal("BTMT")
    })

  })

  describe("Check pause", () => {
    beforeEach(async () =>{
      // await rewardToken.initialize()

    })
    

    it("It should be revert because not owner", async () => {
      await expect(
        rewardToken.connect(addr1).pause()
      ).to.be.reverted;

      await expect(
        rewardToken.connect(addr1).unpause()
      ).to.be.reverted;
    })

    it("It should be pause after call pause()", async () => {
      let paused = await rewardToken.paused()
      expect(paused).to.equal(false)

      await rewardToken.pause()
      paused = await rewardToken.paused()
      expect(paused).to.equal(true)

      await rewardToken.unpause()
      paused = await rewardToken.paused()
      expect(paused).to.equal(false)
    })

  })

  describe("Check mint token", () => {
    it("Check set minter", async () => {
      await expect(
        rewardToken.connect(addr2).setMinter(addr1.address, true)
      ).to.be.reverted;

      await rewardToken.setMinter(addr1.address, true)
    })

    it("Check not minter mint", async () => {
      await expect(
        rewardToken.connect(addr1).mint(addr1.address, 1000)
      ).to.be.reverted;
    })

    it("Check minter mint", async () => {
      await rewardToken.setMinter(addr1.address, true)
      await rewardToken.connect(addr1).mint(addr1.address, 1000)
      const balance = await rewardToken.balanceOf(addr1.address)
      expect(balance.toString()).to.equal('1000')
    })
  })

  describe("Check transfer token", () => {
    beforeEach(async () =>{
      // await rewardToken.initialize()
      await rewardToken.setMinter(addr1.address, true)
      await rewardToken.connect(addr1).mint(addr1.address, 1000)

    })

    it("balance should be 0 after transfer", async () => {
      await rewardToken.connect(addr1).transfer(owner.address, 1000)
      let balance = await rewardToken.balanceOf(owner.address)
      expect(balance.toString()).to.equal('1000')

      balance = await rewardToken.balanceOf(addr1.address)
      expect(balance.toString()).to.equal('0')

    })
  })

  describe("Check _authorizeUpgrade", () => {
    beforeEach(async () =>{
    
    })

    it("Address after upgrade should be not change", async () => {
      // rewardToken = await upgrades.deployProxy(RewardToken, [], {
      //   kind: "uups",
      // });
      const addr = rewardToken.address
      const rewardTokenV2 = await upgrades.upgradeProxy(rewardToken.address, RewardToken); // just tesst
      expect(rewardTokenV2.address).to.equal(addr)

    })

  })





  
});
