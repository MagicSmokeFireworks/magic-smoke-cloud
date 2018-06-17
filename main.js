
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

var db = null;
var eventlog = null;

var log_event = function(event_doc) {
	event_doc["time"] = Date.now();
	eventlog.insertOne(event_doc, function(err, r) {
		assert.equal(null, err);
		assert.equal(1, r.insertedCount);
	});
};

var log_generic_event = function(eventstr) {
	log_event({"event": eventstr});
};

var log_clock_event = function(clock_event) {
	log_event({"event": "clock", "clock_event": clock_event, "clock_value": show_clock});
};

var log_unknown_status_event = function(unknown_board_id) {
	log_event({"event": "unknown_id", "board_id": unknown_board_id});
};

var log_telemetry_event = function(board_id, sname, telemetry) {
	// shallow copy of board telemetry
	var eventdoc = Object.assign({}, telemetry);
	eventdoc["event"] = "telemetry";
	eventdoc["board_id"] = board_id;
	eventdoc["sname"] = sname;
	log_event(eventdoc);
};

var log_show_fire_group_event = function(group_time, group_id) {
	log_event({"event": "show_firing_group", "group_time": group_time, "group_id": group_id});
};

var log_show_fire_board_event = function(group_time, group_id, board_id, channels) {
	log_event({"event": "show_firing_board", "group_time": group_time, "group_id": group_id, "board_id": board_id, "channels": channels});
};

var log_man_fire_group_event = function(group_id) {
	log_event({"event": "man_firing_group", "group_id": group_id});
};

var log_man_group_fire_board_event = function(group_id, board_id, channels) {
	log_event({"event": "man_group_firing_board", "group_id": group_id, "board_id": board_id, "channels": channels});
};

var log_man_fire_event = function(board_id, channels) {
	log_event({"event": "man_fire", "board_id": board_id, "channels": channels});
};

var log_man_board_event = function(eventstr, board_id) {
	log_event({"event": eventstr, "board_id": board_id});
};

var log_command_event = function(conn_event, board_id, message, data, cmdnum) {
	log_event({"event": "command", "conn_event": conn_event, "board_id": board_id, "message": message, "data": data, "cmdnum": cmdnum});
};



var populate_resistance_predictions = function() {
	for (boardid in show.boards) {
		for(var i = 0; i < 8; i++) {
			if (show.boards[boardid].channels[i].group != "") {
				predictions[boardid].res[i] = "match";
			}
			else {
				predictions[boardid].res[i] = "open";
			}
		}
	}
};
populate_resistance_predictions();

var commandnum = 0;

var writeToClient = function(board_id, message) {
	console.log(board_id);
	console.log(message);
	predictions[board_id].last_cmd = message;
	var clientIP = '';
	clientIP = telemetry[board_id].ip;
	clientPort = telemetry[board_id].port;

	commandnum += 1;
	var thiscmdnum = commandnum;

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
		log_command_event("no_ip", board_id, message, "", thiscmdnum);
		io.emit('fresh data', boardinfo, telemetry, predictions, show);
	}
	else {
		predictions[board_id].cmdrequests = parseInt(predictions[board_id].cmdrequests) + 1;
		var client = new net.Socket();
		client.connect(clientPort, clientIP, function() {
        	predictions[board_id].last_cmd_status = "conn";
			console.log(board_id + ': connected');
			log_command_event("connected", board_id, message, "", thiscmdnum);
			client.write(message);
		});
	
		client.on('data', function(data) {
			console.log(board_id + ': data: ' + data);
			log_command_event("data", board_id, message, data.toString(), thiscmdnum);
			if (data == message) {
				console.log(board_id + ': command received');
        		predictions[board_id].last_cmd_status = "repeated";
			}
			client.destroy();
		});
		client.on('close', function() {
			console.log(board_id + ': connection closed');
			log_command_event("disconnected", board_id, message, "", thiscmdnum);
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
						predictions[board_id].res[channel] = "open";
					}
				}
			}
			io.emit('fresh data', boardinfo, telemetry, predictions, show);
		});
		client.on('error', function(err) {
			console.log(board_id + ': error: ' + err.message);
			log_command_event("error", board_id, message, err.message, thiscmdnum);
        	predictions[board_id].last_cmd_status = "error"; 
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
	res.render('status',
	{
		boardinfo: boardinfo,
		show: show,
		telemetry: telemetry,
		predictions: predictions
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
					// log show firing this group
					log_show_fire_group_event(group_time, group_id);
					for(board_id in show.boards) {
						var chch = "";
						for(channel in show.boards[board_id].channels) {
							if( show.boards[board_id].channels[channel].group == group_id ) {
								chch = chch + channel;
							}
						}
						if (chch != "") {
							// log show firing this board
							log_show_fire_board_event(group_time, group_id, board_id, chch);
							writeToClient(board_id, 'fire'+chch);
						}
					}
				}
			}
		}
		io.emit('tick clock', show_clock.toFixed(1), false);
		log_clock_event("tick");
	}
}, 100);

