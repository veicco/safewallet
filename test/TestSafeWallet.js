const SafeWallet = artifacts.require("SafeWallet");

contract('SafeWallet', accounts => {
  it("stores the owner and the user correctly", () => {
    SafeWallet.deployed(accounts[1], {from: accounts[0]}).then(instance => {
      assert.equal(instance.owner, accounts[0]);
      assert.equal(instance.user, accounts[1]);
    })
  });

  it("calling kill destroys the contract");

  it("transfer to the contract fires an event correctly");

  it("requesting withdrawal appends a new pending withdrawal to the list");

  it("requesting withdrawal fires an event correctly");

  it("confirming withdrawal removes the underlying withdrawal from the pending withdrawals list");

  it("confirming withdrawal fires an event correctly");
});