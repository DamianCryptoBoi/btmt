const { ethers, upgrades } = require("hardhat");

const erc20_abi =
  require("../artifacts/contracts/BTMTRewardToken.sol/BTMTRewardToken.json").abi;

const nft_abi =
  require("../artifacts/contracts/BTMTNFT.sol/BTMTCollection.json").abi;

const NFT_ADDRESS = "0x528e006268668aa5E0591A1B980810881f2198bb";
const ERC20_ADDRESS = "0x1Ad78f576f634e645B158DC6B0d14c7a6D544F2A";

async function main() {
  console.log("Starting...");
  [owner, treasury] = await ethers.getSigners();
  const TREASURY_WALLET = treasury.address;

  const nft = new ethers.Contract(NFT_ADDRESS, nft_abi, owner);

  const rewardToken = new ethers.Contract(ERC20_ADDRESS, erc20_abi, owner);

  Staking = await ethers.getContractFactory("BTMTStaking");
  staking = await upgrades.deployProxy(
    Staking,
    [rewardToken.address, nft.address, owner.address, TREASURY_WALLET],
    {
      kind: "uups",
    }
  );
  await staking.deployed();

  console.log("Staking: " + staking.address);

  //settings

  await rewardToken.mint(
    TREASURY_WALLET,
    ethers.utils.parseEther("100000000000000000000000")
  );

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
