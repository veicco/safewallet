pragma solidity ^0.4.18;

/*
A wallet contract which is intended to be more secure than pure address wallets.

The contract has two different user roles: 1) the owner, and 2) the user.
Only the user is allowed to request withdrawals from the contract. In case
a withdrawal is requested, the contract fires an event, allowing a client
program to send a notification to the owner's email address. Within a specified
waiting period, the owner can cancel the withdrawal and freeze the wallet, for
example if the requested withdrawal was made by a hacker.

The idea is that one do not have to worry about keeping the private key file of
the user account in devices that are conneced to Internet, if the owner address
is stored securely. The owner address is needed only when the contract is
deployed, when the contract settings are modified, when a request is must be
cancelled, or when the contract is killed ( in which case the remaining funds are
transferred to the owner.
*/
contract SafeWallet {

  /* Data */
  struct Withdrawal {
     uint timestamp;
     address to;
     uint wei_amount;
  }
  address public owner;
  address public user;
  // requested withdrawals that can be completed when enough time has passed
  Withdrawal[] public pendingWithdrawals;

  /* Events */
  event WithdrawalRequest(Withdrawal withdrawal);
  event WithdrawalComplete(Withdrawal withdrawal, uint timestamp);

  /// construct the contract
  function SafeWallet(address _user) public {
    // the contract creator becomes the owner
    owner = msg.sender;
    // the user must be specified by the contract creator
    user = _user;
  }

  /// WIP: request for transfer of the given wei amount of funds to the given address
  function requestWithdrawal(address _to, uint _wei_amount) public returns(bool) {
    pendingWithdrawals.push(Withdrawal(now, _to, _wei_amount));
    return true;
    // TODO: fire an event
  }

  /// WIP: complete the pending withdrawals that have passed the waiting period
  function completeWithdrawals() public {
    for (uint index = 0; index < pendingWithdrawals.length; index++) {
      // TODO: check if enough time passed

      // execute the transfer
      pendingWithdrawals[index].to.transfer(pendingWithdrawals[index].wei_amount);

      // remove the Withdrawal from the pendingWithdrawals list
      pendingWithdrawals[index] = pendingWithdrawals[pendingWithdrawals.length - 1];
      pendingWithdrawals.length--;
    }
    // TODO: fire an event
  }

  /// Kill the contract and return the remaining funds to the owner
  function kill() public {
    if(msg.sender == owner) {
       selfdestruct(owner);
     }
  }

  /// WIP: deposit funds to the contract
  function () public payable {
    // TODO: fire an event
  }

}
