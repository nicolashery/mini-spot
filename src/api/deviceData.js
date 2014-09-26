var superagent = require('superagent');

module.exports = function(api) {
  api.deviceData = {};

  api.deviceData.get = function(userId, options, callback) {
    if (typeof options === 'function') {
      callback = options;
    }

    superagent.get(api.makeUrl('/data/' + userId))
      .set(api.config.tokenHeader, api.token)
      .end(function(err, res) {
        if (err) {
          return callback(err);
        }

        if (res.status === 404) {
          return callback(null, []);
        }

        if (res.status !== 200) {
          return api.handleHttpError(res, callback);
        }

        var deviceData = res.body;
        callback(null, deviceData);
      });
  };
};
