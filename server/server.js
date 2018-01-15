var Web3 = require('web3');

var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545'));

var prevBlock;
var loop = function() {
  web3.eth.getBlock('latest').then(function(block){
    if(block.number !== prevBlock) {
      prevBlock = block.number;
      console.log(block);
    }
  });

  setTimeout(loop, 5000);
};

loop();
