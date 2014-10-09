var config = require('../config');
var _ = require('underscore');
var memoryConfig = config.get('memory') || {};
var os = require('os');
var bytes = require('bytes');
var memoryUnitValue = 1;
if(memoryConfig.unit){
  memoryUnitValue = bytes('1' + memoryConfig.unit);
}


exports.getStatus = function(cbf){
  var totalmem = os.totalmem();
  var freemem = os.freemem();
  var usemem = os.totalmem() - freemem;
  GLOBAL.setImmediate(function(){
    cbf(null, {
      usagePercentage : Math.round(usemem * 100 / totalmem),
      usage : Math.round(usemem / memoryUnitValue),
      free : Math.round((freemem / memoryUnitValue))
    });
  });
};