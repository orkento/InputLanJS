var http = require('http');
var server = http.createServer();
var server_config = require('./config/server.js');

function getAction(view_name, action_name){
  var controller = require('./views/' + view_name);
  return controller.action[action_name];
}

server.on('request', function(req, res){
  
  console.log(req.method.toLowerCase());
  switch(req.method.toLowerCase()){
  case 'get':
    responseToGET();
    break;
  case 'post':
    responseToPost();
    break;
  case 'put':
    responseToPut();
    break;
  default:
    render404();
    break;
  }
  
  function responseToGET(){
    var url = require('url');
    url = url.parse(req.url, true);
    switch(url.pathname){
    case '/inputlan':
      (getAction('memo.js', 'show'))(req, res);
      break;
    case '/index.html':
      (getAction('memo.js', 'index'))(req, res);
      break;
    case '/edit':
      (getAction('memo.js', 'edit'))(req, res);
      break;
    default:
      render404();
      break;
    }
  }
  
  function responseToPost(){
    switch(req.url){
    case '/memo':
      (getAction('memo.js', 'create'))(req, res);
      break;
    default:
      render404();
      break;
    }
  }
  
  function responseToPut(){
    switch(req.url){
    case '/update':
      (getAction('memo.js', 'update'))(req, res);
      break;
    default:
      render404();
    }
  }
  
  function render404(){
    res.writeHead(404, {'Content-Type':'text/plain'});
    res.end('404');
  }
  
});

server.listen(server_config.port, server_config.host);