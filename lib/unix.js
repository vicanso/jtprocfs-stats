'use strict';
var procfs = require('procfs-stats');


exports.getStatus = (function(){
  return function(cbf){
    procfs.unix(function(err, unixList){
      if(err || !unixList){
        cbf(err, null);
      }else{
        cbf(null, {
          total : unixList.length
        });
      }
    });
  };
})();