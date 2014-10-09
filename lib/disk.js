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
          _.each(data, function(v, i){
            if(diskConfig.filter && !~_.indexOf(diskConfig.filter, v.device)){
              return;
            }
            console.dir(v);
          });
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