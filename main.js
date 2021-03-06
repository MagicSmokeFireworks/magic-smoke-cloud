
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

var log_board_event = function(eventstr, board_id) {
	log_event({"event": eventstr, "board_id": board_id});
};

var log_socket_event = function(socket_event, sid, handshake_time, issued, address, host, referer) {
	log_event({"event": "socket", "socket_event": socket_event, "id": sid, "handshake_time": handshake_time, "issued": issued, "address": address, "host": host, "referer": referer});
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

var log_man_fire_group_event = function(group_id) {
	log_event({"event": "man_firing_group", "group_id": group_id});
};

var log_fire_board_event = function(group_id, board_id, channels) {
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

io.on('connection', function(socket){
	console.log('A user connected');
	log_socket_event('connection', socket.id, socket.handshake.time, socket.handshake.issued, socket.handshake.address, socket.handshake.headers.host, socket.handshake.headers.referer);
	socket.on('disconnect', function(){
		console.log('A user disconnected');
		log_socket_event('disconnect', socket.id, socket.handshake.time, socket.handshake.issued, socket.handshake.address, socket.handshake.headers.host, socket.handshake.headers.referer);
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
		if (timeouts[board] > 10.0) {
			if (telemetry[board].connection == "active") {
				telemetry[board].connection = "inactive";
				io.emit('fresh data', boardinfo, telemetry, predictions, show);
			}
		}
	}
}, 500);


var syncIndex = 0;
var syncInterval = function() {

	boards = Object.keys(boardinfo);
	board = boards[syncIndex];
    
	syncIndex++;
	if (syncIndex >= boards.length) {
		syncIndex = 0;
	}

	if (telemetry[board].ip === '') {
	}
	else if (telemetry[board].rate != "low") {
		send_highrate_command(board);
		log_board_event('high', board);
	}
	else {
		send_lowrate_command(board);
		log_board_event('low', board);
	}
	setTimeout(syncInterval, 250);
};



var set_high_rate = function(idx) {
	// set boards in the next 3 groups (if exist) to high-rate status
	for (var i = idx; i < idx+3; i++) {
		if (i < show.groups.length) {
			for (board_id in show.boards) {
				for (channel in show.boards[board_id].channels) {
					if (show.boards[board_id].channels[channel].group == show.groups[i].id) {
						telemetry[board_id].rate = "next_high";
					}
				}
			}
		}
	}

	for (board_id in show.boards) {
		if (telemetry[board_id].rate == "next_high") {
			telemetry[board_id].rate = "high";
		} else {
			telemetry[board_id].rate = "low";
		}
	}
};


var show_clock = 0;

var showTickId = null;
var relShowTime = 0;
var startTime = 0;
var showClock = function() {
	relShowTime = relShowTime + 100;
	var now = Date.now();
	var delay = 100+relShowTime-(now-startTime);
	showTickId = setTimeout(showClock, delay);
	show_clock = show_clock + 0.1;
	for (var i = 0; i < show.groups.length; i++) {
		var group_time = parseFloat(show.groups[i].time);
		if (group_time > (show_clock - 0.09)) {
			if (group_time < (show_clock + 0.09)) {
				// fire group
				var group_id = show.groups[i].id;
				// log show firing this group
				log_show_fire_group_event(group_time, group_id);
				fire_by_group(group_id);
				set_high_rate(i);
			}
		}
	}
	io.emit('tick clock', show_clock.toFixed(1), true);
	log_clock_event("tick");
};

app.post('/startclock', function(req, res) {
	startTime = Date.now();
	relShowTime = 0;
	showTickId = setTimeout(showClock, 100);
	res.end();
	console.log('starting clock');
	io.emit('start clock', show_clock.toFixed(1));
	log_clock_event("start");
	set_high_rate(0);
});

app.post('/stopclock', function(req, res) {
	clearTimeout(showTickId);
	res.end();
	console.log('stopping clock');
	io.emit('stop clock', show_clock.toFixed(1));
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
                telemetry[sname].bootcount = req.headers.bc;
                telemetry[sname].pid = req.headers.pid;
                telemetry[sname].micros = req.headers.micros;
                telemetry[sname].ptime = req.headers.ptime;
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
		telemetry[sname].lastfiretime[0] = req.headers.lft0;
		telemetry[sname].lastfiretime[1] = req.headers.lft1;
		telemetry[sname].lastfiretime[2] = req.headers.lft2;
		telemetry[sname].lastfiretime[3] = req.headers.lft3;
		telemetry[sname].lastfiretime[4] = req.headers.lft4;
		telemetry[sname].lastfiretime[5] = req.headers.lft5;
		telemetry[sname].lastfiretime[6] = req.headers.lft6;
		telemetry[sname].lastfiretime[7] = req.headers.lft7;
		telemetry[sname].cmdcount = req.headers.cc;
		res.end();
		io.emit('fresh data', boardinfo, telemetry, predictions, show);
		log_telemetry_event(req.headers.id, sname, telemetry[sname]);
	}
});

app.get('/boards', function(req, res) {
	res.render('boards',
	{
		boardinfo: boardinfo
	});
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
	fs.writeFile('show.json', json, 'utf8', function(err) {
		if (err) throw err;
	});
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
	fs.writeFile('show.json', json, 'utf8', function(err) {
		if (err) throw err;
	});
	io.emit('fresh data', boardinfo, telemetry, predictions, show);
});

app.post('/configgroupsdelete', function(req, res) {
	var group_id = req.query.id;
	res.end();
	delete_group(group_id);
	var json = JSON.stringify(show);
	fs.writeFile('show.json', json, 'utf8', function(err) {
		if (err) throw err;
	});
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
	fs.writeFile('show.json', json, 'utf8', function(err) {
		if (err) throw err;
	});
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
});



var commandnum = 0;

var writeToClient = function(board_id, message) {
	
	var clientIP = '';
	clientIP = telemetry[board_id].ip;
	clientPort = telemetry[board_id].port;

	commandnum += 1;
	var thiscmdnum = commandnum;


	if (clientIP === '') {
        predictions[board_id].last_cmd_status = "noip";
		log_command_event("no_ip", board_id, message, "", thiscmdnum);
		io.emit('fresh data', boardinfo, telemetry, predictions, show);
	}
	else {
		predictions[board_id].cmdrequests = parseInt(predictions[board_id].cmdrequests) + 1;

		var client = new net.Socket();

		// command connection timeout after 5 seconds
		client.setTimeout(5000);

		// CONNECT to board
		client.connect(clientPort, clientIP, function() {
        	predictions[board_id].last_cmd_status = "conn";
			log_command_event("connected", board_id, message, "", thiscmdnum);
			client.write(message);
		});

		// TIMEOUT
		client.on('timeout', function() {
			console.log(board_id + ': timeout');
			log_command_event("timeout", board_id, message, "timeout", thiscmdnum);
			predictions[board_id].last_cmd_status = "timeout";
			client.destroy();
		});
	
		// DATA from board
		client.on('data', function(data) {
			var data_str = data.toString().trim();
			if (data_str.startsWith(message)) {
				if (data_str.endsWith(".1.1")) {
					predictions[board_id].last_cmd_status = "ontime and valid";
				}
				else if (data_str.endsWith(".0.0")) {
					predictions[board_id].last_cmd_status = "late";
				}
				else if (data_str.endsWith(".1.0")) {
					predictions[board_id].last_cmd_status = "invalid";
				}
				else {
					predictions[board_id].last_cmd_status = "data error";
				}
			}
			
			timeouts[board_id] = 0;
			log_command_event("data", board_id, message, data_str, thiscmdnum);
			client.end();
		});

		// CLOSE
		client.on('close', function() {
			log_command_event("disconnected", board_id, message, "", thiscmdnum);

			if (predictions[board_id].last_cmd_status == "ontime and valid") {
				predictions[board_id].cmdresponses = parseInt(predictions[board_id].cmdresponses) + 1;
				predictions[board_id].last_cmd_status = "good";
			}
			else if (predictions[board_id].last_cmd_status == "conn") {
				predictions[board_id].last_cmd_status = "error";
			}
			
			io.emit('fresh data', boardinfo, telemetry, predictions, show);
		});

		// ERROR
		client.on('error', function(err) {
			console.log(board_id + ': error: ' + err.message);
			log_command_event("error", board_id, message, err.message, thiscmdnum);
        	predictions[board_id].last_cmd_status = "error";
        	client.destroy();
		});
	}
};


// generic function to send formatted command
var send_command = function(boardID, cmdID, chans) {
	var nowstr = Date.now().toString();
	writeToClient(boardID, '.'+cmdID+'.'+chans+'.'+nowstr.substring(0,nowstr.length-3));
};


// helper function for sending "low-rate" command
var send_lowrate_command = function(boardID) {
	predictions[boardID].last_cmd = "low-rate sync";
	send_command(boardID, '2', '00');
};

// helper function for sending "high-rate" command
var send_highrate_command = function(boardID) {
	predictions[boardID].last_cmd = "high-rate sync";
	send_command(boardID, '3', '00');
};

// helper function for sending "reset" command
var send_reset_command = function(boardID) {
	predictions[boardID].last_cmd = "reset";
	send_command(boardID, '5', '00');
};

// helper function for sending "ping" command
var send_ping_command = function(boardID) {
	predictions[boardID].last_cmd = "ping";
	send_command(boardID, '6', '00');
};

// helper function for sending "arm" command
var send_arm_command = function(boardID) {
	predictions[boardID].last_cmd = "arm";
	predictions[boardID].swarm = 1;
	send_command(boardID, '0', '00');
};

// helper function for sending "disarm" command
var send_disarm_command = function(boardID) {
	predictions[boardID].last_cmd = "disarm";
	predictions[boardID].swarm = 0;
	send_command(boardID, '1', '00');
};

// helper function for sending "identify" command
var send_identify_command = function(boardID) {
	predictions[boardID].last_cmd = "identify";
	send_command(boardID, '4', '00');
};

// helper function for sending "fire" command
var send_fire_command = function(boardID, chans) {
	predictions[boardID].last_cmd = "fire."+chans;

	// set channel trycount predictions
	var chans_int = parseInt(chans, 16);
	for (var i = 0; i < 8; i++) {
		var bit = 1 << i;
		if (bit & chans_int) {
			predictions[boardID].trycount[i] = parseInt(predictions[boardID].trycount[i]) + 1;
			if (predictions[boardID].swarm == 1) {
				predictions[boardID].firecount[i] = parseInt(predictions[boardID].firecount[i]) + 1;
				predictions[boardID].res[i] = "open";
			}
		}
	}

	send_command(boardID, '9', chans);
};

// helper function for firing by chan string
var fire_by_string = function(boardID, chan_str) {
	
	var chan_bits = 0;

	for (var i = 0; i < chan_str.length; i++) {
		var chan_int = parseInt(chan_str.charAt(i));
		var chan_bit = 1 << chan_int;
		chan_bits |= chan_bit;
	}

	var chan_hex = chan_bits.toString(16).padStart(2,'0');

	send_fire_command(boardID, chan_hex);
};

// helper function for firing by group ID
var fire_by_group = function(groupID) {
	for(board_id in show.boards) {
		var chch = "";
		for(channel in show.boards[board_id].channels) {
			if( show.boards[board_id].channels[channel].group == groupID ) {
				chch = chch + channel;
			}
		}
		if (chch != "") {
			// log manual group fire board channels
			log_fire_board_event(groupID, board_id, chch);
        	fire_by_string(board_id, chch);
		}
    }
};


// POST for requesting "reset" command
app.post('/reset', function(req, res) {
	var board_id = req.query.id;
	res.end();
	log_man_board_event("man_reset", board_id);
	send_reset_command(board_id);
});


// POST for requesting "ping" command
app.post('/ping', function(req, res) {
	var board_id = req.query.id;
	res.end();
	log_man_board_event("man_ping", board_id);
	send_ping_command(board_id);
});


// POST for requesting "arm" command
app.post('/arm', function(req, res) {
	var board_id = req.query.id;
	res.end();
	log_man_board_event("man_arm", board_id);
	send_arm_command(board_id);
});


// POST for requesting "arm" command to ALL boards
app.post('/armall', function(req, res) {
	res.end();
	log_generic_event("manual_arm_all");
    for(board in boardinfo) {
		log_man_board_event("man_arm", board);
		send_arm_command(board);
    }
});


// POST for requesting "disarm" command
app.post('/disarm', function(req, res) {
	var board_id = req.query.id;
	res.end();
	log_man_board_event("man_disarm", board_id);
	send_disarm_command(board_id);
});


// POST for requesting "disarm" command to ALL boards
app.post('/disarmall', function(req, res) {
	res.end();
	log_generic_event("manual_disarm_all");
    for(board in boardinfo) {
		log_man_board_event("man_disarm", board);
        send_disarm_command(board);
    }
});


// POST for requesting "identify" command
app.post('/identify', function(req, res) {
	var board_id = req.query.id;
	res.end();
	log_man_board_event("man_identify", board_id);
	send_identify_command(board_id);
});


// POST for requesting manual "fire" command
app.post('/fire', function(req, res) {
	var board_id = req.query.id;
	var channels = req.query.channels;
	res.end();
	log_man_fire_event("man_fire", board_id, channels);
	fire_by_string(board_id, channels);
});


// POST for requesting "fire" command for all boards/channels in group
app.post('/firegroup', function(req, res) {
    var group_id = req.query.groupid;
    res.end();
	log_man_fire_group_event(group_id);
	fire_by_group(group_id);
});


// POST for jumping show clock to group time
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


app.get('/config', function(req, res) {
	res.render('config',
	{
		boardinfo: boardinfo
	});
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
		try {
			var tmpcontents = fs.readFileSync(oldpath);
			JSON.parse(tmpcontents);
		}
		catch(error) {
			console.error(error);
			res.redirect('/config');
			return;
		}
		var newpath = 'show.json';
		fs.rename(oldpath, newpath, function (err) {
			if (err) throw err;
			var contents = fs.readFileSync("show.json");
			show = JSON.parse(contents);
			populate_resistance_predictions();
			res.redirect('/config');
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

	setTimeout(syncInterval, 500);

	http.listen(8080, function(){
	//http.listen(8080, '192.168.0.199', function(){
		console.log("Listening on *:8080");
		log_generic_event("server start");
	});

	//client.close();
});

