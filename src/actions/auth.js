var m = require('mori');
var api = require('../api');
var db = require('../state/db');
var request = require('../lib/request');
var RoutingActions = require('./routing');

var auth = {};

auth.login = function(user, options) {
  if (db.get(['auth', 'req', 'status']) === 'pending') {
    return null;
  }

  var req = request.create();
  var handleError = function(err) {
    db.set('auth', m.hash_map(
      'req', m.merge(req, m.hash_map('status', 'error', 'error', m.js_to_clj(err))),
      'data', null
    ));
  };

  db.set(['auth', 'req'], req);
  api.user.login(user, options, function(err) {
    if (err) return handleError(err);

    api.user.get(function(err, user) {
      if (err) return handleError(err);

      db.set('auth', m.hash_map(
        'req', m.assoc(req, 'status', 'success'),
        'data', m.js_to_clj({
          token: api.token,
          user: user
        })
      ));
      RoutingActions.navigateAfterLogin();
    });
  });

  return req;
};

module.exports = auth;
