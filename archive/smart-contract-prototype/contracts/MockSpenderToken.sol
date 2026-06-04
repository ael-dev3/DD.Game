// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title MockSpenderToken
/// @notice Faucet ERC20 used only for local/Base Sepolia prototype spending.
contract MockSpenderToken is ERC20, Ownable {
    uint256 public faucetAmount = 1_000 ether;

    event FaucetAmountUpdated(uint256 amount);

    constructor(string memory tokenName, string memory tokenSymbol) ERC20(tokenName, tokenSymbol) Ownable(msg.sender) {}

    function faucet() external {
        _mint(msg.sender, faucetAmount);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function setFaucetAmount(uint256 amount) external onlyOwner {
        faucetAmount = amount;
        emit FaucetAmountUpdated(amount);
    }
}
