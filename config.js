var conf = {
  "net" : {
    "unit" : "kb",
    "filter" : ["em1"]
  },
  "disk" : {
    "filter" : ["sda"]
  },
  "memory" : {
    "unit" : "gb"
  },
  "stats" : {
    "host" : "192.168.1.19",
    "port" : "6000",
    "category" : "profs-stats-blue",
    "bufferSize" : 100
  },
  "interval" : 10000
}


var conf = {
  net : {
    unit : 'kb',
    filter : ['eth0', 'eth1'],
  },
  memory : {
    unit : 'mb'
  },
  stats : {
    host : 'localhost',
    port : '6000',
    category : 'profs-stats-blue',
    bufferSize : 100
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
