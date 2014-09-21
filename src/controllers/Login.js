/** @jsx React.DOM */
var React = require('react');
var m = require('mori');
var db = require('../state/db');
var DbMixin = require('../lib/DbMixin');
var AuthActions = require('../actions/auth');
var uriFromRoute = require('../router').uriFromRoute;

var debug = require('bows')('Login');

var Login = React.createClass({
  mixins: [DbMixin(db)],
  stateFromDb: {
    loginReq: ['auth', 'reqs', 'login'],
    redirectAfterLogin: 'redirectAfterLogin'
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
        {this.renderRedirectAfterLogin()}
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

  renderRedirectAfterLogin: function() {
    if (!this.state.redirectAfterLogin) {
      return null;
    }

    return (
      <p>
        <span>After logging in you will be redirected to </span>
        <strong>{uriFromRoute(m.clj_to_js(this.state.redirectAfterLogin))}</strong>
      </p>
    );
  },

  renderButton: function() {
    var disabled;
    var text = 'Login';

    if (m.get(this.state.loginReq, 'status') === 'pending') {
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
    var error = m.get(this.state.loginReq, 'error');
    if (!error) {
      return null;
    }

    return JSON.stringify(m.clj_to_js(error));
  }
});

module.exports = Login;
