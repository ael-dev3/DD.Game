// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IRewardToken {
    function mint(address to, uint256 amount) external;
}

/// @title DegenDogUndergroundClub
/// @notice Clean-room, testnet-only underground club resource game prototype.
contract DegenDogUndergroundClub is Ownable {
    enum Resource {
        NONE,
        BONES,
        HYPE,
        VIBE,
        SECURITY
    }

    enum ClubStatus {
        ACTIVE,
        AFTERHOURS,
        SHUT_DOWN
    }

    enum ActionType {
        DOOR,
        BAR,
        SET,
        PROMO,
        RAID
    }

    uint256 public constant DOOR_COOLDOWN = 6 hours;
    uint256 public constant BAR_COOLDOWN = 4 hours;
    uint256 public constant SET_COOLDOWN = 12 hours;
    uint256 public constant PROMO_COOLDOWN = 3 hours;
    uint256 public constant RAID_COOLDOWN = 12 hours;
    uint256 public constant NIGHT_RUN_WINDOW = 72 hours;
    uint256 public constant SHUTDOWN_GRACE = 48 hours;
    uint8 public constant MAX_UPGRADE_LEVEL = 5;
    uint256 public constant RAID_STEAL_BPS = 1500;
    uint32 public constant RAID_MAX_STEAL = 75;
    uint32 public constant RAID_MIN_TARGET_RESOURCE = 20;
    uint256 public constant DROP_SET_SPENDER_COST = 15 ether;
    uint256 public constant NIGHT_RUN_SPENDER_COST = 25 ether;
    uint256 public constant REVIVE_SPENDER_COST = 50 ether;
    uint32 public constant NIGHT_RUN_BONES_COST = 20;
    uint32 public constant NIGHT_RUN_VIBE_COST = 5;
    uint32 public constant DROP_SET_VIBE_COST = 10;

    IERC20 public immutable spenderToken;
    IRewardToken public immutable rewardToken;

    struct Club {
        bool exists;
        address owner;
        bytes32 name;
        uint64 createdAt;
        uint64 lastNightRunAt;
        uint64 lastDoorWorkAt;
        uint64 lastBarRunAt;
        uint64 lastSetDropAt;
        uint64 lastPromoAt;
        uint64 lastRaidAt;
        uint64 lastActionAt;
        uint32 score;
        uint32 bones;
        uint32 hype;
        uint32 vibe;
        uint32 security;
        uint32 heat;
        uint32 pendingRewards;
        uint8 protectedResource;
        uint8 djBoothLevel;
        uint8 securityTeamLevel;
        uint8 vipKennelLevel;
        uint8 backRoomLevel;
        uint8 neonSignLevel;
        uint16 successfulActions;
        uint16 successfulRaids;
        uint16 successfulDefenses;
    }

    struct ClubView {
        address owner;
        bytes32 name;
        uint64 createdAt;
        uint64 lastNightRunAt;
        uint64 lastActionAt;
        uint32 score;
        uint32 bones;
        uint32 hype;
        uint32 vibe;
        uint32 security;
        uint32 heat;
        uint32 pendingRewards;
        uint8 protectedResource;
        uint8 djBoothLevel;
        uint8 securityTeamLevel;
        uint8 vipKennelLevel;
        uint8 backRoomLevel;
        uint8 neonSignLevel;
        uint16 successfulActions;
        uint16 successfulRaids;
        uint16 successfulDefenses;
    }

    struct Cooldowns {
        uint64 doorReadyAt;
        uint64 barReadyAt;
        uint64 setReadyAt;
        uint64 promoReadyAt;
        uint64 raidReadyAt;
        uint64 nightDueAt;
        uint64 shutdownAt;
    }

    mapping(address => Club) private clubs;

    error ClubAlreadyExists();
    error ClubMissing(address player);
    error ClubShutDown();
    error ActionOnCooldown(uint64 readyAt);
    error InvalidResource();
    error InvalidUpgrade();
    error InvalidAction();
    error UpgradeMaxed();
    error InsufficientResource(uint8 resource, uint32 required, uint32 available);
    error SpenderPaymentFailed();
    error InvalidRaidTarget();
    error NothingToClaim();
    error NotShutdown();

    event ClubCreated(address indexed player, bytes32 clubName, uint64 createdAt);
    event NightRun(address indexed player, uint256 spenderCost, uint32 newScore);
    event ClubRevived(address indexed player, uint256 spenderCost);
    event DoorWorked(address indexed player, uint32 bonesGained, uint32 securityGained);
    event BarRun(address indexed player, uint32 bonesGained, uint32 vibeGained);
    event SetDropped(address indexed player, uint32 hypeGained, uint32 rewardEarned, uint256 spenderCost);
    event StreetPromo(address indexed player, uint32 hypeGained, uint32 heatGained);
    event UpgradePurchased(address indexed player, uint8 upgradeType, uint8 newLevel, uint32 bonesCost, uint32 vibeCost);
    event DefenseSet(address indexed player, uint8 protectedResource);
    event RaidResolved(address indexed attacker, address indexed defender, uint8 resource, bool defenderWon, uint32 amountStolen);
    event RewardClaimed(address indexed player, uint256 amount);

    constructor(address spenderToken_, address rewardToken_, address admin_) Ownable(admin_) {
        if (spenderToken_ == address(0) || rewardToken_ == address(0) || admin_ == address(0)) revert SpenderPaymentFailed();
        spenderToken = IERC20(spenderToken_);
        rewardToken = IRewardToken(rewardToken_);
    }

    function createClub(bytes32 clubName) external {
        Club storage club = clubs[msg.sender];
        if (club.exists) revert ClubAlreadyExists();

        uint64 now_ = uint64(block.timestamp);
        club.exists = true;
        club.owner = msg.sender;
        club.name = clubName;
        club.createdAt = now_;
        club.lastNightRunAt = now_;
        club.lastActionAt = now_;
        club.bones = 160;
        club.vibe = 60;
        club.security = 30;
        club.score = 100;

        emit ClubCreated(msg.sender, clubName, now_);
    }

    function runNight() external onlyClub(msg.sender) {
        if (getClubStatus(msg.sender) == ClubStatus.SHUT_DOWN) revert ClubShutDown();
        Club storage club = clubs[msg.sender];
        _spendResource(club, Resource.BONES, NIGHT_RUN_BONES_COST);
        _spendResource(club, Resource.VIBE, NIGHT_RUN_VIBE_COST);
        _takeSpender(msg.sender, NIGHT_RUN_SPENDER_COST);

        club.lastNightRunAt = uint64(block.timestamp);
        club.lastActionAt = uint64(block.timestamp);
        club.heat = club.heat > 10 ? club.heat - 10 : 0;
        club.score += 35 + uint32(club.neonSignLevel) * 5;

        emit NightRun(msg.sender, NIGHT_RUN_SPENDER_COST, club.score);
    }

    function reviveClub() external onlyClub(msg.sender) {
        if (getClubStatus(msg.sender) != ClubStatus.SHUT_DOWN) revert NotShutdown();
        Club storage club = clubs[msg.sender];
        _takeSpender(msg.sender, REVIVE_SPENDER_COST);
        club.lastNightRunAt = uint64(block.timestamp);
        club.lastActionAt = uint64(block.timestamp);
        if (club.bones < 50) club.bones = 50;
        if (club.vibe < 20) club.vibe = 20;
        club.heat = club.heat / 2;
        club.score += 20;

        emit ClubRevived(msg.sender, REVIVE_SPENDER_COST);
    }

    function workDoor() external onlyClub(msg.sender) notShutDown(msg.sender) {
        Club storage club = clubs[msg.sender];
        _requireReady(club.lastDoorWorkAt, DOOR_COOLDOWN);

        uint32 bonesGained = _statusAdjusted(msg.sender, 15 + uint32(club.backRoomLevel) * 3);
        uint32 securityGained = _statusAdjusted(msg.sender, 15 + uint32(club.securityTeamLevel) * 5);
        club.bones += bonesGained;
        club.security += securityGained;
        club.score += bonesGained + securityGained;
        club.successfulActions += 1;
        club.lastDoorWorkAt = uint64(block.timestamp);
        club.lastActionAt = uint64(block.timestamp);

        emit DoorWorked(msg.sender, bonesGained, securityGained);
    }

    function runBar() external onlyClub(msg.sender) notShutDown(msg.sender) {
        Club storage club = clubs[msg.sender];
        _requireReady(club.lastBarRunAt, BAR_COOLDOWN);

        uint32 bonesGained = _statusAdjusted(msg.sender, 20 + uint32(club.backRoomLevel) * 4);
        uint32 vibeGained = _statusAdjusted(msg.sender, 18 + uint32(club.backRoomLevel) * 2);
        club.bones += bonesGained;
        club.vibe += vibeGained;
        club.score += bonesGained + vibeGained;
        club.successfulActions += 1;
        club.lastBarRunAt = uint64(block.timestamp);
        club.lastActionAt = uint64(block.timestamp);

        emit BarRun(msg.sender, bonesGained, vibeGained);
    }

    function dropSet() external onlyClub(msg.sender) notShutDown(msg.sender) {
        Club storage club = clubs[msg.sender];
        _requireReady(club.lastSetDropAt, SET_COOLDOWN);
        _spendResource(club, Resource.VIBE, DROP_SET_VIBE_COST);
        _takeSpender(msg.sender, DROP_SET_SPENDER_COST);

        uint32 hypeGained = _statusAdjusted(msg.sender, 30 + uint32(club.djBoothLevel) * 10 + uint32(club.neonSignLevel) * 4);
        uint32 rewardEarned = 25 + uint32(club.djBoothLevel) * 5 + uint32(club.neonSignLevel) * 2;
        club.hype += hypeGained;
        club.pendingRewards += rewardEarned;
        club.heat += 5;
        club.score += hypeGained + rewardEarned;
        club.successfulActions += 1;
        club.lastSetDropAt = uint64(block.timestamp);
        club.lastActionAt = uint64(block.timestamp);

        emit SetDropped(msg.sender, hypeGained, rewardEarned, DROP_SET_SPENDER_COST);
    }

    function streetPromo() external onlyClub(msg.sender) notShutDown(msg.sender) {
        Club storage club = clubs[msg.sender];
        _requireReady(club.lastPromoAt, PROMO_COOLDOWN);

        uint32 hypeGained = _statusAdjusted(msg.sender, 12 + uint32(club.neonSignLevel) * 4);
        uint32 heatGained = club.securityTeamLevel > 0 ? 2 : 3;
        club.hype += hypeGained;
        club.heat += heatGained;
        club.score += hypeGained;
        club.successfulActions += 1;
        club.lastPromoAt = uint64(block.timestamp);
        club.lastActionAt = uint64(block.timestamp);

        emit StreetPromo(msg.sender, hypeGained, heatGained);
    }

    function buyUpgrade(uint8 upgradeType) external onlyClub(msg.sender) notShutDown(msg.sender) {
        if (upgradeType > 4) revert InvalidUpgrade();
        Club storage club = clubs[msg.sender];
        uint8 current = _upgradeLevel(club, upgradeType);
        if (current >= MAX_UPGRADE_LEVEL) revert UpgradeMaxed();

        uint8 nextLevel = current + 1;
        uint32 bonesCost = uint32(nextLevel) * 15;
        uint32 vibeCost = uint32(nextLevel) * 4;
        _spendResource(club, Resource.BONES, bonesCost);
        _spendResource(club, Resource.VIBE, vibeCost);
        _setUpgradeLevel(club, upgradeType, nextLevel);
        club.score += uint32(nextLevel) * 25;
        club.lastActionAt = uint64(block.timestamp);

        emit UpgradePurchased(msg.sender, upgradeType, nextLevel, bonesCost, vibeCost);
    }

    function setDefense(uint8 resource) external onlyClub(msg.sender) {
        if (!_isRaidableResource(Resource(resource))) revert InvalidResource();
        clubs[msg.sender].protectedResource = resource;
        emit DefenseSet(msg.sender, resource);
    }

    function raidClub(address target, uint8 resource) external onlyClub(msg.sender) notShutDown(msg.sender) {
        if (target == msg.sender || !clubs[target].exists) revert InvalidRaidTarget();
        if (getClubStatus(target) == ClubStatus.SHUT_DOWN) revert InvalidRaidTarget();
        Resource selected = Resource(resource);
        if (!_isRaidableResource(selected)) revert InvalidResource();

        Club storage attacker = clubs[msg.sender];
        Club storage defender = clubs[target];
        _requireReady(attacker.lastRaidAt, RAID_COOLDOWN);
        attacker.lastRaidAt = uint64(block.timestamp);
        attacker.lastActionAt = uint64(block.timestamp);

        bool defenderWon = defender.protectedResource == resource;
        uint32 stolen = 0;
        if (defenderWon) {
            defender.successfulDefenses += 1;
            defender.security += 5 + uint32(defender.securityTeamLevel) * 2;
            defender.score += 25;
            attacker.heat += 10;
        } else {
            uint32 available = _resourceAmount(defender, selected);
            if (available >= RAID_MIN_TARGET_RESOURCE) {
                uint256 adjustedBps = getClubStatus(target) == ClubStatus.AFTERHOURS ? RAID_STEAL_BPS + 500 : RAID_STEAL_BPS;
                uint32 raw = uint32((uint256(available) * adjustedBps) / 10_000);
                uint32 defenseReduction = uint32(defender.securityTeamLevel) * 5;
                raw = raw > defenseReduction ? raw - defenseReduction : 0;
                stolen = raw > RAID_MAX_STEAL ? RAID_MAX_STEAL : raw;
                if (stolen > 0) {
                    _decreaseResource(defender, selected, stolen);
                    _increaseResource(attacker, selected, stolen);
                }
            }
            attacker.successfulRaids += 1;
            attacker.heat += 15;
            attacker.score += 20 + stolen;
        }

        emit RaidResolved(msg.sender, target, resource, defenderWon, stolen);
    }

    function claimRewards() external onlyClub(msg.sender) {
        Club storage club = clubs[msg.sender];
        uint32 rewards = club.pendingRewards;
        if (rewards == 0) revert NothingToClaim();
        club.pendingRewards = 0;
        uint256 amount = uint256(rewards) * 1 ether;
        rewardToken.mint(msg.sender, amount);
        emit RewardClaimed(msg.sender, amount);
    }

    function getClub(address player) external view onlyClub(player) returns (ClubView memory) {
        Club storage club = clubs[player];
        return ClubView({
            owner: club.owner,
            name: club.name,
            createdAt: club.createdAt,
            lastNightRunAt: club.lastNightRunAt,
            lastActionAt: club.lastActionAt,
            score: club.score,
            bones: club.bones,
            hype: club.hype,
            vibe: club.vibe,
            security: club.security,
            heat: club.heat,
            pendingRewards: club.pendingRewards,
            protectedResource: club.protectedResource,
            djBoothLevel: club.djBoothLevel,
            securityTeamLevel: club.securityTeamLevel,
            vipKennelLevel: club.vipKennelLevel,
            backRoomLevel: club.backRoomLevel,
            neonSignLevel: club.neonSignLevel,
            successfulActions: club.successfulActions,
            successfulRaids: club.successfulRaids,
            successfulDefenses: club.successfulDefenses
        });
    }

    function getClubStatus(address player) public view onlyClub(player) returns (ClubStatus) {
        Club storage club = clubs[player];
        uint256 elapsed = block.timestamp - uint256(club.lastNightRunAt);
        if (elapsed > NIGHT_RUN_WINDOW + SHUTDOWN_GRACE) return ClubStatus.SHUT_DOWN;
        if (elapsed > NIGHT_RUN_WINDOW) return ClubStatus.AFTERHOURS;
        return ClubStatus.ACTIVE;
    }

    function getCooldowns(address player) external view onlyClub(player) returns (Cooldowns memory) {
        Club storage club = clubs[player];
        return Cooldowns({
            doorReadyAt: _readyAt(club.lastDoorWorkAt, DOOR_COOLDOWN),
            barReadyAt: _readyAt(club.lastBarRunAt, BAR_COOLDOWN),
            setReadyAt: _readyAt(club.lastSetDropAt, SET_COOLDOWN),
            promoReadyAt: _readyAt(club.lastPromoAt, PROMO_COOLDOWN),
            raidReadyAt: _readyAt(club.lastRaidAt, RAID_COOLDOWN),
            nightDueAt: uint64(uint256(club.lastNightRunAt) + NIGHT_RUN_WINDOW),
            shutdownAt: uint64(uint256(club.lastNightRunAt) + NIGHT_RUN_WINDOW + SHUTDOWN_GRACE)
        });
    }

    function getUpgradeLevels(address player) external view onlyClub(player) returns (uint8[5] memory levels) {
        Club storage club = clubs[player];
        levels[0] = club.djBoothLevel;
        levels[1] = club.securityTeamLevel;
        levels[2] = club.vipKennelLevel;
        levels[3] = club.backRoomLevel;
        levels[4] = club.neonSignLevel;
    }

    function getScore(address player) external view onlyClub(player) returns (uint256) {
        Club storage club = clubs[player];
        uint256 uptimeBonus = (block.timestamp - uint256(club.createdAt)) / 1 days;
        uint256 multiplier = 100 + uint256(club.vipKennelLevel) * 5 + uint256(club.neonSignLevel) * 3;
        return ((uint256(club.score) + uptimeBonus) * multiplier) / 100;
    }

    function canRunNight(address player) external view onlyClub(player) returns (bool) {
        return getClubStatus(player) != ClubStatus.SHUT_DOWN;
    }

    function canAct(address player, uint8 actionType) external view onlyClub(player) returns (bool) {
        if (getClubStatus(player) == ClubStatus.SHUT_DOWN) return false;
        Club storage club = clubs[player];
        if (actionType == uint8(ActionType.DOOR)) return _readyAt(club.lastDoorWorkAt, DOOR_COOLDOWN) <= block.timestamp;
        if (actionType == uint8(ActionType.BAR)) return _readyAt(club.lastBarRunAt, BAR_COOLDOWN) <= block.timestamp;
        if (actionType == uint8(ActionType.SET)) return _readyAt(club.lastSetDropAt, SET_COOLDOWN) <= block.timestamp;
        if (actionType == uint8(ActionType.PROMO)) return _readyAt(club.lastPromoAt, PROMO_COOLDOWN) <= block.timestamp;
        if (actionType == uint8(ActionType.RAID)) return _readyAt(club.lastRaidAt, RAID_COOLDOWN) <= block.timestamp;
        revert InvalidAction();
    }

    modifier onlyClub(address player) {
        if (!clubs[player].exists) revert ClubMissing(player);
        _;
    }

    modifier notShutDown(address player) {
        if (getClubStatus(player) == ClubStatus.SHUT_DOWN) revert ClubShutDown();
        _;
    }

    function _requireReady(uint64 lastAt, uint256 cooldown) private view {
        uint64 readyAt = _readyAt(lastAt, cooldown);
        if (readyAt > block.timestamp) revert ActionOnCooldown(readyAt);
    }

    function _readyAt(uint64 lastAt, uint256 cooldown) private pure returns (uint64) {
        if (lastAt == 0) return 0;
        return uint64(uint256(lastAt) + cooldown);
    }

    function _statusAdjusted(address player, uint32 amount) private view returns (uint32) {
        return getClubStatus(player) == ClubStatus.AFTERHOURS ? amount / 2 : amount;
    }

    function _takeSpender(address player, uint256 amount) private {
        if (spenderToken.balanceOf(player) < amount || spenderToken.allowance(player, address(this)) < amount) revert SpenderPaymentFailed();
        bool ok = spenderToken.transferFrom(player, address(this), amount);
        if (!ok) revert SpenderPaymentFailed();
    }

    function _spendResource(Club storage club, Resource resource, uint32 amount) private {
        uint32 available = _resourceAmount(club, resource);
        if (available < amount) revert InsufficientResource(uint8(resource), amount, available);
        _decreaseResource(club, resource, amount);
    }

    function _resourceAmount(Club storage club, Resource resource) private view returns (uint32) {
        if (resource == Resource.BONES) return club.bones;
        if (resource == Resource.HYPE) return club.hype;
        if (resource == Resource.VIBE) return club.vibe;
        if (resource == Resource.SECURITY) return club.security;
        revert InvalidResource();
    }

    function _increaseResource(Club storage club, Resource resource, uint32 amount) private {
        if (resource == Resource.BONES) club.bones += amount;
        else if (resource == Resource.HYPE) club.hype += amount;
        else if (resource == Resource.VIBE) club.vibe += amount;
        else if (resource == Resource.SECURITY) club.security += amount;
        else revert InvalidResource();
    }

    function _decreaseResource(Club storage club, Resource resource, uint32 amount) private {
        if (resource == Resource.BONES) club.bones -= amount;
        else if (resource == Resource.HYPE) club.hype -= amount;
        else if (resource == Resource.VIBE) club.vibe -= amount;
        else if (resource == Resource.SECURITY) club.security -= amount;
        else revert InvalidResource();
    }

    function _upgradeLevel(Club storage club, uint8 upgradeType) private view returns (uint8) {
        if (upgradeType == 0) return club.djBoothLevel;
        if (upgradeType == 1) return club.securityTeamLevel;
        if (upgradeType == 2) return club.vipKennelLevel;
        if (upgradeType == 3) return club.backRoomLevel;
        if (upgradeType == 4) return club.neonSignLevel;
        revert InvalidUpgrade();
    }

    function _setUpgradeLevel(Club storage club, uint8 upgradeType, uint8 level) private {
        if (upgradeType == 0) club.djBoothLevel = level;
        else if (upgradeType == 1) club.securityTeamLevel = level;
        else if (upgradeType == 2) club.vipKennelLevel = level;
        else if (upgradeType == 3) club.backRoomLevel = level;
        else if (upgradeType == 4) club.neonSignLevel = level;
        else revert InvalidUpgrade();
    }

    function _isRaidableResource(Resource resource) private pure returns (bool) {
        return resource == Resource.BONES || resource == Resource.HYPE || resource == Resource.VIBE || resource == Resource.SECURITY;
    }
}
