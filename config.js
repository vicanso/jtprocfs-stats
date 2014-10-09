try{
  var conf = require('./conf');
}catch(e){
  conf = null;
}


exports.get = function(key){
  if(conf){
    return conf[key];
  }else{
    return null;
  }
};
