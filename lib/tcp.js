'use strict';
var procfs = require('procfs-stats');


exports.getStatus = (function(){
  return function(cbf){
    procfs.tcp(function(err, tcpList){
      if(err || !tcpList){
        cbf(err, null);
      }else{
        cbf(null, {
          total : tcpList.length
        });
      }
    });
  };
})();