'use strict';
var conf = {
  net : {
    unit : 'kb',
    filter : ['eth0', 'eth1'],
  },
  memory : {
    unit : 'mb'
  },
  disk : {
    filter : ['xvda1']
  },
  path : {
    mount : ['/']
  },
  stats : {
    host : 'localhost',
    port : 6000,
    category : 'profs-stats-blue'
  },
  interval : 1000
};


exports.get = function(key){
  if(conf){
    return conf[key];
  }else{
    return null;
  }
};
