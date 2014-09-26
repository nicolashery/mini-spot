// http://pragmatic-coding.blogspot.ca/2012/01/javascript-pseudo-random-id-generator.html
module.exports = function generateRandomId(length) {
  var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  var returnValue = '';
  var x, i;

  for (x = 0; x < length; x += 1) {
    i = Math.floor(Math.random() * 62);
    returnValue += chars.charAt(i);
  }

  return returnValue;
};
