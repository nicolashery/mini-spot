var m = require('mori');

var DbMixin = function(db) {
  return {
    getInitialState: function() {
      var state = {};
      var stateMapping = this.stateFromDb(this.props);
      if (this.additionalState) {
        state = this.additionalState();
      }
      for (var k in stateMapping) {
        state[k] = db.get(stateMapping[k]);
      }
      return state;
    },

    componentDidMount: function() {
      db.listen(this._handleDbUpdate);
    },

    componentWillUnmount: function() {
      db.unlisten(this._handleDbUpdate);
    },

    componentWillReceiveProps: function(nextProps) {
      this._refreshState(nextProps);
    },

    shouldComponentUpdate: function(nextProps, nextState) {
      var result = false;
      var stateMapping = this.stateFromDb(nextProps);
      if (this.additionalUpdateCheck) {
        result = this.additionalUpdateCheck(nextProps, nextState);
      }
      for (var k in stateMapping) {
        result = result || !m.equals(this.state[k], nextState[k]);
      }
      return result;
    },

    _handleDbUpdate: function() {
      this._refreshState(this.props);
    },

    _refreshState: function(props) {
      if (!this.isMounted()) {
        return;
      }

      var updates = {};
      var stateMapping = this.stateFromDb(props);
      for (var k in stateMapping) {
        updates[k] = db.get(stateMapping[k]);
      }
      this.setState(updates);
    }
  };
};

module.exports = DbMixin;
