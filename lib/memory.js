'use strict';
var config = require('../config');
var _ = require('lodash');
var memoryConfig = config.get('memory') || {};
var os = require('os');
var bytes = require('bytes');
var memoryUnitValue = 1;
var fs = require('fs');
var async = require('async');
if(memoryConfig.unit){
  memoryUnitValue = bytes('1' + memoryConfig.unit);
}

var getMemoInfo = function(cbf){
  var getBytes = function(str){
    var arr = str.trim().split(' ');
    if(arr.length == 2){
      return bytes(arr[0] + arr[1].toLowerCase());
    }else{
      return parseInt(arr[0]);
    }

  }
  async.waterfall([
    function(cbf){
      fs.readFile('/proc/meminfo', 'utf8', cbf);
    },
    function(info, cbf){
      var infos = {};
      _.forEach(info.split('\n'), function(str){
        var arr = str.split(':');
        if(arr.length == 2){
          infos[arr[0].trim()] = getBytes(arr[1]);
        }
      });
      var used = infos.MemTotal - infos.MemFree - infos.Buffers - infos.Cached
      var free = infos.MemTotal - used;
      var result = {
        used : Math.round(used / memoryUnitValue),
        usageRate : Math.round(used * 100 / infos.MemTotal)
      };
      cbf(null, result);
    }
  ], cbf)
}
exports.getStatus = getMemoInfo