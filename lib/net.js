var procfs = require('procfs-stats');
var _ = require('underscore');


exports.getStatus = (function(){
  return function(cbf){
    procfs.net(function(err, netInfo){
      console.dir(netInfo);
    });
  };
})();