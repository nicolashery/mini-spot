var React = require('react');
var m = require('mori');
var App = require('./App');
var init = require('./init');
var db = require('./state/db');

var showDebug = window.localStorage.getItem('debug');

db.listen(function(oldState, newState) {
  if (showDebug && !m.equals(oldState, newState)) {
    // Build a state object that's not too big to be logged
    var state = newState;
    if (m.get(newState, 'deviceData')) {
      var deviceData = m.reduce_kv(function(acc, userId, userDeviceData) {
        return m.assoc(acc, userId, m.count(userDeviceData));
      }, m.hash_map(), m.get(newState, 'deviceData'));
      state = m.assoc(state, 'deviceData', deviceData);
    }
    console.log(m.clj_to_js(state));
  }
});

window.React = React;
window.api = require('./api');
window.db = db;
window.m = m;

init(function() {
  window.app = React.renderComponent(App(), document.body);
});
