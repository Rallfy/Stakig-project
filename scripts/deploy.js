const hre = require("hardhat");

async function main() {
  //we get the contract to deploy
  const ERC20 = await hre.ethers.getContractFactory("ERC20Token"); // ERC20 token contract
  const stakingToken = await ERC20.deploy(
    "Test Token",
    "TST",
    hre.ethers.parseEther("10000")
  ); //an initial supply
  console.log("Staking Token deployed to:", stakingToken.target);

  const Staking = await hre.ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(
    stakingToken.target, 
    hre.ethers.parseEther("0.1"), // Reward rate
    hre.ethers.parseEther("100"), // Lower bound
    hre.ethers.parseEther("1000") // Upper bound
  );
  console.log("Staking contract deployed to:", staking.target);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
