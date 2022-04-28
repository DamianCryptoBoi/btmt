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
    baobab: {
      url: "https://public-node-api.klaytnapi.com/v1/baobab",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 1001,
    },
    klaytn: {
      url: "https://public-node-api.klaytnapi.com/v1/cypress",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 8217,
      gasLimit: "1000000000000",
    },
  },
  gasReporter: {
    enabled: false,
    currency: "USD",
  },
};
