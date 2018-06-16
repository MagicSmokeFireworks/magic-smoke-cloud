
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

var formidable = require('formidable');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var writeToClient = function(board_id, message) {
	console.log(board_id);
	console.log(message);
	predictions[board_id].last_cmd = message;
	var clientIP = '';
	clientIP = telemetry[board_id].ip;
	clientPort = telemetry[board_id].port;
	console.log(clientIP);
	console.log(clientPort);

	if (message.startsWith("fire")) {
		var channels = message.substring(4);
		var len = channels.length;
		for( var i = 0; i < len; i++) {
			var channel = channels[i];
			predictions[board_id].trycount[channel] = parseInt(predictions[board_id].trycount[channel]) + 1;
		}
	}

	if (clientIP === '') {
        predictions[board_id].last_cmd_status = "noip";
		console.log(board_id + ': no IP known');
		io.emit('fresh data', boardinfo, telemetry, predictions, show);
	}
	else {
		predictions[board_id].cmdrequests = parseInt(predictions[board_id].cmdrequests) + 1;
		var client = new net.Socket();
		client.connect(clientPort, clientIP, function() {
        	predictions[board_id].last_cmd_status = "conn";
			console.log(board_id + ': connected');
			client.write(message);
		});
	
		client.on('data', function(data) {
			console.log(board_id + ': data: ' + data);
			if (data == message) {
				console.log(board_id + ': command received');
        		predictions[board_id].last_cmd_status = "repeated";
			}
			client.destroy();
		});
		client.on('close', function() {
			console.log(board_id + ': connection closed');
			if (predictions[board_id].last_cmd_status == "conn") {
        		predictions[board_id].last_cmd_status = "error"; 
			}
			else if (predictions[board_id].last_cmd_status == "repeated") {
				predictions[board_id].cmdresponses = parseInt(predictions[board_id].cmdresponses) + 1;
				var last_cmd = predictions[board_id].last_cmd;
				if (last_cmd == "disarm") {
	        		predictions[board_id].swarm = 0;
				}
				else if (last_cmd == "arm") {
	        		predictions[board_id].swarm = 1;
				}
				else if(last_cmd.startsWith("fire")) {
					var channels = last_cmd.substring(4);
					var len = channels.length;
					for( var i = 0; i < len; i++) {
						var channel = channels[i];
						predictions[board_id].firecount[channel] = parseInt(predictions[board_id].firecount[channel]) + 1;
					}
				}
			}
			io.emit('fresh data', boardinfo, telemetry, predictions, show);
		});
		client.on('error', function(err) {
			console.log(board_id + ': error: ' + err.message);
        	predictions[board_id].last_cmd_status = "error"; 
		});
	}
};

var get_cmdstatus = function(board) {
	var cmdcount = telemetry[board].cmdcount;
	var cmdcount_predict = predictions[board].cmdresponses;
	var cmdstatus = "no data";
	var cmdstatus_status = "error_status";
	if (cmdcount != "no data") {
		if (cmdcount == cmdcount_predict) {
			cmdstatus = "good";
			cmdstatus_status = "normal_status";
		}
		else {
			cmdstatus = (cmdcount_predict - cmdcount) + " Lost";
			cmdstatus_status = "warning_status";
		}
	}
	return [cmdstatus, cmdstatus_status];
};

var get_channelstatus = function(board, channel) {
	var channelstatus = "no data";
	var channelstatus_status = "error_status";
	if (show.boards[board].channels[channel].group != "") {
		if (telemetry[board].firecount[channel] == 'no data') {
			channelstatus = "no data";
			channelstatus_status = "error_status";
		}
		else if (telemetry[board].firecount[channel] == 0) {
			if (telemetry[board].res[channel] > 2500) {
				channelstatus = "no match?";
				channelstatus_status = "warning_status";
			}
			else if (telemetry[board].res[channel] < 800) {
				channelstatus = "low imp match?";
				channelstatus_status = "warning_status";
			}
			else {
				channelstatus = "good match imp";
				channelstatus_status = "good_status";
			}
		}
		else {
			if (telemetry[board].res[channel] > 2500) {
				channelstatus = "fired";
				channelstatus_status = "normal_status";
			}
			else {
				channelstatus = "fired. low imp?";
				channelstatus_status = "warning_status";
			}
		}
	}
	else {
		channelstatus = "no config";
		channelstatus_status = "normal_status";
	}
	return [channelstatus, channelstatus_status];
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
	res.render('status',
	{
		boardinfo: boardinfo,
		show: show,
		telemetry: telemetry,
		predictions: predictions,
		get_cmdstatus: get_cmdstatus,
		get_channelstatus: get_channelstatus
	});
})

