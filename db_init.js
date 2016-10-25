var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('./db/inputlan.sqlite3');

db.run('create table memo(id integer primary key, comment text, start_on text)');