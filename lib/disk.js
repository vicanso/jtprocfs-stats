'use strict';
var procfs = require('procfs-stats');
var config = require('../config');
var _ = require('lodash');
var diskConfig = config.get('disk') || {};
var utils = require('./utils');
var async = require('async');
var bytes = require('bytes');
var spawn = require('child_process').spawn;

var dfCmd = function(cbf){
  var df = spawn('df', ['-k']);
  var bufList = [];
  var end = function(){
    var str = Buffer.concat(bufList).toString();
    var arr = str.split('\n');
    arr.shift();
    var result = {};
    var prefix = '/dev/';
    _.forEach(arr, function(str){
      var infos = str.trim().split(/\s+/);
      var device = infos[0];
      if(device.substring(0, prefix.length) === prefix){
        device = device.substring(prefix.length);
      }
      if(diskConfig.filter && ~_.indexOf(diskConfig.filter, device)){
        var available = infos[3];
        var total = infos[1];
        available = Math.round(bytes(available + 'kb') / bytes('1gb'));
        if(available && total){
          result[device] = {
            available : +available,
            total : +total
          };
        }
      }
    });
    cbf(null, result);
  };
  df.stdout.on('data', function(buf){
    if(buf){
      bufList.push(buf);
    }
  });
  df.on('close', end);
};

var procfsDisk = function(cbf){
  procfs.disk(function(err, data){
    if(err){
      cbf(err);
      return;
    }
    var result = _.filter(data, function(item){
      if(!diskConfig.filter || !~_.indexOf(diskConfig.filter, item.device)){
        return false;
      }else{
        return true;
      }
    });
    cbf(null, result);
  });
};

var getDiskInfo = function(cbf){
  async.parallel([
    procfsDisk,
    dfCmd
  ], function(err, dataList){
    if(err){
      cbf(err);
      return;
    }
    var result = {};

    _.forEach(dataList[0], function(data){
      var device = data.device;
      result[device] = _.extend({
        'read-times' : +data.reads_completed,
        'write-times' : +data.writes_completed,
        'ms-reading' : +data.ms_reading,
        'ms-writing' : +data.ms_writing
      }, dataList[1][device]);
    });
    cbf(null, result);
  });
};
// getDiskInfo(function(){

// });

exports.getStatus = (function(){
  var prevInfo = null;
  var lastUpdatedAt = 0;
  getDiskInfo(function(err, data){
    if(data){
      lastUpdatedAt = Date.now();
      prevInfo = data;
    }
  });

  return function(cbf){
    if(prevInfo){
      getDiskInfo(function(err, data){
        if(err || !data){
          cbf(null, null);
          return;
        }else{
          var now = Date.now();
          var diskInfos = {};
          _.forEach(data, function(currentValue, device){
            var prevValue = prevInfo[device];
            var result = {};
            _.forEach('read-times write-times ms-reading ms-writing'.split(' '), function(key){
              result[key] = currentValue[key] - prevValue[key];
            });
            result.available = Math.ceil(100 * currentValue.available / currentValue.total);
            var writeKbyte = prevValue.available - currentValue.available;
            var writeSpeed = 0;
            if(writeKbyte > 0){
              writeSpeed = Math.ceil(writeKbyte / (now - lastUpdatedAt));
            }
            
            result.writeSpeed = writeSpeed;
            diskInfos[device] = result;
          });
          lastUpdatedAt = now;
          prevInfo = data;
          cbf(null, diskInfos);
        }
      });
    }else{
      getDiskInfo(function(err, data){
        if(data){
          lastUpdatedAt = Date.now();
          prevInfo = data;
        }
      });
      cbf(null, null);
    }
  };
})();