const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Staking Contract", function () {
    let stakingToken, staking, owner, addr1, addr2;
    let initialSupply = ethers.parseEther("10000"); // 10000 tokens for test

    beforeEach(async function () {
        // ERC20 token for staking
        const ERC20 = await ethers.getContractFactory("ERC20Token");
        stakingToken = await ERC20.deploy("Test Token", "TST", initialSupply);
        await stakingToken.deployed();

        const Staking = await ethers.getContractFactory("Staking"); // the staking contract with initial reward rate and bounds
        staking = await Staking.deploy(
            stakingToken.address, 
            ethers.parseEther("0.1"), // reward rate (0.1 tokens per second)
            ethers.parseEther("100"), // lower bound
            ethers.parseEther("1000") // upper bound
        );
        await staking.deployed();

        [owner, addr1, addr2, _] = await ethers.getSigners();

        // put for addr1 and addr2 some tokens to stake
        await stakingToken.transfer(addr1.address, ethers.parseEther("1000"));
        await stakingToken.transfer(addr2.address, ethers.parseEther("1000"));
    });

    it("Should allow users to stake tokens", async function () {
        // we approve staking contract to spend tokens
        await stakingToken.connect(addr1).approve(staking.address, ethers.parseEther("500"));
        await staking.connect(addr1).stake(ethers.parseEther("500"));

        expect(await staking.totalStaked()).to.equal(ethers.parseEther("500"));
        expect((await staking.stakes(addr1.address)).amount).to.equal(ethers.parseEther("500"));
    });

    it("Should allow users to withdraw staked tokens", async function () {
        // stake tokens
        await stakingToken.connect(addr1).approve(staking.address, ethers.parseEther("500"));
        await staking.connect(addr1).stake(ethers.parseEther("500"));

        // withdraw part of the stake
        await staking.connect(addr1).withdraw(ethers.parseEther("200"));

        expect(await staking.totalStaked()).to.equal(ethers.parseEther("300"));
        expect((await staking.stakes(addr1.address)).amount).to.equal(ethers.parseEther("300"));
    });

    it("Should calculate rewards correctly", async function () {
        // stake tokens
        await stakingToken.connect(addr1).approve(staking.address, ethers.parseEther("500"));
        await staking.connect(addr1).stake(ethers.parseEther("500"));

        // timer for 10 seconds
        await ethers.provider.send("evm_increaseTime", [10]);
        await ethers.provider.send("evm_mine");

        // claim rewards
        await staking.connect(addr1).claimRewards();
        const rewardDebt = (await staking.stakes(addr1.address)).rewardDebt;

        expect(rewardDebt).to.equal(ethers.parseEther("1")); // the reward rate is 0.1 tokens/second, so after 10 seconds, it should be 1 token
    });
});
