pragma solidity ^0.4.18;


contract SafeWallet {

  /* Data */
  struct Withdrawal {
    uint createdAt;
    address to;
    uint weiAmount;
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
  event Deposit(address from, uint weiAmount);
  event WithdrawalRequest(uint id, address to, uint weiAmount);
  event WithdrawalConfirm(uint id, address to, uint weiAmount);
  event WithdrawalCancel(uint id, address to, uint weiAmount);

  /* Methods */

  /// construct the contract
  function SafeWallet(address _user) public {

    // the contract creator becomes the owner
    owner = msg.sender;

    // the user must be specified by the contract creator
    user = _user;

    // set the default value for confirmTime
    confirmTime = 1000 * 60 * 5;
  }

  /// deposit funds to the contract
  function () public payable {
    Deposit(msg.sender, msg.value);
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
    return (withdrawal.createdAt, withdrawal.to, withdrawal.weiAmount, withdrawal.status);
  }

  /// request for transfer of the given wei amount of funds to the given address
  function requestWithdrawal(address _to, uint _weiAmount) public {
    require(msg.sender == user);
    withdrawals[withdrawalCount] = Withdrawal(block.timestamp, _to, _weiAmount, 0);
    WithdrawalRequest(withdrawalCount, _to, _weiAmount);
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
    require(block.timestamp - withdrawal.createdAt >= confirmTime);

    // require the balance is enough
    require(withdrawal.weiAmount <= this.balance);

    // execute the transfer
    withdrawal.to.transfer(withdrawal.weiAmount);

    // change status of the withdrawal to completed
    withdrawal.status = 1;

    // fire an event
    WithdrawalConfirm(_id, withdrawal.to, withdrawal.weiAmount);
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
    WithdrawalCancel(_id, withdrawal.to, withdrawal.weiAmount);
  }

  /// kill the contract and return the remaining funds to the owner
  function kill() public {
    require(msg.sender == owner);
    selfdestruct(owner);
  }

}
