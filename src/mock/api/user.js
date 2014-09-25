/**
 * Copyright (c) 2014, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 */

var _ = require('lodash');

var common = require('./common');

var userIdSize = 10;
var tokenIdSize = 16;

function generateUserId() {
  return common.generateRandomId(userIdSize);
}

function generateTokenId() {
  return common.generateRandomId(tokenIdSize);
}

var patch = function(mock, api) {
  var data = mock.data;
  var getParam = mock.getParam;
  var getDelayFor = mock.getDelayFor;

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

  function usernameAlreadyExists(username) {
    var result = _.find(data.users, {username: username});
    return Boolean(result);
  }

  function addUser(user) {
    data.users[user.userid] = user;
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

  function matchInvitationsToUser(user) {
    var userId = user.userid;
    var emails = user.emails;
    _.forEach(data.confirmations, function(confirmation) {
      var match = (
        confirmation.type === 'invite' &&
        _.contains(emails, confirmation.email)
      );

      if (match) {
        // Mutate confirmation object in mock data
        confirmation.userid = userId;
      }
    });
  }

  api.user.loadSession = function(token, callback) {
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

      api.log('[mock] Session loaded');
    }, getDelayFor('auth.loadsession'));
  };

  api.user.destroySession = destroySession;

  api.user.isAuthenticated = function() {
    return Boolean(api.userId && api.token);
  };

  api.user.login = function(user, options, callback) {
    var username = user.username;
    var password = user.password;

    setTimeout(function() {
      var err;
      var user = getUserWithCredentials(username, password);
      if (!user) {
        err = {status: 401, response: 'Wrong username or password.'};
      }
      if (!err) {
        var userId = user.userid;
        var token = generateTokenId();
        saveSession(userId, token);
        api.log('[mock] Login success');
      }
      else {
        api.log('[mock] Login failed');
      }
      callback(err);
    }, getDelayFor('api.user.login') || 1000);
  };

  api.user.logout = function(callback) {
    setTimeout(function() {
      var err;
      if (getParam('auth.logout.error')) {
        err = {status: 500, response: 'Logout failed, please try again.'};
      }
      if (!err) {
        destroySession();
        api.log('[mock] Logout success');
      }
      else {
        api.log('[mock] Logout failed');
      }
      callback(err);
    }, getDelayFor('api.user.logout') || 1000);
  };

  api.user.signup = function(user, callback) {
    user = _.cloneDeep(user);

    setTimeout(function() {
      var err;
      if (usernameAlreadyExists(user.username)) {
        err = {
          status: 400,
          response: 'An account already exists for that username.'
        };
      }
      if (!err) {
        user.userid = generateUserId();
        addUser(user);

        var token = generateTokenId();
        saveSession(user.userid, token);

        matchInvitationsToUser(user);

        api.log('[mock] Signup success');
      }
      else {
        api.log('[mock] Signup failed');
      }

      user = _.omit(user, 'password');
      callback(err, user);
    }, getDelayFor('api.user.signup'));
  };

  api.user.get = function(callback) {
    api.log('[mock] GET /user');

    var user = data.users[api.userId];
    user = _.cloneDeep(user);
    user = _.omit(user, 'password');

    if (getParam('api.user.get.nopatient')) {
      user.profile = _.omit(user.profile, 'patient');
    }
    if (getParam('api.user.get.onlycaregiver')) {
      user.profile = _.omit(user.profile, 'patient');
      user.profile.isOnlyCareGiver = true;
    }

    setTimeout(function() {
      callback(null, user);
    }, getDelayFor('api.user.get'));
  };

  api.user.put = function(user, callback) {
    api.log('[mock] PUT /user');
    setTimeout(function() {
      var err;
      if (getParam('api.user.put.error')) {
        err = {status: 500};
      }

      var savedUser = data.users[api.userId];
      user = _.assign({}, savedUser, user);
      data.users[api.userId] = user;

      user = _.omit(user, 'password');
      callback(err, user);
    }, getDelayFor('api.user.put'));
  };

  return api;
};

module.exports = patch;
