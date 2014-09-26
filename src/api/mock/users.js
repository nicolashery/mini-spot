var _ = require('lodash');
var personUtils = require('../../lib/personUtils');

var patch = function(api) {
  var data = api.data;

  function publicPersonInfo(person) {
    return _.omit(person, 'password', 'username', 'emails');
  }

  api.users.fetch = function(callback) {
    setTimeout(function() {
      var currentUserId = api.userId;
      var groups = {};
      groups[currentUserId] = {root: {}};
      groups = _.assign(groups, data.groups[currentUserId]);

      var users = _.reduce(groups, function(result, permissions, groupId) {
        var user = data.users[groupId];
        if (!personUtils.isPatient(user)) {
          return result;
        }

        user = _.cloneDeep(user);
        user = publicPersonInfo(user);
        user.permissions = permissions;
        result.push(user);
        return result;
      }, []);

      callback(null, users);
    }, 1000);
  };

  api.users.get = function(userId, callback) {
    setTimeout(function() {
      var user = data.users[userId];

      var currentUserId = api.userId;
      var permissions;
      if (userId === currentUserId) {
        permissions = {root: {}};
      }
      else {
        permissions = data.groups[currentUserId] || {};
        permissions = permissions[userId];
      }
      var canViewUser = !_.isEmpty(permissions);

      if (!(user && personUtils.isPatient(user) && canViewUser)) {
        var err = {status: 404, response: 'Not found'};
        return callback(err);
      }

      user = _.cloneDeep(user);
      user = publicPersonInfo(user);
      user.permissions = permissions;

      callback(null, user);
    }, 1000);
  };

  return api;
};

module.exports = patch;
