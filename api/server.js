const express = require("express");
const ethers = require("ethers");
const { Connection, PublicKey } = require("@solana/web3.js");
require("dotenv").config();

const app = express();
const port = 3000;

// connect to ethereum through infura
const provider = new ethers.JsonRpcProvider(process.env.INFURA_URL);

// staking contract address
const stakingContractAddress = process.env.STAKING_CONTRACT_ADDRESS;

// load abi of the staking contract
const stakingContractABI = JSON.parse(fs.readFileSync("api/abis/StakingABI.json", "utf-8")).abi;

// create a contract instance
const stakingContract = new ethers.Contract(
  stakingContractAddress,
  stakingContractABI,
  provider
);

// test the connection by getting the contract address
app.get("/contract-info", async (req, res) => {
  try {
    const contractAddress = process.env.STAKING_CONTRACT_ADDRESS;
    res.send(`Staking Contract Address: ${contractAddress}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("error getting contract info");
  }
});

// get user staking information
app.get("/staking-info/:address", async (req, res) => {
  const userAddress = req.params.address;
  try {
    const userStake = await stakingContract.stakes(userAddress);
    const rewardRate = BigInt(await stakingContract.rewardRate());
    const currentTime = BigInt(Math.floor(Date.now() / 1000));
    const stakedTime = BigInt(userStake.timestamp);
    const stakedAmount = BigInt(userStake.amount.toString());
    const pendingRewards = (stakedAmount * rewardRate * (currentTime - stakedTime)) / BigInt(1e18);
    
    res.json({
      address: userAddress,
      stakedAmount: ethers.formatEther(stakedAmount),
      pendingRewards: ethers.formatEther(pendingRewards),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("error fetching staking info");
  }
});

// connect to solana mainnet-beta
const solanaConnection = new Connection("https://api.mainnet-beta.solana.com");

// solana token public key
const tokenPublicKey = new PublicKey("EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm");

// get total supply of the spl token
app.get("/solana/token-supply", async (req, res) => {
  try {
    const tokenSupply = await solanaConnection.getTokenSupply(tokenPublicKey);
    res.json({ totalSupply: tokenSupply.value.uiAmount });
  } catch (error) {
    console.error(error);
    res.status(500).send("error fetching token supply");
  }
});

// get token balance of a specific wallet
app.get("/solana/token-balance/:address", async (req, res) => {
  const walletAddress = req.params.address;
  try {
    const walletPublicKey = new PublicKey(walletAddress);
    const tokenAccounts = await solanaConnection.getTokenAccountsByOwner(walletPublicKey, {
      mint: tokenPublicKey,
    });

    if (tokenAccounts.value.length === 0) {
      res.json({ address: walletAddress, tokenBalance: "0" });
    } else {
      const tokenBalance = await solanaConnection.getTokenAccountBalance(tokenAccounts.value[0].pubkey);
      res.json({ address: walletAddress, tokenBalance: tokenBalance.value.uiAmount });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("error fetching token balance");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
