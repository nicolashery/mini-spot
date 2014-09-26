var m = require('mori');
var generateRandomId = require('./generateRandomId');

module.exports = {
  create: function() {
   return m.hash_map(
     'id', generateRandomId(6),
     'status', 'pending'
   );
  }
};
