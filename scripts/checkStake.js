const { ethers } = require("hardhat");
require('dotenv').config;
console.log("ENV Staking Contract Address:", process.env.STAKING_CONTRACT_ADDRESS);


console.log("ENV Staking Contract Address:", process.env.STAKING_CONTRACT_ADDRESS);

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

    const stakingContractAddress = process.env.STAKING_CONTRACT_ADDRESS;
    const stakingContractABI = require("../artifacts/contracts/Staking.sol/Staking.json").abi;
    
    const stakingContract = new ethers.Contract(stakingContractAddress, stakingContractABI, provider);

    const userAddress = "0x291c6E27105aF9358f8b60F7Bd1A3E5A4610160D";
    const stakeInfo = await stakingContract.stakes(userAddress);

    console.log("Staked amount:", ethers.formatEther(stakeInfo.amount.toString()));
    console.log("Timestamp of last stake:", stakeInfo.timestamp.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
