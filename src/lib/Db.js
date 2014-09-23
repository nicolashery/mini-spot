var merge = require('react/lib/merge');
var m = require('mori');
var toArray = require('./utils').toArray;

var Db = function(state) {
  this._resetState(state);
  this._watchers = [];
};

Db.prototype = merge(Db.prototype, {
  _updateState: function (newState) {
    this._state = newState;
    this._states = m.conj(this.states, newState);
  },

  _resetState: function (state) {
    state = state || m.hash_map();
    this._state = state;
    this._states = m.vector(this.state);
  },

  _notify: function(oldState, newState) {
    this._watchers.forEach(function (w) {
      w(oldState, newState);
    });
  },

  _set: function(state, keys, value) {
    var arrKeys = toArray(keys);
    if (typeof value === 'function') {
      return m.update_in(state, arrKeys, value);
    }
    else {
      return m.assoc_in(state, arrKeys, value);
    }
  },

  set: function (keys, value) {
    var oldState = this._state;
    var newState = this._set(this._state, keys, value);
    this._updateState(newState);
    this._notify(oldState, newState);
  },

  get: function (keys) {
    if (typeof keys === 'string') {
      return m.get(this._state, keys);
    }
    return m.get_in(this._state, keys);
  },

  transact: function(txData) {
    var oldState = this._state;
    var newState = this._state;
    var self = this;
    txData.forEach(function(tx) {
      var keys = tx[0];
      var value = tx[1];
      newState = self._set(newState, keys, value);
    });
    this._updateState(newState);
    this._notify(oldState, newState);
  },

  reset: function(newState) {
    var oldState = this._state;
    this._resetState(newState);
    this._notify(oldState, newState);
  },

  snapshot: function() {
    return this._state;
  },

  listen: function (watcher) {
    this._watchers.push(watcher);
  },

  unlisten: function (watcher) {
    this._watchers = this._watchers.filter(function (w) {
      return w !== watcher;
    });
  }
});

module.exports = Db;
