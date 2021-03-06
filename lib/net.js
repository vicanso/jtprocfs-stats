'use strict';
var procfs = require('procfs-stats');
var config = require('../config');
var _ = require('lodash');
var netConfig = config.get('net') || {};
var bytes = require('bytes');
var utils = require('./utils');
var netUnitValue = 1;
if(netConfig.unit){
  netUnitValue = bytes('1' + netConfig.unit);
}

exports.getStatus = (function(){
  var prevInfo = null;
  var lastUpdatedAt = 0;
  procfs.net(function(err, data){
    if(data){
      lastUpdatedAt = Date.now();
      prevInfo = data;
    }
  });

  return function(cbf){
    if(prevInfo){
      procfs.net(function(err, data){
        if(err || !data){
          cbf(null, null);
          return;
        }else{
          var now = Date.now();
          var netInfos = {};
          var interval = now - lastUpdatedAt;
          _.forEach(data, function(v, i){
            var currentValue = v;
            var prevValue = prevInfo[i];
            var interfaceName = currentValue.Interface;
            interfaceName = interfaceName.substring(0, interfaceName.length - 1);
            if(netConfig.filter && !~_.indexOf(netConfig.filter, interfaceName)){
              return;
            }
            var receiveBytes = +currentValue.bytes.Receive - (+prevValue.bytes.Receive);
            var receiveInfo = {
              kbytes : Math.ceil(receiveBytes / 1024),
              rate : Math.ceil((receiveBytes / netUnitValue) * 1000 / interval),
              packets : +currentValue.packets.Receive - (+prevValue.packets.Receive),
              errs : +currentValue.errs.Receive - (+prevValue.errs.Receive),
              drop : +currentValue.drop.Receive - (+prevValue.drop.Receive)
            };
            var transmitBytes = +currentValue.bytes.Transmit - (+prevValue.bytes.Transmit);
            var transmitInfo = {
              kbytes : Math.ceil(transmitBytes / 1024),
              rate : Math.ceil((transmitBytes / netUnitValue) * 1000 / interval),
              packets : +currentValue.packets.Transmit - (+prevValue.packets.Transmit),
              errs : +currentValue.errs.Transmit - (+prevValue.errs.Transmit),
              drop : +currentValue.drop.Transmit - (+prevValue.drop.Transmit)
            };
            netInfos[interfaceName] = {
              receive : utils.limit(receiveInfo, {min : 0}),
              transmit : utils.limit(transmitInfo, {min : 0}),
              interval : interval
            };
          });
          lastUpdatedAt = now;
          prevInfo = data;
          cbf(null, netInfos);
        }
      });
    }else{
      procfs.net(function(err, data){
        if(data){
          lastUpdatedAt = Date.now();
          prevInfo = data;
        }
      });
      cbf(null, null);
    }
  };
})();