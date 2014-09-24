/** @jsx React.DOM */
var React = require('react');
var m = require('mori');
var db = require('../state/db');
var DbMixin = require('../lib/DbMixin');
var UserActions = require('../actions/User');

var debug = require('bows')('Profile');

var Profile = React.createClass({
  propTypes: {
    userId: React.PropTypes.string
  },

  mixins: [DbMixin(db)],
  stateFromDb: function(props) {
    var userId = props.userId;
    var reqKey = ['users', userId, 'get'].join(':');
    return {
      user: ['users', userId],
      getReq: ['reqs', reqKey]
    };
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
        {this.renderProfileInfo()}
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
      m.get(this.state.getReq, 'status') === 'pending' &&
      !this.state.user
    );
  },

  isRefreshing: function() {
    return (
      m.get(this.state.getReq, 'status') === 'pending' &&
      this.state.user
    );
  },

  handleRefresh: function(e) {
    e.preventDefault();
    UserActions.get(this.props.userId);
  },

  renderProfileInfo: function() {
    if (this.isLoading()) {
      return <p>Loading profile info...</p>;
    }

    var user = this.state.user;
    var nodes = m.js_to_clj([
      {keys: ['userid'], label: 'User ID'},
      {keys: ['profile', 'fullName'], label: 'Full name'},
      {keys: ['profile', 'patient', 'birthday'], label: 'Date of birth'},
      {keys: ['profile', 'patient', 'diagnosisDate'], label: 'Diagnosis date'},
      {keys: ['profile', 'patient', 'about'], label: 'About'}
    ]);
    nodes = m.map(function(node) {
      var key = m.reduce(function(acc, val) {
        return acc + '-' + val;
      }, '', m.get(node, 'keys'));
      return m.hash_map(
        'key', key,
        'label', m.get(node, 'label'),
        'value', m.get_in(user, m.get(node, 'keys'))
      );
    }, nodes);
    nodes = m.filter(function(node) {
      return m.count(m.get(node, 'value'));
    }, nodes);

    nodes = m.clj_to_js(nodes);
    nodes = nodes.map(function(node) {
      return (
        <li key={node.key}>
          <strong>{node.label + ':'}</strong>
          <span> {node.value}</span>
        </li>
      );
    });

    return <ul>{nodes}</ul>;
  }
});

module.exports = Profile;
