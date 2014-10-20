var procfs = require('procfs-stats');
var config = require('../config');
var _ = require('underscore');
var pathConfig = config.get('path') || {};
var utils = require('./utils');
var async = require('async');
var diskspace = require('diskspace');
var mb = 1024 * 1024;

var getDiskPathInfos = function(cbf){
  var fnList = _.map(pathConfig.mount, function(mountPath){
    return function(cbf){
      diskspace.check(mountPath, function(err, total, free, status){
        if(err){
          cbf(err);
        }else{
          cbf(null, {
            total : total,
            free : free,
            path : mountPath,
            status : status
          });
        }
      });
    }
  });
  async.parallel(fnList, cbf);

}

exports.getStatus = (function(){
  var prevInfo = null;
  var lastUpdatedAt = 0;
  getDiskPathInfos(function(err, data){
    if(data){
      lastUpdatedAt = Date.now();
      prevInfo = data;
    }
  });
  return function(cbf){
    if(prevInfo){
      getDiskPathInfos(function(err, data){
        if(err || !data){
          cbf(null, null);
          return;
        }else{
          var now = Date.now();
          var mountInfos = [];
          var interval = now - lastUpdatedAt;
          _.each(data, function(v, i){
            var writeDataSize = Math.max(prevInfo[i].free - v.free, 0);
            var tmpInfo = {
              free : Math.floor(v.free * 100 / v.total),
              rate : Math.floor(writeDataSize * 1000 / (interval * mb)),
              path : v.path
            };
            mountInfos.push(tmpInfo);
          });
          lastUpdatedAt = now;
          prevInfo = data;
          cbf(null, mountInfos);
        }
      });
    }else{
      getDiskPathInfos(function(err, data){
        if(data){
          lastUpdatedAt = Date.now();
          prevInfo = data;
        }
      });
      cbf(null, null);
    }
  };
})();

