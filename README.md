
# Safe Wallet

## About
Safe Wallet is a smart contract running on the Ethereum blockchain. It is
a wallet for ETH and ERC20 tokens with additional features, including
cancellation of withdrawals and tracking of events.

### Why?
A major benefit of using Safe Wallet instead of a vanilla address wallet is 
that the private key file can be stored in less safe locations, such as 
online mobile devices, without having to worry too much if a hacker or a thief
gets access to the account. In case that a malicious user tries to withdraw
funds from the wallet, the owner gets notified, being able to cancel the 
withdrawal and remove rights from the stolen account to interact with the wallet.

### Owner
The contract creator becomes the owner of the wallet, having rights to 
cancel withdrawals, modify preferences, add users, and kill the contract.

### Users 
Users are Ethereum addresses added to the contract by the owner. They 
have right to request withdrawals from the contract. When the specified 
waiting period after a withdrawal request has passed, if the owner has not 
cancelled the withdrawal, the withdrawal can be completed.

### Events
An event is fired on each deposit to the contract, withdrawal request from
the contract, and cancellation of a withdrawal. By listening the withdrawal
events (by means of a client application), the user can react to possible
unintended withdrawals by canceling them and locking the wallet.

## Methods

TODO

## Deployment

TODO

## Testing

This project uses [Truffle framework](http://truffleframework.com/) which 
provides Mocha + Chai libraries for testing solidity contracts through 
[web3.js](https://github.com/ethereum/web3.js/) interface.

Install Truffle:
```
npm install -g truffle
``` 

Run unit tests:
```
truffle test
``` 

## Future features:
 - ability to limit withdrawals to trusted addresses that are managed by the owner
 - support for multiple users (shared wallet)