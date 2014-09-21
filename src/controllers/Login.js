/** @jsx React.DOM */
var React = require('react');
var m = require('mori');
var db = require('../state/db');
var DbMixin = require('../lib/DbMixin');
var AuthActions = require('../actions/auth');

var debug = require('bows')('Login');

var Login = React.createClass({
  mixins: [DbMixin(db)],
  stateFromDb: {
    req: ['auth', 'req']
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
        <p>Hint: demo/demo</p>
        <form>
          <p><input ref="username" placeholder="username"/></p>
          <p><input ref="password" placeholder="password"/></p>
          <p>{this.renderButton()}</p>
        </form>
        <p>{this.renderError()}</p>
      </div>
    );
  },

  renderButton: function() {
    var disabled;
    var text = 'Login';

    if (m.get(this.state.req, 'status') === 'pending') {
      disabled = true;
      text = 'Logging in...';
    }

    return (
      <button
        type="submit"
        onClick={this.handleLogin}
        disabled={disabled}>
        {text}
      </button>
    );
  },

  handleLogin: function(e) {
    e.preventDefault();
    var username = this.refs.username.getDOMNode().value;
    var password = this.refs.password.getDOMNode().value;
    AuthActions.login({
      username: username,
      password: password
    });
  },

  renderError: function() {
    var error = m.get(this.state.req, 'error');
    if (!error) {
      return null;
    }

    return JSON.stringify(m.clj_to_js(error));
  }
});

module.exports = Login;
