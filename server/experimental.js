/* experimental try out of eth-dragger library */

var Dagger = require('eth-dagger');

// requires ./node_modules/eth-dagger/lib/wooden-dagger.js --url=http://localhost:9545
// when testRCP is running on http://localhost:9545 ('truffle develop')
var dagger = new Dagger('mqtt://localhost:1883');

// address of the deployed contract
var address = '0xf25186b5081ff5ce73482ad761db0eb0d25abfbf';

// watch contract logs
dagger.on(address, function(result) {
  console.log("Log: ", result);
});