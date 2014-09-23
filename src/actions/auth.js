var m = require('mori');
var api = require('../api');
var db = require('../state/db');
var persist = require('../lib/persist');
var request = require('../lib/request');
var RoutingActions = require('./routing');

var ns = {};

ns._saveSession = function() {
  var state = m.hash_map('auth', db.get('auth'));
  persist.save(state);
};

ns._destroySession = function() {
  persist.destroy();
};

ns.load = function() {
  var reqKey = ['auth', 'load'].join(':');

  if (db.get(['reqs', reqKey, 'status']) === 'pending') {
    return null;
  }

  var req = request.create();
  var handleError = function(err) {
    db.set(['reqs', reqKey],
      m.merge(req, m.hash_map('status', 'error', 'error', m.js_to_clj(err)))
    );
  };

  var savedState = persist.load();
  var token = m.get_in(savedState, ['auth', 'token']);
  db.set(['reqs', reqKey], req);

  api.init(token, function(err, auth) {
    if (err) return handleError(err);

    var tx = [
      [['reqs', reqKey], m.assoc(req, 'status', 'success')]
    ];
    var afterDbUpdate = function() {};

    if (auth) {
      tx.push(['auth', m.js_to_clj(auth)]);
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
  var reqKey = ['auth', 'login'].join(':');

  if (db.get(['reqs', reqKey, 'status']) === 'pending') {
    return null;
  }

  var req = request.create();
  var handleError = function(err) {
    db.transact([
      [['reqs', reqKey], m.merge(req, m.hash_map('status', 'error', 'error', m.js_to_clj(err)))],
      ['auth', null]
    ]);
  };

  db.set(['reqs', reqKey], req);
  api.user.login(user, function(err) {
    if (err) return handleError(err);

    api.user.get(function(err, user) {
      if (err) return handleError(err);

      db.transact([
        [['reqs', reqKey], m.assoc(req, 'status', 'success')],
        ['auth', m.js_to_clj({
          token: api.token,
          user: user,
          persist: options.remember
        })],
        [['reqs', 'auth:logout'], null]
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
  var reqKey = ['auth', 'logout'].join(':');

  if (db.get(['reqs', reqKey, 'status']) === 'pending') {
    return null;
  }

  var req = request.create();
  var handleError = function(err) {
    db.set(['reqs', reqKey],
      m.merge(req, m.hash_map('status', 'error', 'error', m.js_to_clj(err)))
    );
  };

  db.set(['reqs', reqKey], req);
  api.user.logout(function(err) {
    if (err) return handleError(err);

    var state = m.assoc_in(m.hash_map(),
      ['reqs', reqKey], m.assoc(req, 'status', 'success')
    );
    db.reset(state);

    ns._destroySession();
    RoutingActions.navigateAfterLogout();
  });

  return req;
};

module.exports = ns;
