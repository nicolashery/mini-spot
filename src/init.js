var m = require('mori');

var router = require('./router');
var api = require('./api');
var mock = require('./mock');
var db = require('./state/db');
var RoutingActions = require('./actions/routing');

module.exports = function(callback) {
  router.setOnChangeHandler(function(uri, route) {
    RoutingActions.navigateTo(route);
  });

  mock.init({});
  api = mock.patchApi(api);
  api.init(function() {
    if (api.user.isAuthenticated()) {
      return api.user.get(function(err, user) {
        if (err) return callback(err);
        db.set(['auth', 'data'], m.js_to_clj({
          token: api.token,
          user: user
        }));
        router.start();
        callback();
      });
    }

    router.start();
    callback();
  });
};
