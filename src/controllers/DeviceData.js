/** @jsx React.DOM */
var React = require('react');
var m = require('mori');
var DbMixin = require('../lib/DbMixin');
var DeviceDataActions = require('../actions/deviceData');
var DataSummaryView = require('../state/views/DataSummary');

var debug = require('bows')('DeviceData');

var DeviceData = React.createClass({
  propTypes: {
    userId: React.PropTypes.string
  },

  mixins: [DbMixin(DataSummaryView)],
  stateFromDb: function(props) {
    var userId = props.userId;
    var reqKey = ['deviceData', userId, 'fetch'].join(':');
    return {
      summary: ['summaries', userId],
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
      m.equals(this.state.summary, null)
    );
  },

  isRefreshing: function() {
    return (
      m.get(this.state.fetchReq, 'status') === 'pending' &&
      !m.equals(this.state.summary, null)
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

    return <p>Count: <strong>{this.state.summary}</strong></p>;
  }
});

module.exports = DeviceData;
