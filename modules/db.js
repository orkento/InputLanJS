exports.getDatabase = function(){
  var sqlite3 = require('sqlite3');
  return new sqlite3.Database('./db/inputlan.sqlite3');
};