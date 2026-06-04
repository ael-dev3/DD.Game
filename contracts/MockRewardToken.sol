// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title MockRewardToken
/// @notice Mintable reward ERC20. Only the game contract may mint after setup.
contract MockRewardToken is ERC20, Ownable {
    address public game;

    error NotGame();
    error ZeroGameAddress();

    event GameUpdated(address indexed game);

    constructor(string memory tokenName, string memory tokenSymbol) ERC20(tokenName, tokenSymbol) Ownable(msg.sender) {}

    modifier onlyGame() {
        if (msg.sender != game) revert NotGame();
        _;
    }

    function setGame(address game_) external onlyOwner {
        if (game_ == address(0)) revert ZeroGameAddress();
        game = game_;
        emit GameUpdated(game_);
    }

    function mint(address to, uint256 amount) external onlyGame {
        _mint(to, amount);
    }
}
