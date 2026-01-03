require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    "base-sepolia": {
      url: "https://sepolia.base.org",
      accounts: process.env.INTERNAL_WALLET_PRIVATE_KEY ? [process.env.INTERNAL_WALLET_PRIVATE_KEY] : [],
    },
  },
};
