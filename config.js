'use strict';
var conf = {
  net : {
    unit : 'kb',
    filter : ['eth0', 'lo'],
  },
  cpu : {
    filter : ['cpu']
  },
  memory : {
    unit : 'gb'
  },
  disk : {
    filter : ['xvda1']
  },
  stats : {
    host : 'localhost',
    port : 6000,
    category : 'black'
  },
  interval : 500
};


exports.get = function(key){
  if(conf){
    return conf[key];
  }else{
    return null;
  }
};
