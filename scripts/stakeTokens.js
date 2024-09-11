const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // Token Contract
  const tokenContractAddress = process.env.TOKEN_CONTRACT_ADDRESS;
  const tokenContractABI =
    require("../artifacts/contracts/ERC20Token.sol/ERC20Token.json").abi;
  const tokenContract = new ethers.Contract(
    tokenContractAddress,
    tokenContractABI,
    wallet
  );

  // Staking Contract
  const stakingContractAddress = process.env.STAKING_CONTRACT_ADDRESS;
  const stakingContractABI =
    require("../artifacts/contracts/Staking.sol/Staking.json").abi;
  const stakingContract = new ethers.Contract(
    stakingContractAddress,
    stakingContractABI,
    wallet
  );

  const amountToStake = ethers.parseEther("10"); 


  const approveTx = await tokenContract.approve(
    stakingContractAddress,
    amountToStake
  );
  await approveTx.wait();


  const stakeTx = await stakingContract.stake(amountToStake);
  await stakeTx.wait();

  console.log("Tokens successfully staked!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
