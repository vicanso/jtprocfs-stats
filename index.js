var cpu = require('./lib/cpu');
var tcp = require('./lib/tcp');
var udp = require('./lib/udp');
var unix = require('./lib/unix');
var net = require('./lib/net');
var disk = require('./lib/disk');
var memory = require('./lib/memory');
var diskPath = require('./lib/disk_path');
var async = require('async');
var _ = require('underscore');
var domain = require('domain');
var config = require('./config');
var interval = config.get('interval') || 10 * 1000;
var JTStatsClient = require('jtstats_client');
var client = new JTStatsClient(config.get('stats'));


var getAllStatus = function(cbf){
  async.parallel({
    cpu : cpu.getStatus,
    tcp : tcp.getStatus,
    udp : udp.getStatus,
    memory : memory.getStatus,
    net : net.getStatus,
    path : diskPath.getStatus,
    disk : disk.getStatus
  }, cbf);
};

var d = domain.create();
d.on('error', function(err) {
  console.error('Caught error!', err);
});
var run = function(){
  console.log('start to get status, interval:' + interval);
  setInterval(function(){
    getAllStatus(function(err, infos){
      _.each(infos, function(v, k){
        switch(k){
          case 'memory':
            _.each(v, function(v1, k1){
              client.gauge(k1, v1);
            });
            break;

          case 'cpu':
            _.each(v.cpu, function(cpuInfo, i){
              _.each(cpuInfo, function(v1, k1){
                var name = 'cpu';
                if(i){
                  name += i;
                }
                client.gauge(name + '.' + k1, v1);
              });
            });
            client.gauge('procs_running', v.procs_running);
            client.gauge('procs_blocked', v.procs_blocked);
            break;


          case 'udp':
            client.gauge('udp', v.total);
            break;

          case 'tcp':
            client.gauge('tcp', v.total);
            break;

          case 'net':
            _.each(v, function(v, interfaceName){
              _.each(v, function(infos, k){
                var name = interfaceName + '.' + k;
                _.each(infos, function(v1, k1){
                  if(k1 == 'rate'){
                    client.gauge(name + '.' + k1, v1);
                  }else{
                    client.count(name + '.' + k1, v1);
                  }
                  
                });
              });
            });
            break;

          case 'disk':
            _.each(v, function(v, diviceName){
              _.each(v, function(v, k){
                var name = diviceName + '.' + k;
                client.count(name, v);
              });
            });
            break;
          case 'path':
            _.each(v, function(v){
              client.gauge('pathFree.' + v.path, v.free);
              client.average('pathWriteRate.' + v.path, v.rate);
            });
            break;
        }
      });
    });
  }, interval);
};

d.run(run);



// setInterval(function(){
//   cpu.getStatus(function(err, infos){
//     console.dir(infos);
//   });
// }, 10000);

// tcp.getStatus(function(err, infos){
//   console.dir(infos);
// });


// memory.getStatus(function(err, infos){
//   console.dir(infos);
// });

// udp.getStatus(function(err, infos){
//   console.dir(infos);
// });

// unix.getStatus(function(err, infos){
//   console.dir(infos);
// });

// setInterval(function(){
//   net.getStatus(function(err, infos){
//     console.dir(infos);
//   });
// }, 2000);

// setInterval(function(){
//   disk.getStatus(function(err, infos){
//     console.dir(infos);
//   });
// }, 2000);