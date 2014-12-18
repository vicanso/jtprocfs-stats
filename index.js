'use strict';
var jtLogger = require('jtlogger');
jtLogger.appPath = __dirname + '/';
if(process.env.NODE_ENV === 'production'){
  jtLogger.mode = 'file';
  jtLogger.logPath = '/vicanso/log/profs-stats';
}

var cpu = require('./lib/cpu');
var tcp = require('./lib/tcp');
var udp = require('./lib/udp');
var unix = require('./lib/unix');
var net = require('./lib/net');
var disk = require('./lib/disk');
var memory = require('./lib/memory');
var async = require('async');
var _ = require('underscore');
var domain = require('domain');
var config = require('./config');
var bytes = require('bytes');
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
    disk : disk.getStatus
  }, cbf);
};


var d = domain.create();
d.on('error', function(err) {
  console.error('Caught error: %s, stack:%s', err.message, err.stack);
});
var run = function(){
  console.log('start to get status, interval:' + interval);
  var statsHandler = function(){
    getAllStatus(function(err, infos){
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
      console.log('memory rss:%s', bytes(process.memoryUsage().rss));
    });
  };
  _.delay(statsHandler, interval);

};

d.run(run);
