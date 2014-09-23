var m = require('mori');

var router = require('./router');
var api = require('./api');
var mock = require('./mock');
var db = require('./state/db');
var AuthActions = require('./actions/auth');
var RoutingActions = require('./actions/routing');

module.exports = function(callback) {
  router.setOnChangeHandler(function(uri, route) {
    RoutingActions.navigateTo(route);
  });

  mock.init({});
  api = mock.patchApi(api);

  function onDbChange(oldState, newState) {
    if (m.get_in(oldState, ['auth', 'reqs', 'load', 'status']) === 'pending' &&
        m.get_in(newState, ['auth', 'reqs', 'load', 'status']) === 'success') {
      router.start();
      callback();
      db.unlisten(onDbChange);
    }
  }
  db.listen(onDbChange);

  AuthActions.load();
};
