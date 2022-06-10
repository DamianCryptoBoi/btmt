const { ethers, upgrades } = require("hardhat");

const NFT = "0x7b37339b952CBDDdBb2CFb71451149D9B10DC178";

const abi =
  require("../artifacts/contracts/BTMTNFT.sol/BTMTCollection.json").abi;
async function main() {
  console.log("Starting...");
  [owner, treasury] = await ethers.getSigners();

  const nft = await ethers.getContractAt(abi, NFT, owner);

  // await nft.safeMintMultiple(treasury.address, 50);
  // await nft.safeMintMultiple(treasury.address, 50);

  // await nft.safeMintMultiple(treasury.address, 50);

  const supply = await nft.totalSupply();

  const addr1 = await nft.ownerOf(99);

  console.log(supply.toNumber());
  console.log(addr1);
  console.log("done");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
