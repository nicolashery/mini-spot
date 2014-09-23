var db = require('../state/db');

var ns = {};

ns.reset = function(reqKey) {
  db.set(['reqs', reqKey], null);
};

module.exports = ns;
