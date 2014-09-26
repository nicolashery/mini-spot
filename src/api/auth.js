var _ = require('lodash');
var superagent = require('superagent');

module.exports = function(api) {
  api.auth = {};

  // This is a "version" counter for the number of times we've gotten
  // a new token. It is used to invalidate stale attempts at refreshing
  // a token.
  api.auth._tokenRequests = 0;

  api.auth._refreshToken = function(token, callback) {
    superagent.get(api.makeUrl('/auth/login'))
      .set(api.config.tokenHeader, token)
      .end(function(err, res) {
        if (err) {
          api.config.onTokenRefresh(null);
          return callback(err);
        }

        if (res.status !== 200) {
          api.config.onTokenRefresh(null);
          return api.handleHttpError(res, callback);
        }

        var token = res.headers[api.config.tokenHeader];
        api.config.onTokenRefresh(token);
        return callback(null, token);
      });
  };

  // Pass a token to save session and start loop refresh token
  // Pass null to destroy session and stop loop
  api.auth._sessionLoop = function(token) {
    if (!token) {
      api.token = null;
      api.log('Stopped refresh token');
      return;
    }

    api.token = token;
    api.log('Refreshed token');

    var tokenRequest = ++api.auth._tokenRequests;
    var refreshSession = function() {
      if (!token || tokenRequest !== api.auth._tokenRequests) {
        api.log('Stopping session refresh for request', tokenRequest);
        return;
      }

      api.auth._refreshToken(token, function(err, token) {
        if (err || !token) {
          api.log('Failed refreshing session');
          api.auth._sessionLoop(null);
        } else {
          api.auth._sessionLoop(token);
        }
      });
    };

    setTimeout(refreshSession, api.config.tokenRefreshInterval);
  };

  api.auth.load = function(token, callback) {
    if (!token) {
      return callback();
    }

    api.auth._refreshToken(token, function(err, token) {
      if (err || !token) {
        return callback(err);
      }

      api.auth._getUserForToken(token, function(err, user) {
        if (err) {
          return callback(err);
        }

        api.userId = user.userid;
        api.auth._sessionLoop(token);
        var auth = {token: token, user: user};
        callback(null, auth);
      });
    });
  };

  api.auth._getUserForToken = function(token, callback) {
    superagent.get(api.makeUrl('/auth/user'))
      .set(api.config.tokenHeader, token)
      .end(function(err, res) {
        if (err) {
          return callback(err);
        }

        if (res.status !== 200) {
          return api.handleHttpError(res, callback);
        }

        var account = res.body;
        superagent.get(api.makeUrl('/metadata/' + account.userid + '/profile'))
          .set(api.config.tokenHeader, token)
          .end(function(err, res) {
            if (err) {
              return callback(err);
            }

            if (res.status !== 200) {
              return api.handleHttpError(res, callback);
            }

            var profile = res.body;
            var user = _.pick(account, 'userid', 'username', 'emails');
            user.profile = profile;
            return callback(null, user);
          });
      });
  };

  api.auth.getUser = function(callback) {
    api.auth._getUserForToken(api.token, callback);
  };

  api.auth.login = function(credentials, callback) {
    var username = credentials.username;
    var password = credentials.password;
    var longtermkey = credentials.longtermkey;

    var url = api.makeUrl('/auth/login');
    if (longtermkey) {
      url = url + '/' + longtermkey;
    }

    superagent
      .post(url)
      .auth(username, password)
      .end(function(err, res) {
        if (err) {
          return callback(err);
        }

        if (res.status !== 200) {
          return api.handleHttpError(res, callback);
        }

        var token = res.headers[api.config.tokenHeader];
        api.auth._getUserForToken(token, function(err, user) {
          if (err) {
            return callback(err);
          }

          api.userId = user.userid;
          api.auth._sessionLoop(token);
          var auth = {token: token, user: user};
          callback(null, auth);
        });
      });
  };

  api.auth.logout = function(callback) {
    superagent
      .post(api.makeUrl('/auth/logout'))
      .set(api.config.tokenHeader, api.token)
      .end(function(err, res) {
        if (err) {
          return callback(err);
        }

        if (res.status !== 200) {
          return api.handleHttpError(res, callback);
        }

        api.userId = null;
        api.auth._sessionLoop(null);
        callback();
      });
  };
};
