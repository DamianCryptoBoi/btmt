const { ethers, upgrades } = require("hardhat");

const STAKING_CONTRACT = "0x717FE256480E6da1fd2e83eA1c8AEbacA8f21963";
async function main() {
  console.log("Starting...");
  [owner] = await ethers.getSigners();

  const Staking = await ethers.getContractFactory("BTMTStaking");

  await upgrades.forceImport(STAKING_CONTRACT, Staking, { kind: "uups" });

  const stakingV2 = await upgrades.upgradeProxy(STAKING_CONTRACT, Staking); // just test

  await stakingV2.setOperator("0x257a7f986689Cc50cfef202fC5974AE2af251f80");

  console.log("done");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
