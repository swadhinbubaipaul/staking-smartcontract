// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    // Store staking information for each user
    struct StakeInfo {
        uint256 amount;
        uint256 timestamp;
    }

    // User address => StakeInfo
    mapping(address => StakeInfo) public stakingInfo;

    // Reward rate in percentage (e.g., 10 = 10%)
    uint256 public constant REWARD_RATE = 10;

    constructor() ERC20("MyToken", "MTK") {}

    // Initially get some test tokens to stake
    function mint(uint256 amount) public {
        _mint(msg.sender, amount);
    }

    function stake(uint256 amount) external {
        require(amount > 0, "enter valid amount");
        require(
            balanceOf(msg.sender) >= amount,
            "amount is greater than token balance"
        );
        _transfer(msg.sender, address(this), amount);
        if (stakingInfo[msg.sender].amount > 0) {
            claim();
        }
        stakingInfo[msg.sender].timestamp = block.timestamp;
        stakingInfo[msg.sender].amount += amount;
    }

    function unstake(uint256 amount) external {
        require(amount > 0, "enter valid amount");
        require(
            stakingInfo[msg.sender].amount >= amount,
            "amount is greater than staked balance"
        );
        claim();
        stakingInfo[msg.sender].amount -= amount;
        _transfer(address(this), msg.sender, amount);
    }

    function claim() public {
        require(stakingInfo[msg.sender].amount > 0, "staked amount is zero");
        uint256 stakingDuration = block.timestamp -
            stakingInfo[msg.sender].timestamp;
        uint256 rewards = (stakingInfo[msg.sender].amount *
            stakingDuration *
            REWARD_RATE) / (100 * 365 days);
        stakingInfo[msg.sender].timestamp = block.timestamp;
        _mint(msg.sender, rewards);
    }

    // getter functions
    function getStakedAmount() external view returns (uint256) {
        return (stakingInfo[msg.sender].amount);
    }
}
