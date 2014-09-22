var m = require('mori');
var api = require('../api');
var db = require('../state/db');
var request = require('../lib/request');

var ns = {};

ns.fetch = function() {
  if (db.get(['users', 'reqs', 'fetch', 'status']) === 'pending') {
    return null;
  }

  var req = request.create();
  var handleError = function(err) {
    db.transact([
      [['users', 'reqs', 'fetch'], m.merge(req, m.hash_map('status', 'error', 'error', m.js_to_clj(err)))],
    ]);
  };

  db.set(['users', 'reqs', 'fetch'], req);
  api.patient.getAll(function(err, users) {
    if (err) return handleError(err);

    db.transact([
      [['users', 'reqs', 'fetch'], m.assoc(req, 'status', 'success')],
      [['users', 'data'], m.js_to_clj(users)]
    ]);
  });

  return req;
};

module.exports = ns;
