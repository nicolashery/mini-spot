var utils = require('./utils');

var personUtils = {};

personUtils.fullName = function(person) {
  return utils.getIn(person, ['profile', 'fullName']);
};

personUtils.patientInfo = function(person) {
  return utils.getIn(person, ['profile', 'patient']);
};

personUtils.isPatient = function(person) {
  return Boolean(personUtils.patientInfo(person));
};

personUtils.patientFullName = function(person) {
  var profile = utils.getIn(person, ['profile'], {});
  var patientInfo = profile.patient || {};

  if (patientInfo.isOtherPerson) {
    return patientInfo.fullName;
  }

  return profile.fullName;
};

personUtils.patientIsOtherPerson = function(person) {
  return Boolean(utils.getIn(person, ['profile', 'patient', 'isOtherPerson']));
};

personUtils.isOnlyCareGiver = function(person) {
  return Boolean(utils.getIn(person, ['profile', 'isOnlyCareGiver']));
};

personUtils.isSame = function(first, second) {
  first = first || {};
  second = second || {};

  if (!(first.userid && second.userid)) {
    return false;
  }

  return (first.userid === second.userid);
};

module.exports = personUtils;
