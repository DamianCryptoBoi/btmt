const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Staking", function () {
  beforeEach(async () => {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    NFT = await ethers.getContractFactory("BTMTCollection");
    nft = await NFT.deploy();
    await nft.deployed();

    RewardToken = await ethers.getContractFactory("BTMTRewardToken");
    rewardToken = await upgrades.deployProxy(RewardToken, [], {
      kind: "uups",
    });
    await rewardToken.deployed();

    Staking = await ethers.getContractFactory("BTMTStaking");
    staking = await upgrades.deployProxy(
      Staking,
      [rewardToken.address, nft.address, owner.address],
      {
        kind: "uups",
      }
    );
    await staking.deployed();

    //settings
    await rewardToken.setMinter(staking.address, true);
  });

  const signMessage = async (tokenId, amount, owner, operator, nonce) => {
    const messageHash = ethers.utils.solidityKeccak256(
      ["uint256", "uint256", "address", "address", "address", "uint256"],
      [tokenId, amount, owner, operator.address, staking.address, nonce]
    );

    const signature = await operator.signMessage(
      ethers.utils.arrayify(messageHash)
    );

    return signature;
  };

  describe("Check stake", () => {
    it("It should be stake revert because pause", async function () {
      await nft.safeMint(owner.address);
      await nft.setApprovalForAll(staking.address, true);
      await staking.pause();
      await expect(staking.stake(1)).to.be.reverted;
      // unpause and restake
      await staking.unpause();
      await staking.stake(1);
      expect(await nft.ownerOf(1)).to.equal(staking.address);
    });

    it("It should be revert when restake ", async function () {
      await nft.safeMint(owner.address);
      await nft.setApprovalForAll(staking.address, true);

      await staking.stake(1);

      expect(await nft.ownerOf(1)).to.equal(staking.address);

      await expect(staking.stake(1)).to.be.reverted;
    });

    it("It should be stake success", async function () {
      await nft.safeMint(owner.address);

      expect(await nft.tokenURI(1)).to.equal(
        "ipfs://QmQJaLuKpwpc5d9aMuLnvqcr5w6qDUNSbBJaULuvzwtvUf/1.json"
      );

      await nft.setApprovalForAll(staking.address, true);

      await staking.stake(1);

      expect(await nft.ownerOf(1)).to.equal(staking.address);
    });
  });

  describe("Check claim", () => {
    it("It should be claim success", async function () {
      await nft.connect(addr1).safeMint(addr1.address);
      await nft.connect(addr1).setApprovalForAll(staking.address, true);

      await staking.connect(addr1).stake(1);

      const validSignature = await signMessage(
        1,
        10000,
        addr1.address,
        owner,
        1
      );

      await staking.connect(addr1).claimReward(1, 10000, 1, validSignature);

      await expect(
        staking.claimReward(1, 10000, 1, validSignature)
      ).to.be.revertedWith("Not owner");

      expect(await nft.ownerOf(1)).to.equal(staking.address);

      expect((await rewardToken.balanceOf(addr1.address)).toNumber()).to.equal(
        10000
      );
    });

    it("It should be claim fail because pause", async function () {
      await nft.connect(addr1).safeMint(addr1.address);
      await nft.connect(addr1).setApprovalForAll(staking.address, true);

      await staking.connect(addr1).stake(1);

      const validSignature = await signMessage(
        1,
        10000,
        addr1.address,
        owner,
        1
      );
      await staking.pause();
      // const paused = await staking.paused()
      // console.log(paused, "Paused ")
      await expect(
        staking.connect(addr1).claimReward(1, 10000, 1, validSignature)
      ).to.be.reverted;
    });
    it("It should be revert because invalid signature", async function () {
      await nft.connect(addr1).safeMint(addr1.address);
      await nft.connect(addr1).setApprovalForAll(staking.address, true);

      await staking.connect(addr1).stake(1);

      const validSignature = await signMessage(
        1,
        10000,
        addr2.address,
        owner,
        1
      );
      await staking.pause();
      await expect(
        staking.connect(addr1).claimReward(1, 1000, 1, validSignature)
      ).to.be.reverted;
    });
  });

  describe("Check unstake", () => {
    it("It should be unstake success", async function () {
      await nft.connect(addr1).safeMint(addr1.address);
      await nft.connect(addr1).setApprovalForAll(staking.address, true);

      await staking.connect(addr1).stake(1);

      const validSignature = await signMessage(
        1,
        1000000,
        addr1.address,
        owner,
        1
      );

      await staking.connect(addr1).unStake(1, 1000000, 1, validSignature);

      expect(await nft.ownerOf(1)).to.equal(addr1.address);

      expect((await rewardToken.balanceOf(addr1.address)).toNumber()).to.equal(
        1000000
      );
    });

    it("It should be unstake revert because pause", async function () {
      await nft.connect(addr1).safeMint(addr1.address);
      await nft.connect(addr1).setApprovalForAll(staking.address, true);

      await staking.connect(addr1).stake(1);

      const validSignature = await signMessage(
        1,
        1000000,
        addr1.address,
        owner,
        1
      );
      await staking.pause();
      await expect(staking.connect(addr1).unStake(1, 1000000, validSignature))
        .to.be.reverted;
    });

    it("It should be unstake revert because invalid signature", async function () {
      await nft.connect(addr1).safeMint(addr1.address);
      await nft.connect(addr1).setApprovalForAll(staking.address, true);

      await staking.connect(addr1).stake(1);

      const validSignature = await signMessage(
        1,
        1000000,
        addr1.address,
        owner,
        1
      );
      const invalidSignature = await signMessage(
        1,
        1000000,
        owner.address,
        owner,
        2
      );
      await expect(staking.connect(addr1).unStake(1, 100000, invalidSignature))
        .to.be.reverted;

      await staking.pause();
      await expect(staking.connect(addr1).unStake(1, 100000, validSignature)).to
        .be.reverted;
    });
  });

  describe("Check pause", () => {
    beforeEach(async () => {
      // await rewardToken.initialize()
    });

    it("It should be revert because not owner", async () => {
      await expect(staking.connect(addr1).pause()).to.be.reverted;

      await expect(staking.connect(addr1).unpause()).to.be.reverted;
    });

    it("It should be pause after call pause()", async () => {
      let paused = await staking.paused();
      expect(paused).to.equal(false);

      await staking.pause();
      paused = await staking.paused();
      expect(paused).to.equal(true);

      await staking.unpause();
      paused = await staking.paused();
      expect(paused).to.equal(false);
    });
  });

  describe("Check set reward token and set collection ", () => {
    beforeEach(async () => {
      // await rewardToken.initialize()
    });
    it("It should be revert because not owner", async () => {
      await expect(staking.connect(addr1).setRewardToken(rewardToken.address))
        .to.be.reverted;

      await expect(staking.connect(addr1).setCollection(rewardToken.address)).to
        .be.reverted;
    });

    it("It should be set exactly", async () => {
      await staking.setRewardToken(rewardToken.address);
      let addr = await staking.rewardToken.call();
      expect(addr).to.equal(rewardToken.address);

      await staking.setCollection(nft.address);
      addr = await staking.btmtCollection.call();
      expect(addr).to.equal(nft.address);
    });
  });

  it("Check re initialize: It should be reverted", async () => {
    await expect(staking.connect(addr1).initialize()).to.be.reverted;

    await expect(staking.initialize()).to.be.reverted;
  });

  describe("Check _authorizeUpgrade", () => {
    beforeEach(async () => {});

    it("Address after upgrade should be not change", async () => {
      // rewardToken = await upgrades.deployProxy(RewardToken, [], {
      //   kind: "uups",
      // });
      const addr = staking.address;
      const stakingV2 = await upgrades.upgradeProxy(staking.address, Staking); // just test
      expect(stakingV2.address).to.equal(addr);
    });
  });
});
