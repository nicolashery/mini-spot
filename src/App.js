/** @jsx React.DOM */
var React = require('react');
var m = require('mori');
var db = require('./state/db');
var router = require('./router');
var DbMixin = require('./lib/DbMixin');
var Navbar = require('./controllers/Navbar');
var Login = require('./controllers/Login');
var RequestActions = require('./actions/request');

var debug = require('bows')('App');

router.setMatchedPaths([
  '/',
  '/login',
  '/about',
  '/dashboard',
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

router.onRouteChange = function(route) {
  var path = route && route.path;

  if (path === '/login') {
    RequestActions.reset('auth');
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
    debug('componentDidMount');
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
      return <p>Dashboard</p>;
    }

    if (path === '/404') {
      return <p>Not found</p>;
    }

    return null;
  }
});

module.exports = App;
