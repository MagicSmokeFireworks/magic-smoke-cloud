
var fs = require("fs");
var contents = fs.readFileSync("show.json");
var show = JSON.parse(contents);
var contents = fs.readFileSync("boardinfo.json");
var boardinfo = JSON.parse(contents);
var contents = fs.readFileSync("telemetry.json");
var telemetry = JSON.parse(contents);
var contents = fs.readFileSync("predictions.json");
var predictions = JSON.parse(contents);

var express = require('express');
var app = express();

var net = require('net');

var http = require('http').Server(app);
var io = require('socket.io')(http);

var writeToClient = function(board_id, message) {
	console.log(board_id);
	console.log(message);
	var clientIP = '';
	clientIP = telemetry[board_id].ip;
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

io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
});

app.set('view engine', 'pug');

app.use(express.static('static'));

app.get('/status', function(req, res) {
	res.render('statustable',
	{
		boardinfo: boardinfo,
		show: show,
		telemetry: telemetry,
		predictions: predictions
	});
})

app.post('/status', function(req, res) {
	var sname = "";
	for (key in boardinfo) {
		if (req.headers.id === boardinfo[key].id) {
			sname = key;
		}
	}
	telemetry[sname].ip = req.ip;
	telemetry[sname].firmver = req.headers.fver;
	telemetry[sname].swarm = req.headers.sw_arm;
	telemetry[sname].hwarm = req.headers.hw_arm;
	telemetry[sname].rssi = req.headers.wifi_rssi;
	telemetry[sname].res[0] = req.headers.r0;
	telemetry[sname].res[1] = req.headers.r1;
	telemetry[sname].res[2] = req.headers.r2;
	telemetry[sname].res[3] = req.headers.r3;
	telemetry[sname].res[4] = req.headers.r4;
	telemetry[sname].res[5] = req.headers.r5;
	telemetry[sname].res[6] = req.headers.r6;
	telemetry[sname].res[7] = req.headers.r7;
	telemetry[sname].firecount[0] = req.headers.fc0;
	telemetry[sname].firecount[1] = req.headers.fc1;
	telemetry[sname].firecount[2] = req.headers.fc2;
	telemetry[sname].firecount[3] = req.headers.fc3;
	telemetry[sname].firecount[4] = req.headers.fc4;
	telemetry[sname].firecount[5] = req.headers.fc5;
	telemetry[sname].firecount[6] = req.headers.fc6;
	telemetry[sname].firecount[7] = req.headers.fc7;
	telemetry[sname].cmdcount = req.headers.cc;
	res.end();
	io.emit('fresh data', sname, telemetry[sname]);
})

app.get('/getstatus', function(req, res) {
	res.render('statustable',
	{
		boardinfo: boardinfo,
		telemetry: telemetry,
		predictions: predictions
	});
})

app.get('/board/:boardid', function(req, res) {
	res.render('board',
	{
		boardid: req.params.boardid,
		boardinfo: boardinfo,
		show: show,
		telemetry: telemetry,
		predictions: predictions
	});
})

app.get('/show', function(req, res) {
	res.render('show', {
		boardinfo: boardinfo,
		show: show,
		telemetry: telemetry,
		predictions: predictions
	});
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

	predictions[board_id].swarm = 1;
	predictions[board_id].cmdcount = parseInt(predictions[board_id].cmdcount) + 1;
	io.emit('fresh predicts', board_id, predictions[board_id]);
});

app.post('/armall', function(req, res) {
    for(board in boardinfo) {
        writeToClient(board, 'arm');
        predictions[board].swarm = 1;
        predictions[board].cmdcount = parseInt(predictions[board].cmdcount) + 1;
        io.emit('fresh predicts', board, predictions[board]);
    }
    res.end();

});

app.post('/disarm', function(req, res) {
	console.log('disarm');
	var board_id = req.query.id;
	writeToClient(board_id, 'disarm');
	res.end();

	predictions[board_id].swarm = 0;
	predictions[board_id].cmdcount = parseInt(predictions[board_id].cmdcount) + 1;
	io.emit('fresh predicts', board_id, predictions[board_id]);
});

app.post('/identify', function(req, res) {
	console.log('identify');
	var board_id = req.query.id;
	writeToClient(board_id, 'identify');
	res.end();

	predictions[board_id].cmdcount = parseInt(predictions[board_id].cmdcount) + 1;
	io.emit('fresh predicts', board_id, predictions[board_id]);
});

app.post('/disarmall', function(req, res) {
    for(board in boardinfo) {
        writeToClient(board, 'disarm');
        predictions[board].swarm = 0;
        predictions[board].cmdcount = parseInt(predictions[board].cmdcount) + 1;
        io.emit('fresh predicts', board, predictions[board]);
    }
    res.end();
});

app.post('/fire', function(req, res) {
	var board_id = req.query.id;
	var channels = req.query.channels;
	writeToClient(board_id, 'fire'+channels);
	res.end();

	var len = channels.length;
	for( var i = 0; i < len; i++) {
		var channel = channels[i];
		predictions[board_id].firecount[channel] = parseInt(predictions[board_id].firecount[channel]) + 1;
	}
	predictions[board_id].cmdcount = parseInt(predictions[board_id].cmdcount) + 1;
	io.emit('fresh predicts', board_id, predictions[board_id]);
});

app.post('/firegroup', function(req, res) {
    var group_id = req.query.groupid;
    var to_fire = {};
    for(channel in show.groups[group_id].channels) {
        var chid = show.groups[group_id].channels[channel].id;
        var chch = show.groups[group_id].channels[channel].channel;
        if(String(to_fire[chid]) === 'undefined') {
            to_fire[chid] = chch;
        }
        else {
            to_fire[chid] = to_fire[chid] + chch;
        }
    }
    for(board_id in to_fire) {
        writeToClient(board_id, 'fire'+to_fire[board_id]);
	var len = to_fire[board_id].length;
	for( var i = 0; i < len; i++) {
		var channel = to_fire[board_id][i];
		predictions[board_id].firecount[channel] = parseInt(predictions[board_id].firecount[channel]) + 1;
	}
	predictions[board_id].cmdcount = parseInt(predictions[board_id].cmdcount) + 1;
	io.emit('fresh predicts', board_id, predictions[board_id]);
    }
    res.end();
});

app.get('/', function(req, res) {
	res.render('home');
})

//var server = app.listen(8080, function() {
//
//	var host = server.address().address;
//	var port = server.address().port;
//
//	console.log("Listening at http://%s:%s", host, port);
//
//})

http.listen(8080, function(){
	console.log("Listening on *:8080");
});


