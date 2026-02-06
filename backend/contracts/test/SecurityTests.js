const {expect} = require("chai");
const {ethers} = require("hardhat");
const {time} = require("@nomicfoundation/hardhat-network-helpers");

describe("BettingPool Security Tests", function () {
  let bettingPool;
  let usdtToken;
  let owner;
  let developer;
  let user1;
  let user2;
  let user3;

  const DECIMALS = 6;
  const INITIAL_SUPPLY = ethers.parseUnits("1000000", DECIMALS);
  const BET_AMOUNT = ethers.parseUnits("10", DECIMALS); // 10 USDT
  const ADMIN_FEE_PERCENT = 10n;

  beforeEach(async function () {
    [owner, developer, user1, user2, user3] = await ethers.getSigners();

    // Deploy Mock USDT
    const USDT = await ethers.getContractFactory("USDT");
    usdtToken = await USDT.deploy(owner.address);
    await usdtToken.waitForDeployment(); // Updated for Ethers v6

    // Deploy BettingPool
    const BettingPool = await ethers.getContractFactory("BettingPool");
    bettingPool = await BettingPool.deploy(
      await usdtToken.getAddress(),
      developer.address,
    );
    await bettingPool.waitForDeployment();

    // Setup balances
    await usdtToken.transfer(
      user1.address,
      ethers.parseUnits("1000", DECIMALS),
    );
    await usdtToken.transfer(
      user2.address,
      ethers.parseUnits("1000", DECIMALS),
    );
    await usdtToken.transfer(
      user3.address,
      ethers.parseUnits("1000", DECIMALS),
    );

    // Approvals
    await usdtToken
      .connect(user1)
      .approve(await bettingPool.getAddress(), ethers.MaxUint256);
    await usdtToken
      .connect(user2)
      .approve(await bettingPool.getAddress(), ethers.MaxUint256);
    await usdtToken
      .connect(user3)
      .approve(await bettingPool.getAddress(), ethers.MaxUint256);
  });

  describe("Security Fixes Verification", function () {
    it("Should enforce minimum bet of 1 USDT (6 decimals)", async function () {
      const deadline = (await time.latest()) + 3600;
      await bettingPool.createQuestion("Test Question", deadline, 2);

      const smallAmount = ethers.parseUnits("0.9", DECIMALS);
      await expect(
        bettingPool.connect(user1).placeBet(0, 0, smallAmount),
      ).to.be.revertedWith("Min 1 USDT required");

      const validAmount = ethers.parseUnits("1", DECIMALS);
      await expect(bettingPool.connect(user1).placeBet(0, 0, validAmount)).to
        .not.be.reverted;
    });

    it("Should track totalUserLiabilities correctly to prevent admin from draining user funds", async function () {
      const deadline = (await time.latest()) + 3600;
      await bettingPool.createQuestion("Test Question", deadline, 2);

      // User 1 bets 10 USDT
      await bettingPool.connect(user1).placeBet(0, 0, BET_AMOUNT);

      // Check liabilities
      expect(await bettingPool.totalUserLiabilities()).to.equal(BET_AMOUNT);

      // Admin tries to withdraw more than allowed (simulate direct transfer to contract)
      // First, simulate some dust sent directly to contract (not via bet)
      await usdtToken.transfer(
        await bettingPool.getAddress(),
        ethers.parseUnits("5", DECIMALS),
      );

      // Now contract balance is 15, liabilities 10. Admin fees 0.
      // Admin tries to sweep dust
      await bettingPool.sweepDust();

      // Admin fees should be 5
      expect(await bettingPool.adminFeesUsdt()).to.equal(
        ethers.parseUnits("5", DECIMALS),
      );

      // Admin withdraws fees
      await bettingPool.withdrawAdminFees();

      // Contract balance should be 10 (user funds safe)
      expect(
        await usdtToken.balanceOf(await bettingPool.getAddress()),
      ).to.equal(BET_AMOUNT);
    });

    it("Should correctly account for fees and reduce user liabilities upon settlement", async function () {
      const deadline = (await time.latest()) + 7200; // Increased deadline
      const qId = await bettingPool.createQuestion("Fee Test", deadline, 2);
      const questionId = 0; // First question

      // User 1 bets 100 on Outcome 0 (Winner)
      const amount1 = ethers.parseUnits("100", DECIMALS);
      await bettingPool.connect(user1).placeBet(questionId, 0, amount1);

      // User 2 bets 100 on Outcome 1 (Loser)
      const amount2 = ethers.parseUnits("100", DECIMALS);
      await bettingPool.connect(user2).placeBet(questionId, 1, amount2);

      expect(await bettingPool.totalUserLiabilities()).to.equal(
        amount1 + amount2,
      );

      // Settle
      await time.increaseTo(deadline + 3601);
      await bettingPool.settleQuestion(questionId, 0);

      // Fee calculation: 10% of loser pool (100) = 10 USDT
      const expectedFee = (amount2 * ADMIN_FEE_PERCENT) / 100n;

      // Liabilities should decrease by fee amount
      // Initial: 200. Fee: 10. New Liabilities: 190.
      // Winner gets 100 (own) + 90 (winnings) = 190.
      expect(await bettingPool.totalUserLiabilities()).to.equal(
        amount1 + amount2 - expectedFee,
      );
      expect(await bettingPool.adminFeesUsdt()).to.equal(expectedFee);
    });

    it("Should allow sweeping dust only if it exceeds liabilities + admin fees", async function () {
      // Send extra tokens directly to contract
      const dustAmount = ethers.parseUnits("1", DECIMALS);
      await usdtToken.transfer(await bettingPool.getAddress(), dustAmount);

      const initialAdminFees = await bettingPool.adminFeesUsdt();

      await bettingPool.sweepDust();

      expect(await bettingPool.adminFeesUsdt()).to.equal(
        initialAdminFees + dustAmount,
      );
    });

    it("Should prevent settling before the deadline", async function () {
      const deadline = (await time.latest()) + 3600;
      await bettingPool.createQuestion("Early Settle Test", deadline, 2);
      const questionId = 0; // First question in fresh deployment

      // Try to settle immediately
      await expect(
        bettingPool.settleQuestion(questionId, 0),
      ).to.be.revertedWith("Cannot settle before deadline");

      // Move time past deadline
      await time.increaseTo(deadline + 1);
      await expect(bettingPool.settleQuestion(questionId, 0)).to.not.be
        .reverted;
    });
  });
});
