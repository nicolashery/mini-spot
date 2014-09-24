/** @jsx React.DOM */
var React = require('react');
var merge = require('react/lib/merge');
var m = require('mori');

var db = require('./state/db');
var router = require('./router');
var DbMixin = require('./lib/DbMixin');

var Navbar = require('./controllers/Navbar');
var Login = require('./controllers/Login');
var Users = require('./controllers/Users');
var UserNav = require('./controllers/UserNav');
var DeviceData = require('./controllers/DeviceData');

var RequestActions = require('./actions/request');
var UserActions = require('./actions/user');
var DeviceDataActions = require('./actions/deviceData');

var debug = require('bows')('App');

router.setMatchedPaths([
  '/',
  '/login',
  '/about',
  '/dashboard',
  '/user/:userId',
  '/user/:userId/data',
  '/404'
]);

router.requiresAuth = function(route) {
  var path = route && route.path;
  return path !== '/login' && path !== '/about';
};

router.defaultAuthRoute = function() {
  return {path: '/dashboard'};
};

router.defaultNoAuthRoute = function() {
  return {path: '/login'};
};

router.notFoundRoute = function() {
  return {path: '/404'};
};

router.applyRedirects = function(route) {
  var path = route && route.path;

  if (path === '/user/:userId') {
    return merge(route, {path: '/user/:userId/data'});
  }

  return route;
};

router.beforeRouteChange = function(route) {
  var path = route && route.path;
  var reqKey;

  if (path === '/login') {
    RequestActions.reset('auth:login');
    return;
  }

  if (path ==='/dashboard') {
    RequestActions.reset('users:fetch');
    UserActions.fetch();
    return;
  }

  var userId;
  if (/^\/user\/:userId/.test(path)) {
    userId = route.params && route.params.userId;
    reqKey = ['users', userId, 'get'].join(':');
    RequestActions.reset(reqKey);
    UserActions.get(userId);
  }

  if (path ==='/user/:userId/data') {
    reqKey = ['deviceData', userId, 'fetch'].join(':');
    RequestActions.reset(reqKey);
    DeviceDataActions.fetch(userId);
    return;
  }
};

var App = React.createClass({
  mixins: [DbMixin(db)],
  stateFromDb: function() {
    return {route: 'route'};
  },

  componentDidMount: function() {
    debug('componentDidMount');
  },

  componentWillUnmount: function() {
    debug('componentWillUnmount');
  },

  render: function() {
    debug('render');
    return (
      <div>
        <Navbar />
        {this.renderContent()}
      </div>
    );
  },

  renderContent: function() {
    var path = m.get(this.state.route, 'path');

    if (path === '/login') {
      return <Login />;
    }

    if (path === '/about') {
      return <p>About</p>;
    }

    if (path === '/dashboard') {
      return (
        <div>
          <h2>Dashboard</h2>
          <Users />
        </div>
      );
    }

    var userId;
    if (/^\/user\/:userId/.test(path)) {
      userId = m.get_in(this.state.route, ['params', 'userId']);
    }

    if (path === '/user/:userId/data') {
      return (
        <div>
          <UserNav userId={userId} />
          <h2>Data</h2>
          <DeviceData userId={userId} />
        </div>
      );
    }

    if (path === '/404') {
      return <p>Not found</p>;
    }

    return null;
  }
});

module.exports = App;
