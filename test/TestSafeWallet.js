const SafeWallet = artifacts.require("SafeWallet");

contract('SafeWallet', accounts => {

  it("stores the owner and the user correctly", async () => {
    const instance = await SafeWallet.new(accounts[1], {from: accounts[0]});
    const user = await instance.getUser.call();
    const owner = await instance.getOwner.call();
    assert.equal(user.valueOf(), accounts[1]);
    assert.equal(owner.valueOf(), accounts[0]);
  });

  it("transfer to the contract fires an event correctly");

  it("requesting withdrawal is allowed by the user only", async () => {
    const owner = accounts[0];
    const user = accounts[1];
    const instance = await SafeWallet.new(user, {from: owner});

    // request a withdrawal as the user
    await instance.requestWithdrawal(accounts[2], 100, {from: user});

    // check the count of pending withdrawals equals one
    let count = await instance.getPendingWithdrawalsCount.call();
    assert.equal(count, 1);

    // request a withdrawal as the owner
    let err = null;
    try {
      await instance.requestWithdrawal(accounts[2], 100, {from: owner});
    } catch (error) {
      err = error;
    }

    // check it raises an error
    assert.ok(err instanceof Error);

    // check the count of pending withdrawals still equals one
    count = await instance.getPendingWithdrawalsCount.call();
    assert.equal(count, 1);
  });

  it("requesting a withdrawal appends it to the pending withdrawals list", async () => {
    const instance = await SafeWallet.new(accounts[1], {from: accounts[0]});

    // request a withdrawal
    await instance.requestWithdrawal(accounts[2], 100, {from: accounts[1]});

    // check the count of pending withdrawals
    let count = await instance.getPendingWithdrawalsCount.call();
    assert.equal(count, 1);

    // check the content of the requested withdrawal
    let pending = await instance.getPendingWithdrawal.call(0);
    assert.equal(pending[1].valueOf(), accounts[2]);
    assert.equal(pending[2].valueOf(), 100);

    // request additional two withdrawals
    await instance.requestWithdrawal(accounts[3], 300, {from: accounts[1]});
    await instance.requestWithdrawal(accounts[4], 400, {from: accounts[1]});

    // check the new count of pending withdrawals
    count = await instance.getPendingWithdrawalsCount.call();
    assert.equal(count, 3);

    // check the content of the new requested withdrawals
    let pending1 = await instance.getPendingWithdrawal.call(1);
    let pending2 = await instance.getPendingWithdrawal.call(2);
    assert.equal(pending1[1].valueOf(), accounts[3]);
    assert.equal(pending1[2].valueOf(), 300);
    assert.equal(pending2[1].valueOf(), accounts[4]);
    assert.equal(pending2[2].valueOf(), 400);
  });

  it("requesting withdrawal fires an event correctly");

  it("confirming withdrawal removes the underlying withdrawal from the pending withdrawals list");

  it("confirming withdrawal fires an event correctly");

  it("calling kill destroys the contract");

});