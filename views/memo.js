exports.action = {
  'index': index,
  'show': show,
  'create': create,
  'edit': edit
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
  var layout = require('../modules/layout.js');
  
  var page_layout_preparation = new Promise(function(resolve, reject){
    layout.load('pages/show', function(error, data){
      if(error) reject('no page layout');
      else      resolve(data);
    });
  });
  
  var memo_layout_preparation = new Promise(function(resolve, reject){
    layout.load('parts/show/memo', function(error, data){
      if(error) reject('no memo layout');
      else      resolve(data);
    });
  });
  
  var memo_data_preparation = new Promise(function(resolve, reject){
    var today      = new Date();
    var yesterday  = new Date();
    var last_week  = new Date();
    var last_month = new Date();
    var last_year  = new Date();
    
    yesterday.setDate(today.getDate() - 1);
    last_week.setDate(today.getDate() - 7);
    last_month.setMonth(today.getMonth() - 1);
    last_year.setFullYear(today.getFullYear() - 1);
    
    today      = getDateString(today);
    yesterday  = getDateString(yesterday);
    last_week  = getDateString(last_week);
    last_month = getDateString(last_month);
    last_year  = getDateString(last_year);
    
    var dates = [today, yesterday, last_week, last_month, last_year];
    var query = 'select comment, start_on from memo where '
              + 'start_on in(?, ?, ?, ?, ?)';
              
    var db = require('../modules/db.js');
    db = db.getDatabase();
    db.all(query, dates, function(error, rows){
      if(error){
        reject('database error');
      }
      else{
        resolve(rows);
      }
      db.close();
    });
  });
  
  var preparations = [
    page_layout_preparation,
    memo_layout_preparation,
    memo_data_preparation
  ];
  
  var success_response = function(results){
    var memo_list = '';
    var page = results[0];
    var memo = results[1];
    var memo_datas = results[2];
    
    for(var i = 0; i < memo_datas.length; ++i){
      memo_list += memo.replace('<!-- start_on -->', memo_datas[i].start_on)
                       .replace('<!-- comment -->',  memo_datas[i].comment);
    }
    response.writeHead(200, {'Content-Type':'text/html'});
    response.write(page.replace('<!-- MEMO_LIST -->', memo_list));
    response.end();
  };
  
  var fail_response = function(reason){
    response.writeHead(404, {'Content-Type':'text/plain'});
    return response.end(reason);
  };
  
  Promise.all(preparations).then(success_response, fail_response);
}

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
}

function edit(request, response){
  
  var page_layout_preparation = new Promise(function(resolve, reject){
    var layout = require('../modules/layout.js');
    layout.load('pages/edit', function(error, data){
      if(error) reject('no layout');
      else      resolve(data);
    });
  });
  
  var memo_data_preparation = new Promise(function(resolve, reject){
    var url = require(url);
    url = url.parse(req.url, true);
    
    var id = url.query['id'];
    
    var db = require('../modules/db.js');
    db = getDatabase();
    
    db.serialize(function(){
      var query = 'select id, comment, start_on from memo where id = ?';
      db.get(query, [id], function(error, data){
        if(error) reject('no data');
        else      resolve(data);
      });
    });
  });
  
  var preparations = [
    page_layout_preparation,
    memo_data_preparation
  ];
  
  var success_response = function(results){
    var memo = results[1];
    var page = results[0]
               .replace('<!-- id -->',       memo['id'])
               .replace('<!-- comment -->',  memo['comment'])
               .replace('<!-- start_on -->', memo['start_on']);
    response.writeHead(200, {'Content-Type':'text/html'});
    return response.end(page);
  };
  
  var fail_response = function(reason){
    response.writeHead(404, {'Content-Type':'text/plain'});
    return response.end(reason);
  };
  
  Promise.all(preparations).then(success_response, fail_response);
}

function getDateString(date){
  var mm = date.getMonth() + 1;
  var dd = date.getDate();
  return ''
       + date.getFullYear()
       + '-' + ((mm >= 10) ? mm : ('0' + mm))
       + '-' + ((dd >= 10) ? dd : ('0' + dd));
}