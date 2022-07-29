const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Staking", function () {
  beforeEach(async () => {
    [owner, addr1, addr2, addr3, treasury] = await ethers.getSigners();

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
      [rewardToken.address, nft.address, owner.address, treasury.address],
      {
        kind: "uups",
      }
    );
    await staking.deployed();

    //settings

    await rewardToken.transfer(
      treasury.address,
      ethers.utils.parseEther("1000000")
    );

    await rewardToken
      .connect(treasury)
      .approve(staking.address, ethers.utils.parseEther("100000"));

    await nft.safeMint(owner.address);
  });

  it("deploy", async function () {});
});
