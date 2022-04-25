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

  const signMessage = async (signer, tokenId, amount) => {
    const messageHash = ethers.utils.solidityKeccak256(
      ["uint256", "uint256"],
      [tokenId, amount]
    );

    const signature = await signer.signMessage(
      ethers.utils.arrayify(messageHash)
    );

    return signature;
  };

  it("Stake", async function () {
    await nft.safeMint(owner.address);
    await nft.setApprovalForAll(staking.address, true);

    await staking.stake(0, 1);

    expect(await nft.ownerOf(0)).to.equal(staking.address);
  });

  it("UnStake", async function () {
    await nft.safeMint(owner.address);
    await nft.setApprovalForAll(staking.address, true);

    await staking.stake(0, 1);

    expect(await nft.ownerOf(0)).to.equal(staking.address);

    await staking.unStake(0);

    expect(await nft.ownerOf(0)).to.equal(owner.address);
  });

  it("Claim", async function () {
    await nft.connect(addr1).safeMint(addr1.address);
    await nft.connect(addr1).setApprovalForAll(staking.address, true);

    await staking.connect(addr1).stake(0, 1);

    const validSignature = await signMessage(owner, 0, 1000000);

    await staking.connect(addr1).claim(0, 1000000, validSignature);

    expect(await nft.ownerOf(0)).to.equal(addr1.address);

    expect((await rewardToken.balanceOf(addr1.address)).toNumber()).to.equal(
      1000000
    );
  });
});
