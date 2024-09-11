// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;


import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Staking is Ownable {
    
    IERC20 public stakingToken; // token that users will stake in this contract

    struct Stake {
        uint256 amount;     // amount of tokens the user has staked
        uint256 timestamp;  // time when the user last staked or updated the stake
        uint256 rewardDebt; // rewards that the user has accumulated but not clamed
    }

    // mapping to store stake details for each user
    mapping(address => Stake) public stakes;

    uint256 public rewardRate;
    uint256 public totalStaked;
    uint256 public lowerBound;
    uint256 public upperBound;

    // the constructor
    constructor(IERC20 _stakingToken, uint256 _rewardRate, uint256 _lowerBound, uint256 _upperBound) Ownable(msg.sender) {
        stakingToken = _stakingToken;   
        rewardRate = _rewardRate;       
        lowerBound = _lowerBound;      
        upperBound = _upperBound;    
    }

    // function to adjust the reward rate based on the total staked amount
    function adjustRewardRate() internal {
        if (totalStaked < lowerBound) {
            rewardRate += rewardRate / 10; // if the total staked is less than the lower bound, increase it by 10%
        } else if (totalStaked > upperBound) {
            rewardRate -= rewardRate / 10; // if the total staked is more than the upper bound, decrease it by 10%
        }
    }

    // function to allow users to stake tokens
    function stake(uint256 amount) external {
        require(amount > 0, "cannot stake 0 tokens");

        stakingToken.transferFrom(msg.sender, address(this), amount); // transferring tokens from the user to the contract

        // if the user has already staked before, calculate their pending rewards based on how long they have staked
        if (stakes[msg.sender].amount > 0) {
            uint256 pendingReward = (stakes[msg.sender].amount * rewardRate * (block.timestamp - stakes[msg.sender].timestamp)) / 1e18;
            stakes[msg.sender].rewardDebt += pendingReward;  // add the pending rewards to the user reward debt
        }

        // update the user staked amount and timestamp
        stakes[msg.sender].amount += amount;
        stakes[msg.sender].timestamp = block.timestamp;

        
        totalStaked += amount; // increase the total amount staked in the contract
        adjustRewardRate(); // adjust the reward rate after the stake
    }

    // function to allow users to withdraw their staked tokens
    function withdraw(uint256 amount) external {
        require(stakes[msg.sender].amount >= amount, "withdraw amount exceeds stake");

        // calculate the user pending rewards based on how long they staked
        uint256 pendingReward = (stakes[msg.sender].amount * rewardRate * (block.timestamp - stakes[msg.sender].timestamp)) / 1e18;
        stakes[msg.sender].rewardDebt += pendingReward;  // add the pending rewards to the user reward debt

        stakes[msg.sender].amount -= amount; // reduce the user staked amount by the amount they are withdrawing
        stakingToken.transfer(msg.sender, amount); // transfer the tokens back to the user

        totalStaked -= amount; // reduce the total staked amount in the contract
        adjustRewardRate();  // adjust the reward rate after the withdrawal
    }

    // function to allow users to claim their accumulated rewards
    function claimRewards() external {
        // calculate the user pending rewards based on how long they hve staked
        uint256 pendingReward = (stakes[msg.sender].amount * rewardRate * (block.timestamp - stakes[msg.sender].timestamp)) / 1e18;
        uint256 totalReward = stakes[msg.sender].rewardDebt + pendingReward;  // add the pending reward to their previously rewards

        require(totalReward > 0, "no rewards to claim");  // make sure the user has rewards to claim

        stakes[msg.sender].rewardDebt = 0; // reset the user reward debt
        stakes[msg.sender].timestamp = block.timestamp; // update their timestamp
    }

    // function for the owner to deposit rewards into the contract
    function depositRewards(uint256 amount) external onlyOwner {
        stakingToken.transferFrom(msg.sender, address(this), amount);
    }

    // function for the owner to set or manually adjust the reward rate
    function setRewardRate(uint256 _rewardRate) external onlyOwner {
        rewardRate = _rewardRate;
    }
}
