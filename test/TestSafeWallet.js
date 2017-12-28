const SafeWallet = artifacts.require("SafeWallet");

contract('SafeWallet', accounts => {

  // test users
  const testOwner = accounts[0];
  const testUser = accounts[1];
  const alpha = accounts[2];
  const beta = accounts[3];
  const gamma = accounts[4];

  describe('constructor', () => {

    it("the owner and the user are stored correctly", async () => {
      const instance = await SafeWallet.new(testUser, {from: testOwner});
      const user = await instance.getUser.call();
      const owner = await instance.getOwner.call();
      assert.equal(user.valueOf(), testUser);
      assert.equal(owner.valueOf(), testOwner);
    });

  });

  describe('deposit', () => {

    it("transfer to the contract fires an event correctly", async () => {
      const instance = await SafeWallet.new(testUser, {from: testOwner});
      const transaction = await instance.sendTransaction({from: alpha, value: web3.toWei(1, "ether")});

      // check the length equals one
      const logs = transaction.logs;
      assert.equal(logs.length, 1);

      // check the event includes correct data
      const log = logs[0];
      assert.equal(log.event, "Deposit");
      assert.equal(log.args.from, alpha);
      assert.equal(log.args.wei_amount.valueOf(), web3.toWei(1, "ether"));
    });

  });

  describe('getPendingWithdrawalsTotalValue()', () => {

    // create an initial instance and send 1 ether to the contract
    let instance;
    before(async () => {
      instance = await SafeWallet.new(testUser, {from: testOwner});
      instance.sendTransaction({from: alpha, value: web3.toWei(1, "ether")});
    });

    it('getPendingWithdrawalsTotalValue returns correct value', async () => {

      // initial sum should be zero
      let sum = await instance.getPendingWithdrawalsTotalValue.call();
      assert.equal(sum.toNumber(), 0);

      // requesting one ether should cause the sum to be one ether
      await instance.requestWithdrawal(alpha, web3.toWei(1, "ether"), {from: testUser});
      sum = await instance.getPendingWithdrawalsTotalValue.call();
      assert.equal(web3.fromWei(sum, "ether").toNumber(), 1);

    });

  });

  describe('requestWithdrawal()', () => {

    // create an initial instance and send 10 ether to the contract
    let instance;
    before(async () => {
      instance = await SafeWallet.new(testUser, {from: testOwner});
      instance.sendTransaction({from: alpha, value: web3.toWei(10, "ether")});
    });

    it("requesting withdrawal requires that the contract has enough balance to cover the withdrawal", async () => {

      // request 0.1 ether (should succeed)
      await instance.requestWithdrawal(alpha, web3.toWei(0.1, "ether"), {from: testUser});

      // request another 10 ether (should fail)
      let err = null;
      try {
        await instance.requestWithdrawal(alpha, web3.toWei(10, "ether"), {from: testUser});
      } catch (error) {
        err = error;
      }

      // check it raises an exception
      assert.ok(err instanceof Error);

    });

    it("requesting withdrawal is allowed only by the user", async () => {

      // store the sum of pending withdrawals at the beginning
      const sum = await instance.getPendingWithdrawalsTotalValue.call();

      // request a withdrawal as the user (should succeed)
      await instance.requestWithdrawal(alpha, web3.toWei(0.1, "ether"), {from: testUser});

      // request a withdrawal as the owner (should fail)
      let err = null;
      try {
        await instance.requestWithdrawal(alpha, web3.toWei(0.1, "ether"), {from: testOwner});
      } catch (error) {
        err = error;
      }

      // check it raises an exception
      assert.ok(err instanceof Error);

      // check that the sum has increased by 0.1 ethers
      const finalSum = await instance.getPendingWithdrawalsTotalValue.call();
      assert.equal(web3.fromWei(finalSum - sum, "ether").valueOf(), 0.1);

    });

    it("requesting a withdrawal appends it to the pending withdrawals list", async () => {

      // store the initial count of pending withdrawals
      const count1 = await instance.getPendingWithdrawalsCount.call();

      // request a withdrawal
      await instance.requestWithdrawal(alpha, web3.toWei(0.1, "ether"), {from: testUser});

      // check the count of pending withdrawals
      const count2 = await instance.getPendingWithdrawalsCount.call();
      assert.equal(count2.valueOf()-count1.valueOf(), 1);

      // check the content of the requested withdrawal
      let len = await instance.getPendingWithdrawalsCount.call();
      let pending1 = await instance.getPendingWithdrawal.call(len.valueOf() - 1);
      assert.equal(pending1[1].valueOf(), alpha);
      assert.equal(web3.fromWei(pending1[2], "ether").valueOf(), 0.1);

      // request additional two withdrawals
      await instance.requestWithdrawal(beta, web3.toWei(0.3, "ether"), {from: testUser});
      await instance.requestWithdrawal(gamma, web3.toWei(0.4, "ether"), {from: testUser});

      // check the new count of pending withdrawals
      const count3 = await instance.getPendingWithdrawalsCount.call();
      assert.equal(count3.valueOf() - count2.valueOf(), 2);

      // check the content of the new requested withdrawals
      len = await instance.getPendingWithdrawalsCount.call();
      let pending2 = await instance.getPendingWithdrawal.call(len.valueOf() - 2);
      let pending3 = await instance.getPendingWithdrawal.call(len.valueOf() - 1);
      assert.equal(pending2[1].valueOf(), beta);
      assert.equal(web3.fromWei(pending2[2], "ether").valueOf(), 0.3);
      assert.equal(pending3[1].valueOf(), gamma);
      assert.equal(web3.fromWei(pending3[2], "ether").valueOf(), 0.4);
    });

    it("requesting withdrawal fires an event correctly", async () => {
      const transaction = await instance.requestWithdrawal(beta, web3.toWei(0.3, "ether"), {from: testUser});

      // check the length equals one
      const logs = transaction.logs;
      assert.equal(logs.length, 1);

      // check the event includes correct data
      const log = logs[0];
      assert.equal(log.event, "WithdrawalRequest");
      assert.equal(log.args.to, beta);
      assert.equal(web3.fromWei(log.args.wei_amount, "ether"), 0.3);
    });

  });

  describe('confirmWithdrawals()', () => {

    // create an initial instance and send 10 ether to the contract
    let instance;
    before(async () => {
      instance = await SafeWallet.new(testUser, {from: testOwner});
      await instance.sendTransaction({from: alpha, value: web3.toWei(10, "ether")});
    });

    it("confirming withdrawals is allowed only by the user", async () => {

      // request a withdrawal
      await instance.requestWithdrawal(beta, web3.toWei(0.1, "ether"), {from: testUser});

      // try to confirm withdrawals as the owner (should fail)
      let err = null;
      try {
        await instance.confirmWithdrawasl({from: testOwner});
      } catch (error) {
        err = error;
      }
      // check it raises an exception
      assert.ok(err instanceof Error);

      // try to confirm withdrawals as an external user (should fail)
      err = null;
      try {
        await instance.confirmWithdrawasl({from: alpha});
      } catch (error) {
        err = error;
      }
      // check it raises an exception
      assert.ok(err instanceof Error);


      // try to confirm it as the user (should succeed)
      await instance.confirmWithdrawals({from: testUser});
    });

    it("confirming withdrawal is allowed only when the defined time has passed after the request");

    it("confirming withdrawals removes the confirmed withdrawals from the pending withdrawals list");

    it("confirming withdrawals transfers the funds correctly");

    it("confirming withdrawals fires events correctly");

  });

  describe('rejectWithdrawals()', () => {

    it("rejecting withdrawal is allowed only by the owner");

    it("rejecting withdrawal removes the underlying withdrawal from the pending withdrawals list");

    it("rejecting withdrawal fires an event correctly");

  });

  describe('kill()', () => {

    it("calling kill method destroys the contract and returns the remaining funds to the owner");

  });

});