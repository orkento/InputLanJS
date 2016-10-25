var http = require('http');
var server = http.createServer();
var server_config = require('./config/server.js');

function getAction(view_name, action_name){
  var controller = require('./views/' + view_name);
  return controller.action[action_name];
}

server.on('request', function(req, res){
  
  switch(req.method){
  case 'GET':
    responseToGET();
    break;
  case 'POST':
    responseToPost();
    break;
  default:
    render404();
    break;
  }
  
  function responseToGET(){
    switch(req.url){
    case '/inputlan':
      (getAction('memo.js', 'index'))(req, res);
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
  
  function render404(){
    res.writeHead(404, {'Content-Type':'text/plain'});
    res.end('404');
  }
  
});

server.listen(server_config.port, server_config.host);