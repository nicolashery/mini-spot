var data = require('blip-mock-data');

var patch = function(api) {
  api.data = data;

  require('./auth')(api);
  require('./users')(api);
  require('./deviceData')(api);

  return api;
};

module.exports = patch;
