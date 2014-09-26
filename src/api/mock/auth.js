var _ = require('lodash');

var generateRandomId = require('../../lib/generateRandomId');

var tokenIdSize = 16;

function generateTokenId() {
  return generateRandomId(tokenIdSize);
}

var patch = function(api) {
  var data = api.data;

  function userForToken(token) {
    var pair = _.find(data.tokens, {token: token});
    return pair && data.users[pair.userid];
  }

  function addToken(userId, token) {
    data.tokens.push({
      userid: userId,
      token: token
    });
  }

  function destroyToken(token) {
    data.tokens = _.reject(data.tokens, {token: token});
  }

  function getUserWithCredentials(username, password) {
    return _.find(data.users, function(user) {
      return user.username === username && user.password === password;
    });
  }

  function saveSession(userId, token) {
    addToken(userId, token);
    api.userId = userId;
    api.token = token;
  }

  function destroySession() {
    destroyToken(api.token);
    api.userId = null;
    api.token = null;
  }

  api.auth.load = function(token, callback) {
    setTimeout(function() {
      var user = userForToken(token);
      if (!user) {
        return callback();
      }

      user = _.cloneDeep(user);
      user = _.omit(user, 'password');

      saveSession(user.userid, token);
      callback(null, {
        token: token,
        user: user
      });
    }, 0);
  };

  api.auth.login = function(credentials, callback) {
    var username = credentials.username;
    var password = credentials.password;

    setTimeout(function() {
      var err;
      var user = getUserWithCredentials(username, password);
      if (!user) {
        err = {status: 401, body: 'Wrong username or password.'};
        return callback(err);
      }

      user = _.cloneDeep(user);
      user = _.omit(user, 'password');

      var token = generateTokenId();
      saveSession(user.userid, token);

      callback(null, {
        token: token,
        user: user
      });
    }, 1000);
  };

  api.auth.logout = function(callback) {
    setTimeout(function() {
      destroySession();
      callback();
    }, 1000);
  };

  return api;
};

module.exports = patch;
