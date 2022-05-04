const { ethers } = require("hardhat");
const abi =
  require("../artifacts/contracts/BTMTRewardToken.sol/BTMTRewardToken.json").abi;

async function main() {
  [owner] = await ethers.getSigners();

  const erc20 = new ethers.Contract(
    "0x1Ad78f576f634e645B158DC6B0d14c7a6D544F2A",
    abi,
    owner
  );

  //   await erc20.setMinter(owner.address, true);

  await erc20.mint(
    "0x4749F09686e2D143F5d855a3ff2449d23681eE63",
    ethers.utils.parseEther("1000000")
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
