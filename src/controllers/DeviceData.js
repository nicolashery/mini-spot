/** @jsx React.DOM */
var React = require('react');
var m = require('mori');
var db = require('../state/db');
var DbMixin = require('../lib/DbMixin');
var DeviceDataActions = require('../actions/deviceData');

var debug = require('bows')('DeviceData');

var DeviceData = React.createClass({
  propTypes: {
    userId: React.PropTypes.string
  },

  mixins: [DbMixin(db)],
  stateFromDb: function(props) {
    var userId = props.userId;
    var reqKey = ['deviceData', userId, 'fetch'].join(':');
    return {
      deviceData: ['deviceData', userId],
      fetchReq: ['reqs', reqKey]
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
        {this.renderData()}
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
      m.count(this.state.deviceData) === 0
    );
  },

  isRefreshing: function() {
    return (
      m.get(this.state.fetchReq, 'status') === 'pending' &&
      m.count(this.state.deviceData) > 0
    );
  },

  handleRefresh: function(e) {
    e.preventDefault();
    DeviceDataActions.fetch(this.props.userId);
  },

  renderData: function() {
    if (this.isLoading()) {
      return <p>Loading data...</p>;
    }

    return <p>Count: <strong>{m.count(this.state.deviceData)}</strong></p>;
  }
});

module.exports = DeviceData;
