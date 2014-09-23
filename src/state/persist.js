var m = require('mori');

var persist = {};

persist._key = 'db';

persist.load = function() {
  var state = window.localStorage.getItem(persist._key);
  if (state && state.length) {
    state = JSON.parse(state);
    state = m.js_to_clj(state);
  }
  return state;
};

persist.save = function(state) {
  state = m.clj_to_js(state);
  state = JSON.stringify(state);
  window.localStorage.setItem(persist._key, state);
};

persist.destroy = function() {
  window.localStorage.removeItem(persist._key);
};

module.exports = persist;
