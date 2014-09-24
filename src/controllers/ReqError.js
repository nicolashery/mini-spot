/** @jsx React.DOM */
var React = require('react');
var m = require('mori');
var db = require('../state/db');
var DbMixin = require('../lib/DbMixin');

var debug = require('bows')('ReqError');

var ReqError = React.createClass({
  propTypes: {
    userId: React.PropTypes.string
  },

  mixins: [DbMixin(db)],
  stateFromDb: function() {
    return {
      reqs: 'reqs'
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

    var reqs = this.reqsWithError();
    if (!m.count(reqs)) {
      return null;
    }

    var nodes = m.map(function(req) {
      return m.hash_map(
        'key', m.get(req, 'id'),
        'error', m.get_in(req, ['error', 'response'], 'No message')
      );
    }, reqs);
    nodes = m.clj_to_js(nodes);
    nodes = nodes.map(function(node) {
      return <li key={node.key}>{node.error}</li>;
    });

    return (
      <div>
        <p>Some errors occured during a request:</p>
        <ul>{nodes}</ul>
      </div>
    );
  },

  reqsWithError: function() {
    // Keep only 500 errors
    return m.filter(function(req) {
      return m.get_in(req, ['error', 'status']) === 500;
    }, m.vals(this.state.reqs));
  }
});

module.exports = ReqError;
