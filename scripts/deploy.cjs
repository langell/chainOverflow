const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const Vault = await hre.ethers.getContractFactory("ChainOverflowVault");
  const vault = await Vault.deploy();

  await vault.waitForDeployment();

  console.log("ChainOverflowVault deployed to:", await vault.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
