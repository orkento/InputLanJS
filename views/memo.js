exports.action = {
  'index': index,
  'show': show,
  'create': create
};

function index(request, response){
  var fs = require('fs');
  fs.readFile(__dirname + '/index.html.ejs', 'utf-8', function(err, data){
    if(err){
    }
    else{
      var memos = '';
      var db = require('../modules/db.js');
      db = db.getDatabase();
      
      var query = 'select id, comment, start_on from memo';
      db.all(query, [], function(err, rows){
        for(var i = 0; i < rows.length; ++i){
          memos += '<p>'
                 + '<table><tr>'
                 + '<td>' + rows[i].start_on + '</td>'
                 + '<td><a href="/memo/edit?id=' + rows[i].id + '">編集</a></td>'
                 + '</tr></table>'
                 + '<pre>' + rows[i].comment + '</pre>'
                 + '</p>';
        }
        response.writeHead(200, {'Content-Type':'text/html'});
        response.write(data.replace('<!-- MEMO_LIST -->', memos));
        response.end();
        db.close();
      });
    }
  });
}

function show(request, response){
  var fs = require('fs');
  fs.readFile(__dirname + '/show.html.ejs', 'utf-8', function(err, data){
    if(err){
      var errors = require('./error.js');
      errors.error404(request, response);
    }
    else{
      var memos = '';

      var today = new Date();
      var yesterday = new Date();
      var last_week = new Date();
      var last_month = new Date();
      var last_year = new Date();
      
      yesterday.setDate(today.getDate() - 1);
      last_week.setDate(today.getDate() - 7);
      last_month.setMonth(today.getMonth() - 1);
      last_year.setFullYear(today.getFullYear() - 1);
      
      today      = getDateString(today);
      yesterday  = getDateString(yesterday);
      last_week  = getDateString(last_week);
      last_month = getDateString(last_month);
      last_year  = getDateString(last_year);
      
      var sqlite3 = require('sqlite3');
      var db = new sqlite3.Database('./db/inputlan.sqlite3');
      var dates = [today, yesterday, last_week, last_month, last_year];
      var query = 'select comment, start_on from memo where '
                + 'start_on in(?, ?, ?, ?, ?)';
                
      db.all(query, dates, function(err, rows){
        for(var i = 0; i < rows.length; ++i){
          memos += '<p>'
                 + '<p>' + rows[i].start_on + '</p>'
                 + '<pre>' + rows[i].comment + '</pre>'
                 + '</p>';
        }
        response.writeHead(200, {'Content-Type':'text/html'});
        response.write(data.replace('<!-- MEMO_LIST -->', memos));
        response.end();
        db.close();
      });
    }
  });
};

function create(request, response){
  var qs = require('querystring');
  
  var body = '';
  request.on('data', function(data){
    body += data;
  });
  
  request.on('end', function(){
    var post = qs.parse(body);
    var comment = post['memo[comment]'];
    var date = post['memo[date]'];
    date = new Date(date);
    date = getDateString(date);
    
    var sqlite3 = require('sqlite3');
    var db = new sqlite3.Database('./db/inputlan.sqlite3');
    
    db.serialize(function(){
      var query = 'insert into memo(comment, start_on) '
                + 'values(?, ?)';
      db.run(query, [comment, date], function(){
        db.close();
        response.writeHead(301, {Location: '/inputlan'});
        response.end();
      });
    });    
  });
};

function getDateString(date){
  var mm = date.getMonth() + 1;
  var dd = date.getDate();
  return ''
       + date.getFullYear()
       + '-' + ((mm >= 10) ? mm : ('0' + mm))
       + '-' + ((dd >= 10) ? dd : ('0' + dd));
}