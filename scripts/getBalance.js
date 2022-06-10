const { ethers } = require("hardhat");
const abi =
  require("../artifacts/contracts/BTMTRewardToken.sol/BTMTRewardToken.json").abi;

async function main() {
  [owner] = await ethers.getSigners();

  const erc20 = new ethers.Contract(
    "0x723621de8C7d7a513d11451B42dCf88A6E9A6F95",
    abi,
    owner
  );

  //   await erc20.setMinter(owner.address, true);

  const balance = await erc20.balanceOf(
    "0x1Cb54FEcA29A7D4ce1566E0aF3b48C8D609A035C"
  );

  console.log(balance.toString());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
