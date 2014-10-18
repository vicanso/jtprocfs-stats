var _ = require('underscore');

exports.limit = function(data, options){
  _.each(data, function(v, k){
    if(options && options.min != null){
      data[k] = Math.max(options.min, v);
    }
    if(options && options.max != null){
      data[k] = Math.min(options.max, v);
    }
  });
  return data;
};