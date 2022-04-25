const { ethers } = require("hardhat");

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

  console.log("Reward Token: " + rewardToken);

  Staking = await ethers.getContractFactory("BTMTStaking");
  staking = await upgrades.deployProxy(
    Staking,
    [rewardToken.address, nft.address, owner.address],
    {
      kind: "uups",
    }
  );
  await staking.deployed();

  console.log("Staking: " + staking);

  //settings
  await rewardToken.setMinter(staking.address, true);

  console.log("DONE");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
