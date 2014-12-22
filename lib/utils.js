'use strict';
var _ = require('lodash');

exports.limit = function(data, options){
  _.forEach(data, function(v, k){
    if(options && options.min != null){
      data[k] = Math.max(options.min, v);
    }
    if(options && options.max != null){
      data[k] = Math.min(options.max, v);
    }
  });
  return data;
};