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
var RequestActions = require('./actions/request');
var UserActions = require('./actions/user');

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

  if (path === '/login') {
    RequestActions.reset(['auth', 'reqs', 'login']);
  }

  if (path ==='/dashboard') {
    RequestActions.reset(['users', 'reqs', 'fetch']);
    UserActions.fetch();
  }
};

var App = React.createClass({
  mixins: [DbMixin(db)],
  stateFromDb: {
    route: 'route'
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

    if (path === '/user/:userId/data') {
      return (
        <div>
          <h2>Data</h2>
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
