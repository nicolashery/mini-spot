var db = require('../state/db');
var toArray = require('../lib/utils').toArray;

var request = {};

request.reset = function(keys) {
  keys = toArray(keys);
  keys.push('req');
  db.set(keys, null);
};

module.exports = request;
