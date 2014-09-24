var m = require('mori');
var api = require('../api');
var db = require('../state/db');
var request = require('../lib/request');

var ns = {};

// Update "long" user with a "short" user object
// but don't loose existing "long" user attributes
ns._mergeIntoLongUser = function(longUser, shortUser) {
  var team = m.get(longUser, 'team');
  if (!team) {
    return shortUser;
  }
  return m.assoc(shortUser, 'team', team);
};

// Update a db user map with a list of short users
ns._updateWithShortUsers = function(users, shortUsers) {
  var oldUsers = users || m.hash_map();
  var newUsers = m.reduce(function(acc, user) {
    var userId = m.get(user, 'userid');
    var oldUser = m.get(oldUsers, userId);
    if (oldUser) {
      user = ns._mergeIntoLongUser(oldUser, user);
    }
    return m.assoc(acc, userId, user);
  }, m.hash_map(), shortUsers);
  return newUsers;
};

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

    users = m.js_to_clj(users);
    users = ns._updateWithShortUsers(db.get('users'), users);

    db.transact([
      [['reqs', reqKey], m.assoc(req, 'status', 'success')],
      [['users'], users]
    ]);
  });

  return req;
};

ns.get = function(userId) {
  var reqKey = ['users', userId, 'get'].join(':');

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
  api.patient.get(userId, function(err, user) {
    if (err) return handleError(err);

    db.transact([
      [['reqs', reqKey], m.assoc(req, 'status', 'success')],
      [['users', userId], m.js_to_clj(user)]
    ]);
  });

  return req;
};

module.exports = ns;
