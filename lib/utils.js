'use strict';
var _ = require('lodash');

exports.limit = function(data, options){
  _.forEach(data, function(v, k){
    if(options && !_.isNull(options.min) && !_.isUndefined(options.min)){
      data[k] = Math.max(options.min, v);
    }
    if(options && !_.isNull(options.max) && !_.isUndefined(options.max)){
      data[k] = Math.min(options.max, v);
    }
  });
  return data;
};