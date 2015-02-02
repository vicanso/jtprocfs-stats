'use strict';
var conf = {
  net : {
    unit : 'kb',
    filter : ['em1', 'lo'],
  },
  cpu : {
    filter : ['cpu']
  },
  memory : {
    unit : 'gb'
  },
  disk : {
    filter : ['sda']
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
