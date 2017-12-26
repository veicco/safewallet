
# Safe Wallet

## About
A wallet contract which is intended to be more secure than pure address wallets.

The contract has two different user roles: 1) the owner, and 2) the user.
Only the user is allowed to request withdrawals from the contract. In case
a withdrawal is requested, the contract fires an event, allowing a client
program to send a notification to the owner's email address. Within a specified
waiting period, the owner can cancel the withdrawal and freeze the wallet, for
example if the requested withdrawal was made by a hacker.

The idea is that one do not have to worry about keeping the private key file of
the user account in devices that are connected to the Internet, as long as the
owner address is stored securely. The owner address is needed only when the contract
is deployed, when the contract settings are modified, when a request is must be
cancelled, or when the contract is killed (in which case the remaining funds are
transferred to the owner.

## Future features:
 - ability for the owner to add trusted withdrawal addresses

## Testing

Cheat sheet for private network setup.

```
geth --datadir ./privatechain/chaindata/ init ./genesis.json
```

```
geth --datadir ./privatechain/chaindata/ console
```

```
/Applications/Mist.app/Contents/MacOS/Mist --rpc ./privatechain/chaindata/geth.ipc
```
