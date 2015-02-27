'use strict';
var config = require('./config');
var os = require('os');
var env = process.env.NODE_ENV || 'development';
var debug = process.env.DEBUG;
var request = require('request');

var os = require('os');
var cpu = require('./lib/cpu');
var tcp = require('./lib/tcp');
var udp = require('./lib/udp');
var unix = require('./lib/unix');
var net = require('./lib/net');
var disk = require('./lib/disk');
var memory = require('./lib/memory');
var async = require('async');
var _ = require('lodash');
var domain = require('domain');
var bytes = require('bytes');
var interval = config.get('interval') || 10 * 1000;
var JTStatsClient = require('jtstats_client');




var getAllStatus = function(cbf){
  async.parallel({
    cpu : cpu.getStatus,
    tcp : tcp.getStatus,
    udp : udp.getStatus,
    memory : memory.getStatus,
    net : net.getStatus,
    disk : disk.getStatus
  }, cbf);
};


var d = domain.create();
d.on('error', function(err) {
  console.error('Caught error: %s, stack:%s', err.message, err.stack);
});
var run = function(serverList){
  initLog(serverList.log);
  var options = serverList.stats;
  console.dir(options);
  options.category = os.hostname();
  console.dir(options);
  var client = new JTStatsClient(options);
  console.log('start to get status, interval:' + interval);
  var runningCount = 0;
  var statsHandler = function(){
    getAllStatus(function(err, infos){
      if(debug && infos){
        console.log(JSON.stringify(infos));
      }
      _.each(infos, function(v, k){
        switch(k){
          case 'memory':
            _.each(v, function(v1, k1){
              client.gauge('mem.' + k1, v1);
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
        }
      });
      _.delay(statsHandler, interval);
      if(runningCount % 100 == 0){
        var memoryUsage = process.memoryUsage();
        console.log('memory rss:%s heapTotal:%s heapUsed:%s', bytes(memoryUsage.rss), bytes(memoryUsage.heapTotal), bytes(memoryUsage.heapUsed));
      }
      runningCount++;
    });
  };
  _.delay(statsHandler, interval);

};

d.run(function(){
  getServers(function(err, serverList){
    if(err){
      console.error(err);
    }else{
      console.dir(serverList);
      run(serverList);
    }
  });
});


function initLog(server){
  var jtLogger = require('jtlogger');
  jtLogger.appPath = __dirname + '/';

  if(env !== 'development'){
    var logServerInfo = process.env.LOG_SERVER.split(':');
    jtLogger.add(jtLogger.transports.UDP, server);
  }

  jtLogger.add(jtLogger.transports.Console);
  jtLogger.logPrefix = '[profs-stats][' + os.hostname() + ']';
}


function getServers(cbf){
  if(env === 'development'){
    cbf(null, {
      log : {
        host : 'localhost',
        port : 2900
      },
      stats : {
        host : 'localhost',
        port : 6000
      }
    });
  }else{
    request.get('http://jt-service.oss-cn-shenzhen.aliyuncs.com/server.json', function(err, res, body){
      if(err){
        cbf(err);
        return;
      }
      try{
        var data = JSON.parse(body);
      }catch(err){
        cbf(err);
        return;
      }
      cbf(null, data);
    });
  }
}