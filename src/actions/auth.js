var m = require('mori');
var api = require('../api');
var db = require('../state/db');
var request = require('../lib/request');
var RoutingActions = require('./routing');

var ns = {};

ns.login = function(user, options) {
  if (db.get(['auth', 'reqs', 'login', 'status']) === 'pending') {
    return null;
  }

  var req = request.create();
  var handleError = function(err) {
    db.transact([
      [['auth', 'reqs', 'login'], m.merge(req, m.hash_map('status', 'error', 'error', m.js_to_clj(err)))],
      [['auth', 'data'], null]
    ]);
  };

  db.set(['auth', 'reqs', 'login'], req);
  api.user.login(user, function(err) {
    if (err) return handleError(err);

    api.user.get(function(err, user) {
      if (err) return handleError(err);

      db.transact([
        [['auth', 'reqs', 'login'], m.assoc(req, 'status', 'success')],
        [['auth', 'data'], m.js_to_clj({
          token: api.token,
          user: user
        })],
        [['auth', 'persist'], options.remember],
        [['auth', 'reqs', 'logout'], null]
      ]);
      RoutingActions.navigateAfterLogin();
    });
  });

  return req;
};

ns.logout = function() {
  if (db.get(['auth', 'reqs', 'logout', 'status']) === 'pending') {
    return null;
  }

  var req = request.create();
  var handleError = function(err) {
    db.set(['auth', 'reqs', 'logout'],
      m.merge(req, m.hash_map('status', 'error', 'error', m.js_to_clj(err)))
    );
  };

  db.set(['auth', 'reqs', 'logout'], req);
  api.user.logout(function(err) {
    if (err) return handleError(err);

    var state = m.js_to_clj({auth: {}});
    state = m.assoc_in(state,
      ['auth', 'reqs', 'logout'], m.assoc(req, 'status', 'success')
    );
    db.reset(state);
    RoutingActions.navigateAfterLogout();
  });

  return req;
};

module.exports = ns;
