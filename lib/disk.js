var procfs = require('procfs-stats');
var config = require('../config');
var _ = require('underscore');
var diskConfig = config.get('disk') || {};

exports.getStatus = (function(){
  var prevInfo = null;
  var lastUpdatedAt = 0;
  procfs.disk(function(err, data){
    if(data){
      lastUpdatedAt = Date.now();
      prevInfo = data;
    }
  });

  return function(cbf){
    if(prevInfo){
      procfs.disk(function(err, data){
        if(err || !data){
          cbf(null, null);
          return;
        }else{
          var now = Date.now();
          var diskInfos = {};
          _.each(data, function(v, i){
            var currentValue = v;
            var prevValue = prevInfo[i];
            var deviceName = currentValue.device;
            if(diskConfig.filter && !~_.indexOf(diskConfig.filter, deviceName)){
              return;
            }
            var infos = {
              read : +currentValue.reads_completed - (+prevValue.reads_completed),
              write : +currentValue.writes_completed - (+prevValue.writes_completed),
              'ms-reading' : +currentValue.ms_reading - (+prevValue.ms_reading),
              'ms-writing' : +currentValue.ms_writing - (+prevValue.ms_writing)
            };
            diskInfos[deviceName] = infos;
          });

          lastUpdatedAt = now;
          prevInfo = data;
          cbf(null, diskInfos);
        }
      });
    }else{
      procfs.disk(function(err, data){
        if(data){
          lastUpdatedAt = Date.now();
          prevInfo = data;
        }
      });
      cbf(null, null);
    }
  };
})();