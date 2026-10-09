const { ethers, network } = require("hardhat");

async function main() {
  console.log(`\n🔗 Deploying CertificateVerification to: ${network.name}`);
  console.log("─".repeat(50));

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log(`Deployer : ${deployer.address}`);
  console.log(`Balance  : ${ethers.formatEther(balance)} ETH`);

  if (network.name === "sepolia" && balance < ethers.parseEther("0.01")) {
    throw new Error("Insufficient Sepolia ETH — get some from sepoliafaucet.com");
  }

  // Deploy
  console.log("\nDeploying contract...");
  const Factory = await ethers.getContractFactory("CertificateVerification");
  const contract = await Factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const deployTx = contract.deploymentTransaction();

  console.log(`\n✅ Contract deployed!`);
  console.log(`Address  : ${address}`);
  console.log(`Tx Hash  : ${deployTx.hash}`);

  // Verify admin
  const admin = await contract.admin();
  console.log(`Admin    : ${admin}`);

  // Issue a sample certificate on local network
  if (network.name === "localhost" || network.name === "hardhat") {
    console.log("\n📜 Issuing sample certificate on local node...");
    const tx = await contract.issueCertificate(
      "CERT-2026-001",
      "Shaurya Kalra",
      "BSc Data Science & AI",
      "2026-10-01"
    );
    await tx.wait();
    console.log("Sample cert issued: CERT-2026-001");

    const [name, course, date, isValid] = await contract.verifyCertificate("CERT-2026-001");
    console.log(`Verified → ${name} | ${course} | ${date} | Valid: ${isValid}`);
  }

  console.log("\n─".repeat(50));
  console.log("Next steps:");

  if (network.name === "sepolia") {
    console.log(`1. Verify on Etherscan:`);
    console.log(`   npx hardhat verify --network sepolia ${address}`);
    console.log(`2. View on Sepolia Etherscan:`);
    console.log(`   https://sepolia.etherscan.io/address/${address}`);
  } else {
    console.log(`1. Paste this address into your dApp UI: ${address}`);
    console.log(`2. To deploy to Sepolia: npx hardhat run scripts/deploy.js --network sepolia`);
  }

  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
