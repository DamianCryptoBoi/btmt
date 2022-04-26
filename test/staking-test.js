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

  const signMessage = async (tokenId, amount, owner, operator) => {
    const messageHash = ethers.utils.solidityKeccak256(
      ["uint256", "uint256", "address", "address", "address"],
      [tokenId, amount, owner, operator.address, staking.address]
    );

    const signature = await operator.signMessage(
      ethers.utils.arrayify(messageHash)
    );

    return signature;
  };

  it("Stake", async function () {
    await nft.safeMint(owner.address);
    await nft.setApprovalForAll(staking.address, true);

    await staking.stake(0);

    expect(await nft.ownerOf(0)).to.equal(staking.address);
  });

  it("claim", async function () {
    await nft.connect(addr1).safeMint(addr1.address);
    await nft.connect(addr1).setApprovalForAll(staking.address, true);

    await staking.connect(addr1).stake(0);

    const validSignature = await signMessage(0, 10000, addr1.address, owner);

    await staking.connect(addr1).claimReward(0, 10000, validSignature);

    await expect(
      staking.claimReward(0, 10000, validSignature)
    ).to.be.revertedWith("Not owner");

    expect(await nft.ownerOf(0)).to.equal(staking.address);

    expect((await rewardToken.balanceOf(addr1.address)).toNumber()).to.equal(
      10000
    );
  });

  it("Unstake", async function () {
    await nft.connect(addr1).safeMint(addr1.address);
    await nft.connect(addr1).setApprovalForAll(staking.address, true);

    await staking.connect(addr1).stake(0);

    const validSignature = await signMessage(0, 1000000, addr1.address, owner);

    await staking.connect(addr1).unStake(0, 1000000, validSignature);

    expect(await nft.ownerOf(0)).to.equal(addr1.address);

    expect((await rewardToken.balanceOf(addr1.address)).toNumber()).to.equal(
      1000000
    );
  });
});
