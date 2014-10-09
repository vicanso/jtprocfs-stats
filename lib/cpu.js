var procfs = require('procfs-stats');
var _ = require('underscore');


exports.getStatus = (function(){
  var prevInfo = null;
  procfs.cpu(function(err, data){
    prevInfo = data;
  });
  return function(cbf){
    if(prevInfo){
      procfs.cpu(function(err, data){
        if(err || !data){
          cbf(null, null);
          return;
        }
        var infos = {
          cpu : cpuStats(data, prevInfo),
          // 给出了自系统启动以来CPU发生的上下文交换的次数
          ctxt : +data.ctxt,
          // 当前运行队列的任务的数目
          procs_running : +data.procs_running,
          // 当前被阻塞的任务的数目
          procs_blocked : +data.procs_blocked
        };
        prevInfo = data;
        cbf(null, infos);
        return;
      });
    }else{
      procfs.cpu(function(err, data){
        prevInfo = data;
      });
      cbf(null, null);
    }
  };
})();


var cpuStats = function(currentInfo, prevInfo){
  var cpus = [];
  _.each(currentInfo, function(currentValue, k){
    var prevValue = prevInfo[k];
    if(!k.indexOf('cpu')){
      var currentTimeTotal = sum(currentValue);
      var prevTimeTotal = sum(prevValue);
      var idle = +currentValue.idle - (+prevValue.idle);
      var iowait = +currentValue.iowait - (+prevValue.iowait);
      var timeTotal = currentTimeTotal - prevTimeTotal;
      idle = Math.floor(idle * 100 / timeTotal);
      cpus.push({
        // 空闲占比
        idle : idle,
        // 忙碌占比
        busy : 100 - idle,
        // io等待占比
        iowait : Math.floor(iowait * 100 / timeTotal)
      });
    }
  });
  return cpus;
}

var sum = function(infos){
  var total = 0;
  _.each(infos, function(v){
    total += (+v);
  });
  return total;
};