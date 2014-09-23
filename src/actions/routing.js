var m = require('mori');
var router = require('../router');
var db = require('../state/db');

var debug = require('bows')('RoutingActions');

var ns = {};

ns.navigateTo = function(route) {
  var path = route && route.path;
  debug('navigateTo', route);
  var tx = [];

  var routeFound = route && router.isRouteMatched(route);
  var isDefaultRoute = (path === '/');
  var routeRequiresAuth = route && router.requiresAuth(route);
  var userIsAuthenticated = Boolean(db.get(['auth', 'data', 'token']));

  if (!routeFound) {
    debug('route not found, redirecting');
    route = router.notFoundRoute();
  }
  else if (isDefaultRoute) {
    debug('default route, redirecting');
    route = userIsAuthenticated ?
      router.defaultAuthRoute() : router.defaultNoAuthRoute();
  }
  else if (routeRequiresAuth && !userIsAuthenticated) {
    debug('not logged in, redirecting');
    tx.push(['redirectAfterLogin', m.js_to_clj(route)]);
    route = router.defaultNoAuthRoute();
  }
  else if (!routeRequiresAuth && userIsAuthenticated) {
    debug('already logged in, redirecting');
    route = router.defaultAuthRoute();
  }

  route = router.applyRedirects(route);

  router.beforeRouteChange(route);
  router.updateBrowserUri(route);
  tx.push(['route', m.js_to_clj(route)]);
  db.transact(tx);
};

ns.navigateAfterLogin = function() {
  var redirectAfterLogin = db.get('redirectAfterLogin');
  if (redirectAfterLogin) {
    debug('logged in, redirecting to previous route');
    db.set('redirectAfterLogin', null);
    return this.navigateTo(m.clj_to_js(redirectAfterLogin));
  }

  this.navigateTo(router.defaultAuthRoute());
};

ns.navigateAfterLogout = function() {
  this.navigateTo(router.defaultNoAuthRoute());
};

module.exports = ns;
