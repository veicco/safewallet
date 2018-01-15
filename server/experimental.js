/* experimental try out of eth-dragger library */

var Dagger = require('eth-dagger');

// requires ./node_modules/eth-dagger/lib/wooden-dagger.js --url=http://localhost:9545
// when testRCP is running on http://localhost:9545 ('truffle develop')
var dagger = new Dagger('mqtt://localhost:1883');

// address of the deployed contract
var address = '0x345ca3e014aaf5dca488057592ee47305d9b3e10';

// watch contract logs
dagger.on("latest:log/" + address, function(result) {
  console.log("Log:");
  console.log(result);
});