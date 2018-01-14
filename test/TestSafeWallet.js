const SafeWallet = artifacts.require("SafeWallet");

contract('SafeWallet', accounts => {

  // test users
  const testOwner = accounts[0];
  const testUser = accounts[1];
  const alpha = accounts[2];
  const beta = accounts[3];
  const gamma = accounts[4];
  const delta = accounts[4];

  // utility functions
  const increaseTime = addSeconds => {
    web3.currentProvider.send({
      jsonrpc: "2.0",
      method: "evm_increaseTime",
      params: [addSeconds], id: 0
    })
  };

  const getBalance = (address) => web3.fromWei(web3.eth.getBalance(address), "ether");

  describe('constructor()', () => {

    it("the owner and the user are stored correctly", async () => {
      const instance = await SafeWallet.new(testUser, {from: testOwner});
      const user = await instance.getUser.call();
      const owner = await instance.getOwner.call();
      assert.equal(user.valueOf(), testUser);
      assert.equal(owner.valueOf(), testOwner);
    });

  });

  describe('deposit()', () => {

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

    // create an initial instance and send 10 ether to the contract
    let instance;
    let request;

    before(async () => {
      instance = await SafeWallet.new(testUser, {from: testOwner});
      instance.sendTransaction({from: alpha, value: web3.toWei(10, "ether")});
    });

    it("requesting withdrawal is allowed only by the user", async () => {
      // request a withdrawal as the user (should succeed)
      request = await instance.requestWithdrawal(alpha, web3.toWei(1, "ether"), {from: testUser});

      // request a withdrawal as the owner (should fail)
      let err = null;
      try {
        await instance.requestWithdrawal(alpha, web3.toWei(1, "ether"), {from: testOwner});
      } catch (error) {
        err = error;
      }

      // check it raises an exception
      assert.ok(err instanceof Error);

      // check the withdrawalCount equals 1
      const count = await instance.getWithdrawalCount.call();
      assert.equal(count, 1);
    });

    it("requesting a withdrawal adds a new Withdrawal structure to the withdrawals mapping", async () => {
      // check the requested withdrawal exists
      const withdrawal = await instance.getWithdrawal.call(0);

      // check the content
      assert.equal(withdrawal[1].valueOf(), alpha);
      assert.equal(web3.fromWei(withdrawal[2], "ether").valueOf(), 1);
      assert.equal(withdrawal[3].valueOf(), 0);
    });

    it("requesting withdrawal fires an event correctly", async () => {
      // check the logs length equals one
      const logs = request.logs;
      assert.equal(logs.length, 1);

      // check the event includes correct data
      const log = logs[0];
      assert.equal(log.event, "WithdrawalRequest");
      assert.equal(log.args.id, 0);
      assert.equal(log.args.to, alpha);
      assert.equal(web3.fromWei(log.args.wei_amount, "ether"), 1);
    });

  });

  describe('getWithdrawal()', () => {

    // create an initial instance and send 10 ether to the contract
    let instance;

    before(async () => {
      instance = await SafeWallet.new(testUser, {from: testOwner});
      instance.sendTransaction({from: alpha, value: web3.toWei(10, "ether")});
    });

    it("trying to get a non-existent withdrawal fails", async () => {
      // try to get a non-existent withdrawal
      let err = null;
      try {
        await instance.getWithdrawal.call(0);
      } catch (error) {
        err = error;
      }
      // check it raises an exception
      assert.ok(err instanceof Error);
    })

  });

  describe('confirmWithdrawal()', () => {

    // create an initial instance, send 10 ether to the contract, and request a few withdrawals
    let instance;
    let deposit;

    const confirm = async (id, from, jumpTime) => {
      increaseTime(jumpTime);
      return await instance.confirmWithdrawal(id, {from: from});
    };

    before(async () => {
      instance = await SafeWallet.new(testUser, {from: testOwner});
      deposit = await instance.sendTransaction({from: alpha, value: web3.toWei(10, "ether")});
      // request two small withdrawals
      await instance.requestWithdrawal(beta, web3.toWei(1, "ether"), {from: testUser});
      await instance.requestWithdrawal(gamma, web3.toWei(1, "ether"), {from: testUser});
      // request a large withdrawal
      await instance.requestWithdrawal(gamma, web3.toWei(100, "ether"), {from: testUser});
    });

    it("confirming withdrawal fails if the defined confirmation time has not passed", async () => {
      // try to confirm the first withdrawal before confirmation time has passed (should fail)
      let err = null;
      try {
        await confirm(1, testUser, 50);
      } catch (error) {
        err = error;
      }
      // check it raises an exception
      assert.ok(err instanceof Error);
    });

    it("confirming withdrawal successfully transfers the funds, changes the withdrawal status, and fires an event", async () => {
      // confirm the first withdrawal as the user after 2000ms (should succeed)
      const confirmation = await confirm(0, testUser, 2000);

      // check the balances
      assert.equal(getBalance(instance.address).toNumber(), 9);
      assert.equal(getBalance(beta).toNumber(), 101);

      // check the withdrawal status
      const withdrawal = await instance.getWithdrawal.call(0);
      assert.equal(withdrawal[3], 1);

      // check the event
      const logs = confirmation.logs;
      assert.equal(logs.length, 1);
      const log = logs[0];
      assert.equal(log.event, "WithdrawalConfirm");
      assert.equal(log.args.id, 0);
      assert.equal(log.args.to, beta);
      assert.equal(web3.fromWei(log.args.wei_amount, "ether"), 1);
    });

    it("confirming withdrawal fails if the withdrawal status is other than 0 (pending)", async () => {
      // try to confirm the first withdrawal second time as the user after 2000ms (should fail)
      let err = null;
      try {
        await confirm(0, testUser, 2000);
      } catch (error) {
        err = error;
      }
      // check it raises an exception
      assert.ok(err instanceof Error);
    });

    it("confirming withdrawal is not allowed by other than the user", async () => {
      // try to confirm the second withdrawal as the owner (should fail)
      let err = null;
      try {
        await confirm(1, testOwner, 2000);
      } catch (error) {
        err = error;
      }
      // check it raises an exception
      assert.ok(err instanceof Error);

      // try to confirm the second withdrawal as an external user (should fail)
      err = null;
      try {
        await confirm(1, alpha, 2000);
      } catch (error) {
        err = error;
      }
      // check it raises an exception
      assert.ok(err instanceof Error);
    });

    it("confirming withdrawal fails if the contract does not have sufficient balance", async () => {
      // try to confirm the third withdrawal (should fail)
      let err = null;
      try {
        await confirm(2, testUser, 2000);
      } catch (error) {
        err = error;
      }
      // check it raises an exception
      assert.ok(err instanceof Error);
    });

  });

  describe('cancelWithdrawal()', () => {

    // create an initial instance, send 10 ether to the contract, and request withdrawals
    let instance;
    let deposit;
    let cancellation;

    before(async () => {
      instance = await SafeWallet.new(testUser, {from: testOwner});
      deposit = await instance.sendTransaction({from: alpha, value: web3.toWei(10, "ether")});
      await instance.requestWithdrawal(beta, web3.toWei(1, "ether"), {from: testUser});
      await instance.requestWithdrawal(gamma, web3.toWei(1, "ether"), {from: testUser});
    });

    const cancel = async (id, from, jumpTime) => {
      increaseTime(jumpTime);
      return await instance.cancelWithdrawal(id, {from: from});
    };

    it("cancelling withdrawal is allowed only by the owner and by the user", async () => {
      // try to cancel the first withdrawal as an external account (should fail)
      let err = null;
      try {
        await cancel(0, alpha, 100);
      } catch (error) {
        err = error;
      }
      // check it raises an exception
      assert.ok(err instanceof Error);
    });

    it("cancelling withdrawal changes the withdrawal status to 2 (cancelled)", async () => {
      // cancel the first withdrawal as the user (should succeed)
      cancellation = await cancel(0, testUser, 100);

      // check the status
      const withdrawal0 = await instance.getWithdrawal.call(0);
      assert.equal(withdrawal0[3], 2);

      // check the event


      // cancel the second withdrawal as the owner (should succeed)
      await cancel(1, testOwner, 100);

      // check the status
      const withdrawal1 = await instance.getWithdrawal.call(1);
      assert.equal(withdrawal1[3], 2);
    });

    it("cancelling withdrawal fires an event correctly", () => {
      // check the logs length equals one
      const logs = cancellation.logs;
      assert.equal(logs.length, 1);

      // check the event includes correct data
      const log = logs[0];
      assert.equal(log.event, "WithdrawalCancel");
      assert.equal(log.args.id, 0);
      assert.equal(log.args.to, beta);
      assert.equal(web3.fromWei(log.args.wei_amount, "ether"), 1);
    });


    it("cancelling withdrawal fails if the status is not 0 (pending)", async () => {
      // try to cancel the first withdrawal second time (should fail)
      let err = null;
      try {
        await cancel(0, testUser, 100);
      } catch (error) {
        err = error;
      }
      // check it raises an exception
      assert.ok(err instanceof Error);
    });

  });

  describe('kill()', () => {

    // create an initial instance, send 10 ether to the contract, and request withdrawals
    let instance;
    let deposit;

    before(async () => {
      instance = await SafeWallet.new(testUser, {from: testOwner});
      deposit = await instance.sendTransaction({from: alpha, value: web3.toWei(10, "ether")});
      await instance.requestWithdrawal(beta, web3.toWei(1, "ether"), {from: testUser});
      await instance.requestWithdrawal(gamma, web3.toWei(1, "ether"), {from: testUser});
    });

    it("kill is allowed only by the owner", async () => {
      // try to kill the contract as an external account
      let err = null;
      try {
        await instance.kill({from: beta});
      } catch (error) {
        err = error;
      }
      // check it raises an exception
      assert.ok(err instanceof Error);

      // try to kill the contract as the user
      try {
        await instance.kill({from: testUser});
      } catch (error) {
        err = error;
      }
      // check it raises an exception
      assert.ok(err instanceof Error);
    });

    it("kill destroys the contract and returns the remaining funds to the owner", async () => {
      // kill the contract as the owner
      await instance.kill({from: testOwner});

      // check the balances
      assert.equal(getBalance(instance.address), 0);
      assert.ok(getBalance(testOwner) > 109);
    });

  });

});