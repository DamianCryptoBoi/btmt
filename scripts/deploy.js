const { ethers, upgrades } = require("hardhat");

const TREASURY_WALLET = "0x073cd8D92D058FAa97CB958829a0C9c86578C4dA";
async function main() {
  console.log("Starting...");
  [owner] = await ethers.getSigners();

  NFT = await ethers.getContractFactory("BTMTCollection");
  nft = await NFT.deploy();
  await nft.deployed();

  console.log("Collection: " + nft.address);

  RewardToken = await ethers.getContractFactory("BTMTRewardToken");
  rewardToken = await upgrades.deployProxy(RewardToken, [], {
    kind: "uups",
  });
  await rewardToken.deployed();

  console.log("Reward Token: " + rewardToken.address);

  Staking = await ethers.getContractFactory("BTMTStaking");
  staking = await upgrades.deployProxy(
    Staking,
    [rewardToken.address, nft.address, owner.address],
    {
      kind: "uups",
    }
  );
  await staking.deployed();

  console.log("Staking: " + staking.address);

  //settings
  console.log("set minter");
  await rewardToken.setMinter(staking.address, true);
  console.log("mint all nft to treasury");
  for (let i = 0; i < 10; i++) {
    await nft.safeMintMultiple(TREASURY_WALLET, 100);
    console.log("minted: " + 100 * (i + 1));
  }
  await nft.safeMintMultiple(TREASURY_WALLET, 100);

  console.log("DONE");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
