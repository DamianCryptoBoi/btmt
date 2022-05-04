const { ethers, upgrades } = require("hardhat");

const STAKING_CONTRACT = "0xf675899b19264a3508B8eecf9c411662dabA74Ce";
async function main() {
  console.log("Starting...");
  [owner] = await ethers.getSigners();

  Staking = await ethers.getContractFactory("BTMTStaking");

  await upgrades.forceImport(STAKING_CONTRACT, Staking, { kind: "uups" });

  const stakingV2 = await upgrades.upgradeProxy(STAKING_CONTRACT, Staking); // just test

  console.log("DONE");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
