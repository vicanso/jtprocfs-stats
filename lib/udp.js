'use strict';
var procfs = require('procfs-stats');


exports.getStatus = (function(){
  return function(cbf){
    procfs.udp(function(err, udpList){
      if(err || !udpList){
        cbf(err, null);
      }else{
        cbf(null, {
          total : udpList.length
        });
      }
    });
  };
})();