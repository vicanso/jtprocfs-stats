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
  stats : {
    host : 'localhost',
    port : '6000',
    category : 'profs-stats-blue',
    bufferSize : 1000
  },
  interval : 10000
};


exports.get = function(key){
  if(conf){
    return conf[key];
  }else{
    return null;
  }
};
