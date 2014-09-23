var m = require('mori');
var api = require('../api');
var db = require('../state/db');
var request = require('../lib/request');

var ns = {};

ns.fetch = function() {
  var reqKey = ['users', 'fetch'].join(':');

  if (db.get(['reqs', reqKey, 'status']) === 'pending') {
    return null;
  }

  var req = request.create();
  var handleError = function(err) {
    db.transact([
      [['reqs', reqKey], m.merge(req, m.hash_map('status', 'error', 'error', m.js_to_clj(err)))],
    ]);
  };

  db.set(['reqs', reqKey], req);
  api.patient.getAll(function(err, users) {
    if (err) return handleError(err);

    db.transact([
      [['reqs', reqKey], m.assoc(req, 'status', 'success')],
      [['users'], m.js_to_clj(users)]
    ]);
  });

  return req;
};

module.exports = ns;
