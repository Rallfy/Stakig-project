const express = require("express");
const ethers = require("ethers");
const { Connection, PublicKey } = require("@solana/web3.js");
require("dotenv").config();

const app = express();
const port = 3000;

// staking contract address !!THIS IS COMMENT FOR THE DEPLOY
const stakingContractAddress = process.env.STAKING_CONTRACT_ADDRESS;

// load abi of the staking contract 
// const stakingContractABI = require("../artifacts/contracts/Staking.sol/Staking.json").abi;

// create a contract instance !!THIS IS COMMENT FOR THE DEPLOY
// const stakingContract = new ethers.Contract(
//  stakingContractAddress,
//  stakingContractABI,
//  provider
// );

// test the connection by getting the contract address !!THIS IS COMMENT FOR THE DEPLOY
// app.get("/contract-info", async (req, res) => {
//   try {
//     const contractAddress = process.env.STAKING_CONTRACT_ADDRESS;
//     res.send(`Staking Contract Address: ${contractAddress}`);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("error getting contract info");
//   }
// });

// get user staking information !!THIS IS COMMENT FOR THE DEPLOY
// app.get("/staking-info/:address", async (req, res) => {
//   const userAddress = req.params.address;
//   try {
//     const userStake = await stakingContract.stakes(userAddress);
//     const rewardRate = BigInt(await stakingContract.rewardRate());
//     const currentTime = BigInt(Math.floor(Date.now() / 1000));
//     const stakedTime = BigInt(userStake.timestamp);
//     const stakedAmount = BigInt(userStake.amount.toString());
//     const pendingRewards = (stakedAmount * rewardRate * (currentTime - stakedTime)) / BigInt(1e18);
    
//     res.json({
//       address: userAddress,
//       stakedAmount: ethers.formatEther(stakedAmount),
//       pendingRewards: ethers.formatEther(pendingRewards),
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("error fetching staking info");
//   }
// });

// connect to solana mainnet-beta
const solanaConnection = new Connection(process.env.SOLANA_RPC_URL);

// endpoint for Solana SPL Token
app.get("/solana/token-supply", async (req, res) => {
  try {
    const mintAddress = new PublicKey(process.env.SOLANA_MINT_ADDRESS);
    const tokenSupply = await connection.getTokenSupply(mintAddress);
    res.json({ totalSupply: tokenSupply.value.uiAmount });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching token supply");
  }
});

// get token balance of a specific Solana wallet
app.get("/solana/token-balance/:address", async (req, res) => {
  try {
    const walletAddress = new PublicKey(req.params.address);
    const mintAddress = new PublicKey(process.env.SOLANA_MINT_ADDRESS);
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletAddress,
      { mint: mintAddress }
    );
    
    const tokenBalance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
    res.json({ address: req.params.address, tokenBalance });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching token balance");
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
