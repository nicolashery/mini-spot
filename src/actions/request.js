var db = require('../state/db');
var toArray = require('../lib/utils').toArray;

var ns = {};

ns.reset = function(keys) {
  keys = toArray(keys);
  db.set(keys, null);
};

module.exports = ns;
