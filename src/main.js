var React = require('react');
var m = require('mori');
var App = require('./App');
var init = require('./init');
var db = require('./state/db');

db.listen(function(oldState, newState) {
  if (!m.equals(oldState, newState)) {
    console.log(m.clj_to_js(newState));
  }
});

window.React = React;
window.api = require('./api');
window.db = db;
window.m = m;

init(function() {
  window.app = React.renderComponent(App(), document.body);
});
