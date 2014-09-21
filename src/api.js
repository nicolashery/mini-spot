var bows = require('bows');

var api = {};

api.log = bows('Api');

api.user = {};
api.patient = {};
api.team = {};
api.patientData = {};
api.invitation = {};
api.access = {};
api.getUploadUrl = function() {};
api.metrics = {};
api.errors = {};

module.exports = api;
