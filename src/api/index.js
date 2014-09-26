var _ = require('lodash');
var bows = require('bows');

var api = {};

api.log = bows('Api');

api.config = {
  host: null,
  tokenHeader: 'x-tidepool-session-token',
  onTokenRefresh: _.noop,
  tokenRefreshInterval: 10 * 60 * 1000 // 10 min
};

api.token = null;
api.userId = null;

api.init = function(options, callback) {
  api.config = _.assign(api.config, options.config);
  api.auth.load(options.token, callback);
};

api.makeUrl = function(uri) {
  if (uri[0] === '/') {
    uri = uri.slice(1);
  }
  var host = api.config.host;
  if (host[host.length - 1] === '/') {
    host = host.slice(0, host.length - 1);
  }
  return api.config.host + '/' + uri;
};

api.handleHttpError = function(res, callback) {
  var err = {status: res.status, body: res.body};
  return callback(err);
};

require('./auth')(api);
require('./users')(api);
require('./deviceData')(api);

module.exports = api;
