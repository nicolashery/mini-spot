var m = require('mori');

var router = require('./router');
var api = require('./api');
var mock = require('./mock');
var db = require('./state/db');
var persist = require('./state/persist');
var RoutingActions = require('./actions/routing');

function saveSession() {
  var state = m.hash_map(
    'auth', m.hash_map('data', db.get(['auth', 'data']))
  );
  persist.save(state);
}

function destroySession() {
  persist.destroy();
}

module.exports = function(callback) {
  router.setOnChangeHandler(function(uri, route) {
    RoutingActions.navigateTo(route);
  });

  mock.init({});
  api = mock.patchApi(api);

  var state = persist.load();
  api.init(m.get_in(state, ['auth', 'data', 'token']), function(err, auth) {
    if (auth) {
      db.set(['auth', 'data'], m.js_to_clj(auth));
      saveSession();
    }
    else {
      destroySession();
    }

    router.start();
    callback();
  });

  // Save or destroy local session on login/logout
  // Not entirely happy with this.
  // Maybe need an event dispatch a la Flux, after all?
  db.listen(function(oldState, newState) {
    if (m.get_in(oldState, ['auth', 'reqs', 'login', 'status']) === 'pending' &&
        m.get_in(newState, ['auth', 'reqs', 'login', 'status']) === 'success' &&
        m.get_in(newState, ['auth', 'persist']) === true) {
      saveSession();
      return;
    }

    if (m.get_in(oldState, ['auth', 'reqs', 'logout', 'status']) === 'pending' &&
        m.get_in(newState, ['auth', 'reqs', 'logout', 'status']) === 'success') {
      destroySession();
      return;
    }
  });
};
