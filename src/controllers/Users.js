/** @jsx React.DOM */
var React = require('react');
var m = require('mori');
var db = require('../state/db');
var DbMixin = require('../lib/DbMixin');
var UserActions = require('../actions/user');

var debug = require('bows')('Users');

var Users = React.createClass({
  mixins: [DbMixin(db)],
  stateFromDb: {
    users: ['users', 'data'],
    fetchReq: ['users', 'reqs', 'fetch']
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
        {this.renderRefresh()}
        {this.renderUserList()}
      </div>
    );
  },

  renderRefresh: function() {
    if (this.isLoading()) {
      return null;
    }

    if (this.isRefreshing()) {
      return <p>Refreshing...</p>;
    }

    return <p><a href="#" onClick={this.handleRefresh}>Refresh</a></p>;
  },

  isLoading: function() {
    return (
      m.get(this.state.fetchReq, 'status') === 'pending' &&
      m.count(this.state.users) === 0
    );
  },

  isRefreshing: function() {
    return (
      m.get(this.state.fetchReq, 'status') === 'pending' &&
      m.count(this.state.users) > 0
    );
  },

  handleRefresh: function(e) {
    e.preventDefault();
    UserActions.fetch();
  },

  renderUserList: function() {
    if (this.isLoading()) {
      return <p>Loading users...</p>;
    }

    if (m.count(this.state.users) === 0) {
      return <p>No users found.</p>;
    }

    var nodes = m.map(function(user) {
      return m.hash_map(
        'key', m.get(user, 'userid'),
        'fullName', m.get_in(user, ['profile', 'fullName']),
        'href', '#/user/' + m.get(user, 'userid'),
        'permissions', m.keys(m.get(user, 'permissions'))
      );
    }, this.state.users);
    nodes = m.clj_to_js(nodes);
    nodes = nodes.map(function(node) {
      var permissions = node.permissions.join(', ');
      return (
        <li key={node.key}>
          <a href={node.href}>{node.fullName}</a>
          <span> ({permissions})</span>
        </li>
      );
    });

    return <ul>{nodes}</ul>;
  }
});

module.exports = Users;
