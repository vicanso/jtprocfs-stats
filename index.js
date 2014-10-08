var cpu = require('./lib/cpu');
var tcp = require('./lib/tcp');
var udp = require('./lib/udp');
var unix = require('./lib/unix');
var net = require('./lib/net');

// setInterval(function(){
//   cpu.getStatus(function(err, infos){
//     console.dir(infos);
//   });
// }, 10000);

tcp.getStatus(function(err, infos){
  console.dir(infos);
});


udp.getStatus(function(err, infos){
  console.dir(infos);
});

unix.getStatus(function(err, infos){
  console.dir(infos);
});


net.getStatus(function(err, infos){
  console.dir(infos);
});