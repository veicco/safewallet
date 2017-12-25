var SafeWallet = artifacts.require("SafeWallet");

module.exports = function(deployer) {
  deployer.deploy(SafeWallet);
};
