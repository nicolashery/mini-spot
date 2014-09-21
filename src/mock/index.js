var _ = require('lodash');
var mockData = require('blip-mock-data');

var mock = {};

mock.params = {};
mock.data = mockData;

mock.setParams = function(newParams) {
  this.params = _.assign(this.params, newParams);
  return this.params;
};

mock.getParam = function(name) {
  return mock.params[name];
};

mock.getDelayFor = function(name) {
  return (mock.getParam('delay') || mock.getParam(name + '.delay') || 0);
};

mock.init = function(params) {
  this.setParams(params);
};

mock.patchApi = require('./api').bind(null, {
  data: mock.data,
  getParam: mock.getParam,
  getDelayFor: mock.getDelayFor
});

module.exports = mock;
