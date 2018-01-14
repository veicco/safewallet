
# Safe Wallet

## About
Safe Wallet is a smart contract running on the Ethereum blockchain. It is
a wallet for ETH and ERC20 tokens with additional features, including
cancellation of withdrawals and tracking of events.

Whenever a withdrawal is requested from the contract, an event is fired,
allowing a web3.js client application to notify the owner who can cancel the
withdrawal within a specified time.   

A major benefit of using Safe Wallet instead of a vanilla address wallet is 
that the private key file can be stored in less safe locations, such as 
online mobile devices, without having to worry too much if a hacker or a thief
gets access to the account. In case that a malicious user tries to withdraw
funds from the wallet, the owner gets notified, being able to cancel the 
withdrawal and remove rights from the stolen account to interact with the wallet.

## Documentation

### Permissions

#### Owner
The contract creator becomes the owner of the wallet. The owner's private key should
be stored very safely, preferably in an offline location, and the transactions
from the owner accounts should be signed offline. 

The owner can:

- cancel withdrawals 
- modify preferences 
- add and remove users 
- kill the contract

#### Users
Users are Ethereum addresses added to the contract by the owner. Most of the 
everyday interactions with the contract (i.e. withdrawals) are signed by the 
user accounts. The private keys of these accounts can be stored in online devices
without worrying.

Users can:
- request withdrawals from the contract


### Events

The events can be listened by a client application which can notify users and owners.

<table>
  <tr>
    <th>Event</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>Deposit(address from, uint wei_amount)</td>
    <td>Fires when the contract receives funds.</td>
  </tr>
  <tr>
    <td>WithdrawalRequest(uint id, address to, uint wei_amount)</td>
    <td>Fires when a user requests a withdrawal from the contract.</td>
  </tr>
  <tr>
    <td>WithdrawalConfirm(uint id, address to, uint wei_amount)</td>
    <td>Fires when a withdrawal has been completed.</td>
  </tr>
  <tr>
    <td>WithdrawalCancel(uint id, address to, uint wei_amount)</td>
    <td>Fires when a withdrawal has been cancelled by the owner.</td>
  </tr>
</table>

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