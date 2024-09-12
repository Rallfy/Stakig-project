const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const stakingContractAddress = process.env.STAKING_CONTRACT_ADDRESS;

  const stakingABI = require("../artifacts/contracts/Staking.sol/Staking.json").abi;

  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, ethers.provider);
  const stakingContract = new ethers.Contract(stakingContractAddress, stakingABI, signer);

  const amount = ethers.parseEther("0.05"); 
  const tx = await stakingContract.withdraw(amount);
  console.log("Withdraw transaction hash:", tx.hash)

  const receipt = await tx.wait();
  console.log("Withdraw confirmed in block:", receipt.blockNumber);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
