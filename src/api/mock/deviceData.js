var patch = function(api) {
  var data = api.data;

  api.deviceData.get = function(userId, options, callback) {
    setTimeout(function() {
      if (typeof options === 'function') {
        callback = options;
      }
      var deviceData = data.patientdata && data.patientdata[userId];
      deviceData = deviceData || [];

      callback(null, deviceData);
    }, 1000);
  };

  return api;
};

module.exports = patch;
