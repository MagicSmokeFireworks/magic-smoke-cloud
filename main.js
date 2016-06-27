
var express = require('express');
var app = express();

app.set('view engine', 'pug');

app.use(express.static('static'));

app.get('/status', function(req, res) {
	res.sendFile(__dirname + "/" + "status.htm");
})

app.get('/getstatus', function(req, res) {
	res.render('status', { title: 'Random!', message: Math.random().toString() });
})

app.get('/', function(req, res) {
	res.send('Hello World');
})

var server = app.listen(8081, function() {

	var host = server.address().address;
	var port = server.address().port;

	console.log("Listening at http://%s:%s", host, port);

})

