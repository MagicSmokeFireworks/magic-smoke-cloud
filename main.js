
var fs = require("fs");
var contents = fs.readFileSync("show.json");
var show = JSON.parse(contents);
var contents = fs.readFileSync("data.json");
var data = JSON.parse(contents);

var express = require('express');
var app = express();

var net = require('net');

var writeToClient = function(board_id, message) {
	console.log(board_id);
	console.log(message);
	var clientIP = '';
	clientIP = data[board_id].ip;
	console.log(clientIP);
	if (clientIP === '') {
	}
	else {
		var client = new net.Socket();
		client.connect(23, clientIP, function() {
			console.log('connected to ' + board_id);
			client.write(message);
		});
	
		client.on('data', function(data) {
			console.log('data: ' + data);
			client.destroy();
		});
		client.on('close', function() {
			console.log('connection closed');
		});
	}
};

app.set('view engine', 'pug');

app.use(express.static('static'));

app.get('/status', function(req, res) {
	res.sendFile(__dirname + "/" + "status.htm");
})

app.post('/status', function(req, res) {
	for (key in data) {
		if (req.headers.id === data[key].id) {
			data[key].ip = req.ip;
			data[key].swarm = req.headers.sw_arm;
			data[key].hwarm = req.headers.hw_arm;
			data[key].rssi = req.headers.wifi_rssi;
			data[key].res[0] = req.headers.r0;
			data[key].res[1] = req.headers.r1;
			data[key].res[2] = req.headers.r2;
			data[key].res[3] = req.headers.r3;
			data[key].res[4] = req.headers.r4;
			data[key].res[5] = req.headers.r5;
			data[key].res[6] = req.headers.r6;
			data[key].res[7] = req.headers.r7;
		}
	}
	res.end();
})

app.get('/getstatus', function(req, res) {
	res.render('status',
	{
		title: 'Magic Smoke Status',
		message: 'Magic Smoke',
		data: data
	});
})

app.get('/show', function(req, res) {
	res.sendFile(__dirname + "/" + "show.htm");
})

app.get('/getshow', function(req, res) {
	res.render('show', {
		data: data,
		show: show
	});
})

app.post('/arm', function(req, res) {
	var board_id = req.query.id;
	writeToClient(board_id, 'arm');
	res.end();
});

app.post('/disarm', function(req, res) {
	console.log('disarm');
	var board_id = req.query.id;
	writeToClient(board_id, 'disarm');
	res.end();
});

app.post('/fire', function(req, res) {
	var board_id = req.query.id;
	var channels = req.query.channels;
	writeToClient(board_id, 'fire'+channels);
	res.end();
});

app.get('/', function(req, res) {
	res.render('home');
})

var server = app.listen(8080, function() {

	var host = server.address().address;
	var port = server.address().port;

	console.log("Listening at http://%s:%s", host, port);

})

