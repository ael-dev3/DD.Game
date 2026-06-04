import { expect } from "chai";
import { ethers, network } from "hardhat";
import { parseEther } from "ethers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

const Resource = {
  None: 0,
  Bones: 1,
  Hype: 2,
  Vibe: 3,
  Security: 4
} as const;

const Upgrade = {
  DjBooth: 0,
  SecurityTeam: 1,
  VipKennel: 2,
  BackRoom: 3,
  NeonSign: 4
} as const;

const Action = {
  Door: 0,
  Bar: 1,
  Set: 2,
  Promo: 3,
  Raid: 4
} as const;

async function increase(seconds: number) {
  await network.provider.send("evm_increaseTime", [seconds]);
  await network.provider.send("evm_mine");
}

async function deployFixture() {
  const [owner, alice, bob] = await ethers.getSigners();
  const Spender = await ethers.getContractFactory("MockSpenderToken");
  const spender = (await Spender.deploy("Mock Club Cash", "CLUB")) as any;
  const Reward = await ethers.getContractFactory("MockRewardToken");
  const reward = (await Reward.deploy("Mock Street Rep", "REP")) as any;
  const Game = await ethers.getContractFactory("DegenDogUndergroundClub");
  const game = (await Game.deploy(await spender.getAddress(), await reward.getAddress(), owner.address)) as any;
  await reward.setGame(await game.getAddress());
  return { owner, alice, bob, spender, reward, game };
}

