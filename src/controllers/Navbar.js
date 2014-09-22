/** @jsx React.DOM */
var React = require('react');
var m = require('mori');
var db = require('../state/db');
var DbMixin = require('../lib/DbMixin');
var AuthActions = require('../actions/auth');

var debug = require('bows')('Navbar');

var Navbar = React.createClass({
  mixins: [DbMixin(db)],
  stateFromDb: {
    user: ['auth', 'data', 'user'],
    logoutReq: ['auth', 'reqs', 'logout']
  },

  componentDidMount: function() {
    debug('componentDidMount');
  },

  componentWillUnmount: function() {
    debug('componentWillUnmount');
  },

  render: function() {
    debug('render');
    var user = this.state.user;

    if (!user) {
      return (
        <div>
          <a href="#/login">Log in</a>
          <span> • </span>
          <a href="#/about">About</a>
        </div>
      );
    }

    return (
      <div>
        <a href="#/dashboard">Dashboard</a>
        <span> • </span>
        <span>Logged in as <strong>{m.get_in(user, ['profile', 'fullName'])}</strong></span>
        <span> • </span>
        {this.renderLogout()}
      </div>
    );
  },

  renderLogout: function() {
    if (m.get(this.state.logoutReq, 'status') === 'pending') {
      return <span>Logging out...</span>;
    }

    return <a href="#" onClick={this.handleClickLogout}>Log out</a>;
  },

  handleClickLogout: function(e) {
    e.preventDefault();
    AuthActions.logout();
  }
});

module.exports = Navbar;
