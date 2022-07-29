require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("@openzeppelin/hardhat-upgrades");

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.9",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    // hardhat: {
    // },
    baobab: {
      url: "https://public-node-api.klaytnapi.com/v1/baobab",
      accounts: [process.env.PRIVATE_KEY, process.env.PRIVATE_KEY_TREASURY],
      chainId: 1001,
      gas: "auto",
      gasLimit: "1000000000000",
    },
    // klaytn: {
    //   url: "https://public-node-api.klaytnapi.com/v1/cypress",
    //   accounts: [
    //     process.env.PRIVATE_KEY_MAIN,
    //     process.env.PRIVATE_KEY_TREASURY_MAIN,
    //   ],
    //   chainId: 8217,
    //   // gasLimit: "1000000000000",
    //   gasPrice: 250000000000,
    // },
    rinkeby: {
      url: process.env.PROVIDER_URL,
      accounts: [process.env.PRIVATE_KEY, process.env.PRIVATE_KEY_TREASURY], // 0x257a7f986689Cc50cfef202fC5974AE2af251f80, 0x073cd8D92D058FAa97CB958829a0C9c86578C4dA
      gas: 12000000,
      blockGasLimit: 0x1fffffffffffff,
      allowUnlimitedContractSize: true,
      timeout: 1800000,
    },

    mainnet: {
      url: process.env.PROVIDER_URL_MAINNET,
      accounts: [
        process.env.PRIVATE_KEY_MAINNET,
        process.env.PRIVATE_KEY_TREASURY_MAINNET,
      ], // 0xf80da36C43daaCA3B39dDb766d0E4246088E823f, 0xdB053fCcaD709Ca19e8E17B0a6752EE365b905cC
      chainId: 1,
      // gas: 12000000,
      // blockGasLimit: 0x1fffffffffffff,
      // timeout: 1800000,
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
  },

  etherscan: {
    apiKey: "UVE477915DMJIFSVTM5V3FI9Z17WUBGE2M",
  },
};