describe("DegenDogUndergroundClub", function () {
  it("deploys with configured token addresses and restricted reward minting", async function () {
    const { owner, alice, spender, reward, game } = await deployFixture();
    expect(await game.owner()).to.equal(owner.address);
    expect(await game.spenderToken()).to.equal(await spender.getAddress());
    expect(await game.rewardToken()).to.equal(await reward.getAddress());
    await expect(reward.connect(alice).mint(alice.address, 1)).to.be.revertedWithCustomError(reward, "NotGame");
  });

  it("creates one club per wallet and exposes status, score, resources, upgrades, and cooldowns", async function () {
    const { alice, game } = await deployFixture();
    const name = ethers.encodeBytes32String("Bass Kennel");

    await expect(game.connect(alice).createClub(name))
      .to.emit(game, "ClubCreated")
      .withArgs(alice.address, name, anyValue);
    await expect(game.connect(alice).createClub(name)).to.be.revertedWithCustomError(game, "ClubAlreadyExists");

    const club = await game.getClub(alice.address);
    expect(club.owner).to.equal(alice.address);
    expect(club.name).to.equal(name);
    expect(club.bones).to.equal(160n);
    expect(club.vibe).to.equal(60n);
    expect(await game.getClubStatus(alice.address)).to.equal(0n);
    expect(await game.getScore(alice.address)).to.be.greaterThan(0n);
    expect(await game.getUpgradeLevels(alice.address)).to.deep.equal([0n, 0n, 0n, 0n, 0n]);
    const cooldowns = await game.getCooldowns(alice.address);
    expect(cooldowns.doorReadyAt).to.equal(0n);
    expect(await game.canRunNight(alice.address)).to.equal(true);
    expect(await game.canAct(alice.address, Action.Door)).to.equal(true);
  });

  it("supports spender faucet/approval, drop set reward accrual, claim minting, and allowance failures", async function () {
    const { alice, spender, reward, game } = await deployFixture();
    await game.connect(alice).createClub(ethers.encodeBytes32String("Neon Dogs"));
    await spender.connect(alice).faucet();

    await expect(game.connect(alice).dropSet()).to.be.revertedWithCustomError(game, "SpenderPaymentFailed");
    await spender.connect(alice).approve(await game.getAddress(), parseEther("1000"));

    await expect(game.connect(alice).dropSet()).to.emit(game, "SetDropped");
    expect(await reward.balanceOf(alice.address)).to.equal(0n);
    let club = await game.getClub(alice.address);
    expect(club.pendingRewards).to.be.greaterThan(0n);

    await expect(game.connect(alice).claimRewards()).to.emit(game, "RewardClaimed");
    expect(await reward.balanceOf(alice.address)).to.be.greaterThan(0n);
    club = await game.getClub(alice.address);
    expect(club.pendingRewards).to.equal(0n);

    await expect(game.connect(alice).dropSet()).to.be.revertedWithCustomError(game, "ActionOnCooldown");
    expect(await game.canAct(alice.address, Action.Set)).to.equal(false);
  });

  it("enforces action cooldowns and applies timed resource generation", async function () {
    const { alice, game } = await deployFixture();
    await game.connect(alice).createClub(ethers.encodeBytes32String("Back Alley"));

    await expect(game.connect(alice).workDoor()).to.emit(game, "DoorWorked");
    let club = await game.getClub(alice.address);
    expect(club.security).to.equal(45n);
    expect(club.bones).to.equal(175n);
    await expect(game.connect(alice).workDoor()).to.be.revertedWithCustomError(game, "ActionOnCooldown");

    await increase(6 * 60 * 60);
    await game.connect(alice).workDoor();
    club = await game.getClub(alice.address);
    expect(club.security).to.equal(60n);

    await game.connect(alice).runBar();
    club = await game.getClub(alice.address);
    expect(club.vibe).to.equal(78n);
    await expect(game.connect(alice).runBar()).to.be.revertedWithCustomError(game, "ActionOnCooldown");
  });

  it("moves clubs into afterhours and shut down states, then revives with spender token", async function () {
    const { alice, spender, game } = await deployFixture();
    await game.connect(alice).createClub(ethers.encodeBytes32String("Deep Cut"));

    await increase(73 * 60 * 60);
    expect(await game.getClubStatus(alice.address)).to.equal(1n);
    await increase(49 * 60 * 60);
    expect(await game.getClubStatus(alice.address)).to.equal(2n);
    expect(await game.canAct(alice.address, Action.Door)).to.equal(false);
    await expect(game.connect(alice).workDoor()).to.be.revertedWithCustomError(game, "ClubShutDown");

    await spender.connect(alice).faucet();
    await spender.connect(alice).approve(await game.getAddress(), parseEther("1000"));
    await expect(game.connect(alice).reviveClub()).to.emit(game, "ClubRevived");
    expect(await game.getClubStatus(alice.address)).to.equal(0n);
  });

  it("runs the night before shutdown and resets afterhours status", async function () {
    const { alice, spender, game } = await deployFixture();
    await game.connect(alice).createClub(ethers.encodeBytes32String("Tunnel Room"));
    await spender.connect(alice).faucet();
    await spender.connect(alice).approve(await game.getAddress(), parseEther("1000"));
    await increase(73 * 60 * 60);

    await expect(game.connect(alice).runNight()).to.emit(game, "NightRun");
    const club = await game.getClub(alice.address);
    expect(await game.getClubStatus(alice.address)).to.equal(0n);
    expect(club.bones).to.equal(140n);
    expect(club.vibe).to.equal(55n);
  });

  it("buys upgrades with scaling resource costs and enforces level caps", async function () {
    const { alice, game } = await deployFixture();
    await game.connect(alice).createClub(ethers.encodeBytes32String("VIP Kennel"));

    await expect(game.connect(alice).buyUpgrade(Upgrade.BackRoom)).to.emit(game, "UpgradePurchased");
    expect(await game.getUpgradeLevels(alice.address)).to.deep.equal([0n, 0n, 0n, 1n, 0n]);
    for (let i = 0; i < 4; i += 1) {
      await game.connect(alice).runBar();
      await increase(4 * 60 * 60);
      await game.connect(alice).workDoor();
      await increase(6 * 60 * 60);
      await game.connect(alice).buyUpgrade(Upgrade.BackRoom);
    }
    expect(await game.getUpgradeLevels(alice.address)).to.deep.equal([0n, 0n, 0n, 5n, 0n]);
    await expect(game.connect(alice).buyUpgrade(Upgrade.BackRoom)).to.be.revertedWithCustomError(game, "UpgradeMaxed");
    await expect(game.connect(alice).buyUpgrade(9)).to.be.revertedWithCustomError(game, "InvalidUpgrade");
  });

  it("sets defense and resolves raids deterministically against protected resources", async function () {
    const { alice, bob, game } = await deployFixture();
    await game.connect(alice).createClub(ethers.encodeBytes32String("Raiders"));
    await game.connect(bob).createClub(ethers.encodeBytes32String("Guard Dogs"));
    await expect(game.connect(bob).setDefense(Resource.Bones)).to.emit(game, "DefenseSet");

    await expect(game.connect(alice).raidClub(bob.address, Resource.Bones))
      .to.emit(game, "RaidResolved")
      .withArgs(alice.address, bob.address, Resource.Bones, true, 0);
    let target = await game.getClub(bob.address);
    expect(target.successfulDefenses).to.equal(1n);

    await increase(12 * 60 * 60);
    await expect(game.connect(alice).raidClub(bob.address, Resource.Vibe)).to.emit(game, "RaidResolved");
    const attacker = await game.getClub(alice.address);
    target = await game.getClub(bob.address);
    expect(attacker.vibe).to.be.greaterThan(60n);
    expect(target.vibe).to.be.lessThan(60n);
  });

  it("does not steal below raid minimum thresholds and refuses shut down targets", async function () {
    const { alice, bob, spender, game } = await deployFixture();
    await game.connect(alice).createClub(ethers.encodeBytes32String("Low Heat"));
    await game.connect(bob).createClub(ethers.encodeBytes32String("Empty Room"));

    await expect(game.connect(alice).raidClub(bob.address, Resource.Hype))
      .to.emit(game, "RaidResolved")
      .withArgs(alice.address, bob.address, Resource.Hype, false, 0);

    await increase(121 * 60 * 60);
    await spender.connect(alice).faucet();
    await spender.connect(alice).approve(await game.getAddress(), parseEther("1000"));
    await game.connect(alice).reviveClub();
    await expect(game.connect(alice).raidClub(bob.address, Resource.Bones)).to.be.revertedWithCustomError(game, "InvalidRaidTarget");
  });
});