var timeouts = {};
for (board in boardinfo) {
	timeouts[board] = 0.0;
}

var timeoutInterval = setInterval(function() {
	for (board in boardinfo) {
		timeouts[board] = timeouts[board] + 0.1;
		if (timeouts[board] > 4.0) {
			if (telemetry[board].connection == "active") {
				telemetry[board].connection = "inactive";
				io.emit('fresh data', boardinfo, telemetry, predictions, show);
			}
		}
	}
}, 100);

var show_clock = 0;
var clock_running = false;
var tickingClock = setInterval(function() {
	if (clock_running == true) {
		show_clock = show_clock + 0.1;
		for (var i = 0; i < show.groups.length; i++) {
			var group_time = parseFloat(show.groups[i].time);
			if (group_time > (show_clock - 0.09)) {
				if (group_time < (show_clock + 0.09)) {
					// fire group
					var group_id = show.groups[i].id;
					for(board_id in show.boards) {
						var chch = "";
						for(channel in show.boards[board_id].channels) {
							if( show.boards[board_id].channels[channel].group == group_id ) {
								chch = chch + channel;
							}
						}
						if (chch != "") {
							writeToClient(board_id, 'fire'+chch);
						}
					}
				}
			}
		}
		io.emit('tick clock', show_clock.toFixed(1), false);
	}
	else {
		//io.emit('tick clock', show_clock.toFixed(1), true);
	}
}, 100);

app.post('/startclock', function(req, res) {
	clock_running = true;
	res.end();
	console.log('starting clock');
});

app.post('/stopclock', function(req, res) {
	clock_running = false;
	res.end();
	console.log('stopping clock');
});

app.post('/clockplus', function(req, res) {
	show_clock = show_clock + 0.1;
	res.end();
	io.emit('tick clock', show_clock.toFixed(1), true);
});

app.post('/clockminus', function(req, res) {
	show_clock = show_clock - 0.1;
	if (show_clock < 0) {
		show_clock = 0;
	}
	res.end();
	io.emit('tick clock', show_clock.toFixed(1), true);
});

app.post('/status', function(req, res) {
	var sname = "";
	for (key in boardinfo) {
		if (req.headers.id === boardinfo[key].id) {
			sname = key;
		}
	}
	if (sname === "") {
		console.log("Unknown board id sending status packet: " + req.headers.id);
		res.end();
	}
	else {
		timeouts[sname] = 0;
		telemetry[sname].connection = "active";
		telemetry[sname].ip = req.ip;
		if ('port' in req.headers) {
			telemetry[sname].port = req.headers.port;
		}
		else {
			telemetry[sname].port = 23;
		}
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
		io.emit('fresh data', boardinfo, telemetry, predictions, show);
	}
})

app.get('/board/:boardid', function(req, res) {
	res.render('board',
	{
		boardid: req.params.boardid,
		boardinfo: boardinfo,
		show: show,
		telemetry: telemetry,
		predictions: predictions,
		get_cmdstatus: get_cmdstatus,
		get_channelstatus: get_channelstatus
	});
})

app.get('/configgroups', function(req, res) {
	res.render('configgroups',
	{
		boardinfo: boardinfo,
		show: show
	});
});

var splice_group = function(id, time, desc) {
	var insert_index = show.groups.length;
	for (var i = 0; i < show.groups.length; i++) {
		if (parseFloat(show.groups[i].time) > parseFloat(time)) {
			insert_index = i;
			break;
		}
	}
	var fixedtime = parseFloat(time).toFixed(1);
	show.groups.splice(insert_index, 0, {"id": id, "time": fixedtime, "desc": desc});
};

var get_unique_id = function() {
	var id = Math.floor(Math.random() * 1000000);
	for (var i = 0; i < show.groups.length; i++) {
		var group_id = parseInt(show.groups[i].id);
		if (id == group_id) {
			return get_unique_id();
		}
	}
	return id;
};

