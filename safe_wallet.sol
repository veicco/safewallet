pragma solidity ^0.4.19;

contract SafeWallet {

  // structs
  struct Withdrawal {
     uint timestamp;
     address requestor;
     address to;
     uint wei_amount;
  }

  // data
  address public owner; // super user who can cancel a withdrawal, add users, or kill the contract
  address[] public users; // users who can request withdrawals
  Withdrawal[] public pendingWithdrawals; // requested withdrawals that can be completed when enough time has passed

  // events
  event WithdrawalRequest(Withdrawal withdrawal);
  event WithdrawalComplete(Withdrawal withdrawal, uint timestamp);

  /// construct the contract
  function SafeWallet() public {
    owner = msg.sender; // the contract creator becomes the owner
  }

  /// create a new user who can request withdrawals
  function createUser(address _address) public {
    require(msg.sender == owner);
    users.push(_address);
  }

  /// remove a new user from the users who can request withdrawals
  /*
  function removeUser(string _name) public {
    //TODO
  }
  */

  /// WIP: request for transfer of the given wei amount of funds to the given address
  function requestWithdrawal(address _to, uint _wei_amount) public {
    pendingWithdrawals.push(Withdrawal(now, msg.sender, _to, _wei_amount));
    // TODO: fire an event
  }

  /// WIP: complete the pending withdrawals that have passed the waiting period (transfer the funds)
  function completeWithdrawals() public {
    for (uint index = 0; index < pendingWithdrawals.length; index++) {
      // TODO: check if enough time passed
      pendingWithdrawals[index].to.transfer(pendingWithdrawals[index].wei_amount);
      // TODO: remove from the pending list
    }
    // TODO: fire an event
  }

  /// WIP: deposit funds to the safe wallet contract
  function deposit() public payable {
    // TODO: fire an event
  }

}
