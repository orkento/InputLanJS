exports.error404 = function(request, response){
  response.writeHead(404, {'Content-Type':'text/plain'});
  response.end('404');
};