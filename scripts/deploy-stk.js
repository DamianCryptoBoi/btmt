const { ethers, upgrades } = require("hardhat");

const erc20_abi =
  require("../artifacts/contracts/BTMTRewardToken.sol/BTMTRewardToken.json").abi;

const nft_abi =
  require("../artifacts/contracts/BTMTNFT.sol/BTMTCollection.json").abi;

const NFT_ADDRESS = "0xE3023C788210E39fCa91728e7621b82Dfb996683";
const ERC20_ADDRESS = "0x723621de8C7d7a513d11451B42dCf88A6E9A6F95";

// Collection: 0xE3023C788210E39fCa91728e7621b82Dfb996683
// Reward Token: 0x723621de8C7d7a513d11451B42dCf88A6E9A6F95
// Staking: 0x238cBAf3A5a400804e0cC1150e60E5b7bEf8a7f6

const TREASURY_WALLET = "0x1Cb54FEcA29A7D4ce1566E0aF3b48C8D609A035C";

const OPERATOR_WALLET = "0x257a7f986689Cc50cfef202fC5974AE2af251f80";

async function main() {
  console.log("Starting...");
  [owner, treasury] = await ethers.getSigners();
  const TREASURY_WALLET = treasury.address;

  const nft = new ethers.Contract(NFT_ADDRESS, nft_abi, owner);

  const rewardToken = new ethers.Contract(ERC20_ADDRESS, erc20_abi, owner);

  // Staking = await ethers.getContractFactory("BTMTStaking");
  // staking = await upgrades.deployProxy(
  //   Staking,
  //   [rewardToken.address, nft.address, OPERATOR_WALLET, TREASURY_WALLET],
  //   {
  //     kind: "uups",
  //   }
  // );
  // await staking.deployed();

  // console.log("Staking: " + staking.address);

  await rewardToken
    .connect(treasury)
    .approve(
      "0x238cBAf3A5a400804e0cC1150e60E5b7bEf8a7f6",
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