app.post('/startclock', function(req, res) {
	clock_running = true;
	res.end();
	console.log('starting clock');
	log_clock_event("start");
});

app.post('/stopclock', function(req, res) {
	clock_running = false;
	res.end();
	console.log('stopping clock');
	log_clock_event("stop");
});

app.post('/clockplus', function(req, res) {
	show_clock = show_clock + 0.1;
	res.end();
	io.emit('tick clock', show_clock.toFixed(1), true);
	log_clock_event("plus");
});

app.post('/clockminus', function(req, res) {
	show_clock = show_clock - 0.1;
	if (show_clock < 0) {
		show_clock = 0;
	}
	res.end();
	io.emit('tick clock', show_clock.toFixed(1), true);
	log_clock_event("minus");
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
		log_unknown_status_event(req.headers.id);
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
		log_telemetry_event(req.headers.id, sname, telemetry[sname]);
	}
});

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
	io.emit('fresh data', boardinfo, telemetry, predictions, show);
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
	io.emit('fresh data', boardinfo, telemetry, predictions, show);
});

app.post('/configgroupsdelete', function(req, res) {
	var group_id = req.query.id;
	res.end();
	delete_group(group_id);
	var json = JSON.stringify(show);
	fs.writeFile('show.json', json, 'utf8');
	io.emit('fresh data', boardinfo, telemetry, predictions, show);
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
		if (show.boards[boardid].channels[i].group != "") {
			predictions[boardid].res[i] = "match";
		}
		else {
			predictions[boardid].res[i] = "open";
		}
		show.boards[boardid].channels[i].effect = req.body["effect[]"][i];
	}
	var json = JSON.stringify(show);
	fs.writeFile('show.json', json, 'utf8');
	res.redirect('/configboards/'+boardid);
	io.emit('fresh data', boardinfo, telemetry, predictions, show);
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

	// log manual arm board
	log_man_board_event("man_arm", board_id);
	writeToClient(board_id, 'arm');
});

app.post('/armall', function(req, res) {
	// log manual arm all
	log_generic_event("manual_arm_all");
    for(board in boardinfo) {
		log_man_board_event("man_arm", board);
        writeToClient(board, 'arm');
    }
    res.end();

});

app.post('/disarm', function(req, res) {
	var board_id = req.query.id;
	res.end();

	// log manual disarm board
	log_man_board_event("man_disarm", board_id);
	writeToClient(board_id, 'disarm');
});

app.post('/disarmall', function(req, res) {
	// log manual disarm all
	log_generic_event("manual_disarm_all");
    for(board in boardinfo) {
		log_man_board_event("man_disarm", board);
        writeToClient(board, 'disarm');
    }
    res.end();
});

app.post('/identify', function(req, res) {
	var board_id = req.query.id;
	res.end();

	log_man_board_event("man_identify", board_id);
	writeToClient(board_id, 'identify');
});

app.post('/fire', function(req, res) {
	var board_id = req.query.id;
	var channels = req.query.channels;
	res.end();

	// log manual fire board channels
	log_man_fire_event("man_fire", board_id, channels);
	writeToClient(board_id, 'fire'+channels);
});

app.post('/firegroup', function(req, res) {
	// log manual fire group
    var group_id = req.query.groupid;
	log_man_fire_group_event(group_id);
	for(board_id in show.boards) {
		var chch = "";
		for(channel in show.boards[board_id].channels) {
			if( show.boards[board_id].channels[channel].group == group_id ) {
				chch = chch + channel;
			}
		}
		if (chch != "") {
			// log manual group fire board channels
			log_man_group_fire_board_event(group_id, board_id, chch);
        	writeToClient(board_id, 'fire'+chch);
		}
    }
    res.end();
});

app.post('/jumptogroup', function(req, res) {
	var group_time = req.query.grouptime;
	show_clock = parseFloat(group_time)-0.1;
	if (show_clock < 0) {
		show_clock = 0;
	}
	io.emit('tick clock', show_clock.toFixed(1), true);
	log_clock_event("jump");
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
			populate_resistance_predictions();
			res.redirect('/');
			io.emit('fresh data', boardinfo, telemetry, predictions, show);
		});
	});
});

app.get('/downloadshow', function(req, res) {
	console.log('download show');
	var file = 'show.json';
	res.download(file);
});

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// mongo connection URL
const mongoURL = 'mongodb://localhost:27017';

// mongo database name
const dbName = 'magicsmoke';

// connect to the mongodb server
MongoClient.connect(mongoURL, function(err, client) {
	assert.equal(null, err);
	console.log("Connected successfully to mongodb server");

	db = client.db(dbName);
	eventlog = db.collection('eventlog');

	http.listen(8080, function(){
		console.log("Listening on *:8080");
	});

	//client.close();
});


