var _ = require('lodash');
var superagent = require('superagent');
var async = require('async');
var personUtils = require('../lib/personUtils');

module.exports = function(api) {
  api.users = {};

    // Get a user's public info
  function getUser(userId, callback) {
    var user = {userid: userId};

    superagent.get(api.makeUrl('/metadata/' + userId + '/profile'))
      .set(api.config.tokenHeader, api.token)
      .end(function(err, res) {
        if (err) {
          return callback(err);
        }

        if (res.status !== 200) {
          return api.handleHttpError(res, callback);
        }

        var profile = res.body;
        user.profile = profile;
        callback(null, user);
      });
  }

  api.users.fetch = function(callback) {
    var currentUserId = api.userId;

    superagent.get(api.makeUrl('/access/groups/' + currentUserId))
      .set(api.config.tokenHeader, api.token)
      .end(function(err, res) {
        if (err) {
          return callback(err);
        }

        if (res.status !== 200) {
          return api.handleHttpError(res, callback);
        }

        var permissions = res.body;
        if (_.isEmpty(permissions)) {
          return callback(null, []);
        }

        var userIds = Object.keys(permissions);
        async.map(userIds, getUser, function(err, users) {
          if (err) {
            return callback(err);
          }

          // Keep only users with "patient" profile
          users = _.filter(users, personUtils.isPatient);

          // Add permissions
          users = _.map(users, function(user) {
            return _.assign(user, {permissions: permissions[user.userid]});
          });

          return callback(null, users);
        });
      });
  };

  api.users.get = function(userId, callback) {
    var currentUserId = api.userId;
    superagent.get(api.makeUrl('/access/groups/' + currentUserId))
      .set(api.config.tokenHeader, api.token)
      .end(function(err, res) {
        if (err) {
          return callback(err);
        }

        if (res.status !== 200) {
          return api.handleHttpError(res, callback);
        }

        var permissions = res.body;
        var currentUserPermissions = permissions[userId];

        getUser(userId, function(err, user) {
          if (err) {
            return callback(err);
          }

          user.permissions = currentUserPermissions;
          callback(null, user);
        });
      });
  };
};
