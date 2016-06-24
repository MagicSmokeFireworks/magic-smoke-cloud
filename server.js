
var http = require('http');

var myStatus = 'no data';

http.createServer(function(request, response) {
  request.on('error', function(err) {
    console.error(err);
    response.statusCode = 400;
    response.end();
  });
  response.on('error', function(err) {
    console.error(err);
  });
  if (request.method === 'POST' && request.url === '/status') {
    var body = [];
    request.on('data', function(chunk) {
      body.push(chunk);
    }).on('end', function() {
      body = Buffer.concat(body).toString();
      myStatus = body;
      response.end();
    })
  } else if (request.method === 'GET' && request.url === '/status') {
    var body = [];
    request.on('data', function(chunk) {
      body.push(chunk);
    }).on('end', function() {
      body = Buffer.concat(body).toString();
      response.end(myStatus);
    })
  } else {
    response.statusCode = 404;
    response.end();
  }
}).listen(8080);

