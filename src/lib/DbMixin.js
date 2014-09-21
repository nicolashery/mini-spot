var m = require('mori');

var DbMixin = function(db) {
  return {
    getInitialState: function() {
      var state = {};

      if (this.additionalState) {
        state = this.additionalState();
      }

      for (var k in this.stateFromDb) {
        state[k] = db.get(this.stateFromDb[k]);
      }

      return state;
    },

    componentDidMount: function() {
      db.listen(this._refreshState);
    },

    componentWillUnmount: function() {
      db.unlisten(this._refreshState);
    },

    shouldComponentUpdate: function(nextProps, nextState) {
      var result = false;

      if (this.additionalUpdateCheck) {
        result = this.additionalUpdateCheck(nextProps, nextState);
      }

      for (var k in this.stateFromDb) {
        result = result || !m.equals(this.state[k], nextState[k]);
      }

      return result;
    },

    _refreshState: function() {
      if (!this.isMounted()) {
        return;
      }

      var updates = {};
      for (var k in this.stateFromDb) {
        updates[k] = db.get(this.stateFromDb[k]);
      }
      this.setState(updates);
    }
  };
};

module.exports = DbMixin;