var add_group = function(time, desc) {
	var new_id = get_unique_id();
	splice_group(new_id, time, desc);
};

var delete_group = function(id) {
	for (var i = 0; i < show.groups.length; i++) {
		if (show.groups[i].id == id) {
			show.groups.splice(i,1);
			break;
		}
	}
};

app.post('/configgroups', function(req, res) {
	var time = req.body["time"];
	var desc = req.body["group_desc"];
	add_group(time, desc);
	var json = JSON.stringify(show);
	fs.writeFile('show.json', json, 'utf8');
	res.redirect('/configgroups');
});

app.post('/configgroupssave', function(req, res) {
	var group_id = req.query.id;
	var group_time = req.query.time;
	var group_desc = req.query.desc;
	res.end();

	delete_group(group_id);
	splice_group(group_id, group_time, group_desc);
	var json = JSON.stringify(show);
	fs.writeFile('show.json', json, 'utf8');
});

app.post('/configgroupsdelete', function(req, res) {
	var group_id = req.query.id;
	res.end();
	delete_group(group_id);
	var json = JSON.stringify(show);
	fs.writeFile('show.json', json, 'utf8');
});

app.get('/configboards/:boardid', function(req, res) {
	res.render('configboards',
	{
		boardid: req.params.boardid,
		boardinfo: boardinfo,
		show: show
	});
})

app.post('/configboards/:boardid', function(req, res) {
	var boardid = req.params.boardid;
	show.boards[boardid].location = req.body.location;
	for(var i = 0; i < 8; i++) {
		show.boards[boardid].channels[i].group = req.body["group[]"][i];
		show.boards[boardid].channels[i].effect = req.body["effect[]"][i];
	}
	var json = JSON.stringify(show);
	fs.writeFile('show.json', json, 'utf8');
	res.redirect('/configboards/'+boardid);
})

app.get('/show', function(req, res) {
	res.render('show', {
		boardinfo: boardinfo,
		show: show,
		show_clock: show_clock.toFixed(1),
		telemetry: telemetry,
		predictions: predictions
	});
})

app.post('/arm', function(req, res) {
	var board_id = req.query.id;
	res.end();

	writeToClient(board_id, 'arm');
});

app.post('/armall', function(req, res) {
    for(board in boardinfo) {
        writeToClient(board, 'arm');
    }
    res.end();

});

app.post('/disarm', function(req, res) {
	console.log('disarm');
	var board_id = req.query.id;
	res.end();

	writeToClient(board_id, 'disarm');
});

app.post('/identify', function(req, res) {
	console.log('identify');
	var board_id = req.query.id;
	res.end();

	writeToClient(board_id, 'identify');
});

app.post('/disarmall', function(req, res) {
    for(board in boardinfo) {
        writeToClient(board, 'disarm');
    }
    res.end();
});

app.post('/fire', function(req, res) {
	var board_id = req.query.id;
	var channels = req.query.channels;
	res.end();

	writeToClient(board_id, 'fire'+channels);
});

app.post('/firegroup', function(req, res) {
    var group_id = req.query.groupid;
	for(board_id in show.boards) {
		var chch = "";
		for(channel in show.boards[board_id].channels) {
			if( show.boards[board_id].channels[channel].group == group_id ) {
				chch = chch + channel;
			}
		}
		if (chch != "") {
        	writeToClient(board_id, 'fire'+chch);
		}
    }
    res.end();
});

app.post('/jumptogroup', function(req, res) {
	var group_time = req.query.grouptime;
	show_clock = parseFloat(group_time)-0.1;
	io.emit('tick clock', show_clock.toFixed(1), true);
	res.end();
});

app.get('/', function(req, res) {
	res.render('home',
	{
		boardinfo: boardinfo
	});
});

app.post('/showupload', function(req, res) {
	var form = formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
		console.log(files.filetoupload.path);
		var oldpath = files.filetoupload.path;
		var newpath = 'show.json';
		fs.rename(oldpath, newpath, function (err) {
			if (err) throw err;
			var contents = fs.readFileSync("show.json");
			show = JSON.parse(contents);
			res.redirect('/');
		});
	});
});

app.get('/downloadshow', function(req, res) {
	console.log('download show');
	var file = 'show.json';
	res.download(file);
});

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


