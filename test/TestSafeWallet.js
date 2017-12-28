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

  describe('requestWithdrawal()', () => {

    it("requesting withdrawal requires that the contract has enough balance to cover the withdrawal"), async () => {

    };

    it("requesting withdrawal is allowed only by the user", async () => {
      const owner = testOwner;
      const user = testUser;
      const instance = await SafeWallet.new(user, {from: owner});

      // request a withdrawal as the user
      await instance.requestWithdrawal(alpha, 100, {from: user});

      // check the count of pending withdrawals equals one
      let count = await instance.getPendingWithdrawalsCount.call();
      assert.equal(count, 1);

      // request a withdrawal as the owner
      let err = null;
      try {
        await instance.requestWithdrawal(alpha, 100, {from: owner});
      } catch (error) {
        err = error;
      }

      // check it raises an exception
      assert.ok(err instanceof Error);

      // check the count of pending withdrawals still equals one
      count = await instance.getPendingWithdrawalsCount.call();
      assert.equal(count, 1);
    });

    it("requesting a withdrawal appends it to the pending withdrawals list", async () => {
      const instance = await SafeWallet.new(testUser, {from: testOwner});

      // request a withdrawal
      await instance.requestWithdrawal(alpha, 100, {from: testUser});

      // check the count of pending withdrawals
      let count = await instance.getPendingWithdrawalsCount.call();
      assert.equal(count, 1);

      // check the content of the requested withdrawal
      let pending = await instance.getPendingWithdrawal.call(0);
      assert.equal(pending[1].valueOf(), alpha);
      assert.equal(pending[2].valueOf(), 100);

      // request additional two withdrawals
      await instance.requestWithdrawal(beta, 300, {from: testUser});
      await instance.requestWithdrawal(gamma, 400, {from: testUser});

      // check the new count of pending withdrawals
      count = await instance.getPendingWithdrawalsCount.call();
      assert.equal(count, 3);

      // check the content of the new requested withdrawals
      let pending1 = await instance.getPendingWithdrawal.call(1);
      let pending2 = await instance.getPendingWithdrawal.call(2);
      assert.equal(pending1[1].valueOf(), beta);
      assert.equal(pending1[2].valueOf(), 300);
      assert.equal(pending2[1].valueOf(), gamma);
      assert.equal(pending2[2].valueOf(), 400);
    });

    it("requesting withdrawal fires an event correctly", async () => {
      const instance = await SafeWallet.new(testUser, {from: testOwner});
      const transaction = await instance.requestWithdrawal(beta, 300, {from: testUser});

      // check the length equals one
      const logs = transaction.logs;
      assert.equal(logs.length, 1);

      // check the event includes correct data
      const log = logs[0];
      assert.equal(log.event, "WithdrawalRequest");
      assert.equal(log.args.to, beta);
      assert.equal(log.args.wei_amount, 300);
    });

  });

  describe('confirmWithdrawals()', () => {

    it("confirming withdrawals is allowed only by the user", async () => {
      const owner = testOwner;
      const user = testUser;
      const instance = await SafeWallet.new(user, {from: owner});

      // send ether to the contract
      await instance.send(web3.toWei(1, "ether"));

      // request a withdrawal
      await instance.requestWithdrawal(beta, 250, {from: user});

      // try to confirm it as the owner
      let err = null;
      try {
        await instance.confirmWithdrawasl({from: owner});
      } catch (error) {
        err = error;
      }

      // check it raises an exception
      assert.ok(err instanceof Error);

      // confirm it as the user (should not raise exceptions)
      await instance.confirmWithdrawals({from: user});
    });

    it("confirming withdrawal is allowed only when the defined time has passed after the request");

    it("confirming withdrawal removes the underlying withdrawal from the pending withdrawals list");

    it("confirming withdrawal transfers the funds correctly");

    it("confirming withdrawal fires an event correctly");

  });

  describe('rejectWithdrawals()', () => {

    it("rejecting withdrawal is allowed only by the owner");

    it("rejecting withdrawal removes the underlying withdrawal from the pending withdrawals list");

    it("rejecting withdrawal fires an event correctly");

    it("calling kill method destroys the contract and returns the remaining funds to the owner");

  });

});