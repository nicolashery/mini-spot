var m = require('mori');

var router = require('./router');
var api = require('./api');
var mock = require('./mock');
var db = require('./state/db');
var AuthActions = require('./actions/Auth');
var RoutingActions = require('./actions/Routing');

var env = window.__env;

module.exports = function(callback) {
  var apiUrl = env.API_URL;

  router.setOnChangeHandler(function(uri, route) {
    RoutingActions.navigateTo(route);
  });

  if (!apiUrl || apiUrl === 'mock') {
    mock.init({});
    api = mock.patchApi(api);
  }

  function onDbChange(oldState, newState) {
    if (m.get_in(oldState, ['reqs', 'auth:load', 'status']) === 'pending' &&
        m.get_in(newState, ['reqs', 'auth:load', 'status']) === 'success') {
      router.start();
      callback();
      db.unlisten(onDbChange);
    }
  }
  db.listen(onDbChange);

  AuthActions.load(apiUrl);
};
