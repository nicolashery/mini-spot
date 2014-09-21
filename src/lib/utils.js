var _ = require('lodash');

var utils = {};

utils.toArray = function (val) {
  if (!Array.isArray(val)) {
    val = [val];
  }
  return val;
};

// Returns the value in a nested object,
// where `props` is the sequence of properties to follow.
// Returns `undefined` if the key is not present,
// or the `notFound` value if supplied
utils.getIn = function(obj, props, notFound) {
  var start = {
    child: obj,
    isNotFound: false
  };

  var result = _.reduce(props, function(state, prop) {
    if (state.isNotFound) {
      return state;
    }

    var child = state.child;
    if (!_.has(child, prop)) {
      return {
        child: notFound,
        isNotFound: true
      };
    }

    return {
      child: child[prop],
      isNotFound: false
    };
  }, start);

  return result.child;
};

module.exports = utils;
