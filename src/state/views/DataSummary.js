var m = require('mori');
var Db = require('../../lib/Db');
var db = require('../db');

var view = new Db();

view._handleDbUpdate = function(oldSate, newState) {
  var reqKeys = this._reqKeysFrom(newState);
  if (this._needsReqsUpdate(reqKeys, oldSate, newState)) {
    this._updateReqs(reqKeys);
  }

  // Potentially expensive computation here,
  // so return immediately using setTimeout
  var self = this;
  setTimeout(function() {
    m.each(self._userIdsFrom(newState), function(userId) {
      if (self._needsSummaryUpdate(userId, oldSate, newState)) {
        self._updateSummary(userId);
      }
    });
  });
};

// Get the keys of the req objects we're interested in here
view._reqKeysFrom = function(state) {
  var reqKeys = m.keys(m.get(state, 'reqs'));
  reqKeys = m.filter(function(k) {
    return /^deviceData/.test(k);
  }, reqKeys);
  return reqKeys;
};

// On a db update, do we need to update our own "reqs" map?
view._needsReqsUpdate = function(reqKeys, oldSate, newState) {
  // Has at least one request changed?
  return m.reduce(function(acc, reqKey) {
    if (acc) {
      return true;
    }
    else {
      return !m.equals(
        m.get_in(oldSate, ['reqs', reqKey]),
        m.get_in(newState, ['reqs', reqKey])
      );
    }
  }, false, reqKeys);
};

view._updateReqs = function(reqKeys) {
  var reqs = m.reduce(function(acc, reqKey) {
    return m.assoc(acc, reqKey, db.get(['reqs', reqKey]));
  }, m.hash_map(), reqKeys);
  this.set('reqs', reqs);
};

// Get user ids with device data
view._userIdsFrom = function(state) {
  return m.keys(m.get(state, 'deviceData'));
};

view._needsSummaryUpdate = function(userId, oldSate, newState) {
  return !m.equals(
    m.get_in(oldSate, ['deviceData', userId]),
    m.get_in(newState, ['deviceData', userId])
  );
};

view._updateSummary = function(userId) {
  var deviceData = db.get(['deviceData', userId]);
  this.set(['summaries', userId], m.count(deviceData));
};

// Initialize
view._handleDbUpdate = view._handleDbUpdate.bind(view);
db.listen(view._handleDbUpdate);
view._updateReqs(view._reqKeysFrom(db.snapshot()));
m.each(view._userIdsFrom(db.snapshot()), function(userId){
  view._updateSummary(userId);
});

module.exports = view;
