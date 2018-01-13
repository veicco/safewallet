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
the user account in devices that are connected to the Internet, as long as the
owner address is stored securely. The owner address/account is however needed
in the following cases: when the contract is deployed, when the contract settings
are modified, when a request must be cancelled, or when the contract is killed
(in which case the remaining funds are transferred to the owner. These special
transactions can be generated offline to ensure security.
*/
contract SafeWallet {

  /* Data */
  struct Withdrawal {
    uint created_at;
    address to;
    uint wei_amount;
    uint status; // 0 = pending, 1 = completed, 2 = cancelled
  }
  mapping(uint => Withdrawal) private withdrawals;

  /* Settings */
  address private owner;
  address private user;
  uint private confirmTime; // time in milliseconds

  /* Internal variables */
  uint private withdrawalCount = 0;

  /* Events */
  event Deposit(address from, uint wei_amount);
  event WithdrawalRequest(uint id, address to, uint wei_amount);
  event WithdrawalConfirm(uint id, address to, uint wei_amount);
  event WithdrawalCancel(uint id, address to, uint wei_amount);

  /* Methods */

  /// construct the contract
  function SafeWallet(address _user) public {

    // the contract creator becomes the owner
    owner = msg.sender;

    // the user must be specified by the contract creator
    user = _user;

    // set the default value for confirmTime
    confirmTime = 1000;
  }

  /// get the user's address
  function getUser() public view returns(address) {
    return user;
  }

  /// get the owner's address
  function getOwner() public view returns(address) {
    return owner;
  }

  /// get the total count of requested withdrawals
  function getWithdrawalCount() public view returns(uint) {
    return withdrawalCount;
  }

  /// get contents of a pending withdrawal
  function getWithdrawal(uint _id) public view returns (uint, address, uint, uint) {
    require(_id < withdrawalCount);
    Withdrawal storage withdrawal = withdrawals[_id];
    return (withdrawal.created_at, withdrawal.to, withdrawal.wei_amount, withdrawal.status);
  }

  /// request for transfer of the given wei amount of funds to the given address
  function requestWithdrawal(address _to, uint _wei_amount) public {
    require(msg.sender == user);
    withdrawals[withdrawalCount] = Withdrawal(now, _to, _wei_amount, 0);
    WithdrawalRequest(withdrawalCount, _to, _wei_amount);
    withdrawalCount += 1;
  }

  /// confirm a withdrawal with the given id
  function confirmWithdrawal(uint _id) public {
    require(msg.sender == user);

    // require the withdrawal exists
    require(_id < withdrawalCount);

    Withdrawal storage withdrawal = withdrawals[_id];

    // require the status is pending
    require(withdrawal.status == 0);

    // require enough time has passed
    require(now - withdrawal.created_at >= confirmTime);

    // require the balance is enough
    require(withdrawal.wei_amount <= this.balance);

    // execute the transfer
    withdrawal.to.transfer(withdrawal.wei_amount);

    // change status of the withdrawal to completed
    withdrawal.status = 1;

    // fire an event
    WithdrawalConfirm(_id, withdrawal.to, withdrawal.wei_amount);
  }

  function cancelWithdrawal(uint _id) public {
    require(msg.sender == owner || msg.sender == user);

    // require the withdrawal exists
    require(_id < withdrawalCount);

    Withdrawal storage withdrawal = withdrawals[_id];

    // require the withdrawal is pending
    require(withdrawal.status == 0);

    // change status of the withdrawal to cancelled
    withdrawal.status = 2;

    // fire an event
    WithdrawalCancel(_id, withdrawal.to, withdrawal.wei_amount);
  }

  /// kill the contract and return the remaining funds to the owner
  function kill() public {
    if(msg.sender == owner) {
       selfdestruct(owner);
     }
  }

  /// deposit funds to the contract
  function () public payable {
    Deposit(msg.sender, msg.value);
  }

}
