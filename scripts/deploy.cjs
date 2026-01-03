const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const Vault = await ethers.getContractFactory("ChainOverflowVault");
  
  console.log("Deploying ChainOverflowVault (Proxy)...");
  const vault = await upgrades.deployProxy(Vault, [], {
    initializer: "initialize",
    kind: "uups",
  });

  await vault.waitForDeployment();
  const proxyAddress = await vault.getAddress();

  console.log("ChainOverflowVault deployed to:", proxyAddress);
  
  // Verify implementation address
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("Implementation address:", implementationAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
