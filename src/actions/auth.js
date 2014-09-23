var m = require('mori');
var api = require('../api');
var db = require('../state/db');
var persist = require('../lib/persist');
var request = require('../lib/request');
var RoutingActions = require('./routing');

var ns = {};

ns._saveSession = function() {
  var state = m.hash_map(
    'auth', m.hash_map('data', db.get(['auth', 'data']))
  );
  persist.save(state);
};

ns._destroySession = function() {
  persist.destroy();
};

ns.load = function() {
  if (db.get(['auth', 'reqs', 'load', 'status']) === 'pending') {
    return null;
  }

  var req = request.create();
  var handleError = function(err) {
    db.set(['auth', 'reqs', 'load'],
      m.merge(req, m.hash_map('status', 'error', 'error', m.js_to_clj(err)))
    );
  };

  var savedState = persist.load();
  var token = m.get_in(savedState, ['auth', 'data', 'token']);
  db.set(['auth', 'reqs', 'load'], req);

  api.init(token, function(err, auth) {
    if (err) return handleError(err);

    var tx = [
      [['auth', 'reqs', 'load'], m.assoc(req, 'status', 'success')]
    ];
    var afterDbUpdate = function() {};

    if (auth) {
      tx.push([['auth', 'data'], m.js_to_clj(auth)]);
      afterDbUpdate = ns._saveSession;
    }
    else {
      afterDbUpdate = ns._destroySession;
    }

    db.transact(tx);
    afterDbUpdate();
  });

  return req;
};

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

      if (options.remember) {
        ns._saveSession();
      }
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

    ns._destroySession();
    RoutingActions.navigateAfterLogout();
  });

  return req;
};

module.exports = ns;
