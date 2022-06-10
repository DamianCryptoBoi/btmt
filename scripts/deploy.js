const { ethers, upgrades } = require("hardhat");

const TREASURY_WALLET = "0x073cd8D92D058FAa97CB958829a0C9c86578C4dA";

const OPERATOR_WALLET = "0x257a7f986689Cc50cfef202fC5974AE2af251f80";

async function main() {
  console.log("Starting...");
  [owner, treasury] = await ethers.getSigners();

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
    [rewardToken.address, nft.address, OPERATOR_WALLET, TREASURY_WALLET],
    {
      kind: "uups",
    }
  );
  await staking.deployed();

  console.log("Staking: " + staking.address);

  //settings

  console.log("mint nft to treasury");
  // for (let i = 0; i < 50; i++) {
  //   await nft.safeMintMultiple(TREASURY_WALLET, 200);
  //   console.log("minted: " + 200 * (i + 1));
  // }
  await nft.safeMintMultiple(TREASURY_WALLET, 100);
  await nft.safeMintMultiple(TREASURY_WALLET, 100);

  console.log("transfer reward to treasury");

  await rewardToken.transfer(
    TREASURY_WALLET,
    ethers.utils.parseEther("100000")
  );

  console.log("treasury approve staking contract");

  await rewardToken
    .connect(treasury)
    .approve(
      staking.address,
      "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
    );

  console.log("DONE");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// KLAYTN - MAIN
// Collection: 0xE3023C788210E39fCa91728e7621b82Dfb996683
// Reward Token: 0x723621de8C7d7a513d11451B42dCf88A6E9A6F95
// Staking: 0x717FE256480E6da1fd2e83eA1c8AEbacA8f21963

// rinkeby
// Collection: 0x7b37339b952CBDDdBb2CFb71451149D9B10DC178
// Reward Token: 0x476F66e83Ad0049317091652313DfF50B906eF2e
// Staking: 0x02Da875b3E275813eC159bFe6876D8720080C7a1
