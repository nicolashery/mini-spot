/** @jsx React.DOM */
var React = require('react');
var m = require('mori');
var db = require('../state/db');
var DbMixin = require('../lib/DbMixin');

var debug = require('bows')('UserNav');

var UserNav = React.createClass({
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

    if (this.isReqPending()) {
      return null;
    }

    var userId = m.get(this.state.user, 'userid');
    var name = m.get_in(this.state.user, ['profile', 'fullName']);
    return (
      <p>
        {'Viewing user '}
        <strong>{name}</strong>
        <span> • </span>
        <a href={'#/user/' + userId + '/data'}>Data</a>
        <span> • </span>
        <a href={'#/user/' + userId + '/profile'}>Profile</a>
      </p>
    );
  },

  isReqPending: function() {
    return m.get(this.state.getReq, 'status') === 'pending';
  }
});

module.exports = UserNav;
