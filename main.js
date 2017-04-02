
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
			data[key].firmver = req.headers.fver;
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
			data[key].firecount[0] = req.headers.fc0;
			data[key].firecount[1] = req.headers.fc1;
			data[key].firecount[2] = req.headers.fc2;
			data[key].firecount[3] = req.headers.fc3;
			data[key].firecount[4] = req.headers.fc4;
			data[key].firecount[5] = req.headers.fc5;
			data[key].firecount[6] = req.headers.fc6;
			data[key].firecount[7] = req.headers.fc7;
			data[key].statusTime = Date.now();
		}
	}
	res.end();
})

app.get('/getstatus', function(req, res) {
	res.render('status',
	{
		title: 'Magic Smoke Status',
		message: 'Magic Smoke',
		serverTime: Date.now(),
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

app.post('/armall', function(req, res) {
    for(board_id in data) {
        writeToClient(data[board_id].refid, 'arm');
    }
    res.end();
});

app.post('/disarm', function(req, res) {
	console.log('disarm');
	var board_id = req.query.id;
	writeToClient(board_id, 'disarm');
	res.end();
});

app.post('/disarmall', function(req, res) {
    for(board_id in data) {
        writeToClient(data[board_id].refid, 'disarm');
    }
    res.end();
});

app.post('/fire', function(req, res) {
	var board_id = req.query.id;
	var channels = req.query.channels;
	writeToClient(board_id, 'fire'+channels);
	res.end();
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
    }
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

