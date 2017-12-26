const SafeWallet = artifacts.require("SafeWallet");

contract('SafeWallet', accounts => {
  it("stores the owner and the user correctly", async () => {
    const instance = await SafeWallet.new(accounts[1], {from: accounts[0]});
    const user = await instance.getUser.call();
    const owner = await instance.getOwner.call();
    assert.equal(user.valueOf(), accounts[1]);
    assert.equal(owner.valueOf(), accounts[0]);
  });

  it("calling kill destroys the contract");

  it("transfer to the contract fires an event correctly");

  it("requesting withdrawal is allowed by the user only");

  it("requesting withdrawal appends a new pending withdrawal to the list");

  it("requesting withdrawal fires an event correctly");

  it("confirming withdrawal removes the underlying withdrawal from the pending withdrawals list");

  it("confirming withdrawal fires an event correctly");
});