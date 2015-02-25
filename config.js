'use strict';
var os = require('os');
var statsServerInfo = process.env.STATS_SERVER.split(':');
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
    host : statsServerInfo[0],
    port : statsServerInfo[1],
    category : os.hostname()
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
