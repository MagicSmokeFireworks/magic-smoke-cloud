
var fs = require("fs");
var contents = fs.readFileSync("show_config.json");
var show_config = JSON.parse(contents);

var express = require('express');
var app = express();

var net = require('net');

var spa_id = '210043000347343138333038';
var mm_id = '1f0032000a47353235303037';
var dlj_id = '3e0026000a47353235303037';
var fag_id = '3c002a001847353236343033';
var ntb_id = '2d003e001847353236343033';
var rd_id = '440029000347343337373738';
var sm_id = '2e0036001747353236343033';
var pitd_id = '3d0025000347353138383138';
var cr_id = '3b0039000647343339373536';
var ta_id = '300047001247353236343033';

var spa_ip = '';
var mm_ip = '';
var dlj_ip = '';
var fag_ip = '';
var ntb_ip = '';
var rd_ip = '';
var sm_ip = '';
var pitd_ip = '';
var cr_ip = '';
var ta_ip = '';

var spa_sw_arm = 'no data';
var spa_hw_arm = 'no data';
var spa_wifi_rssi = 'no data';
var spa_res = ['no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data'];

var mm_sw_arm = 'no data';
var mm_hw_arm = 'no data';
var mm_wifi_rssi = 'no data';
var mm_res = ['no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data'];

var dlj_sw_arm = 'no data';
var dlj_hw_arm = 'no data';
var dlj_wifi_rssi = 'no data';
var dlj_res = ['no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data'];

var fag_sw_arm = 'no data';
var fag_hw_arm = 'no data';
var fag_wifi_rssi = 'no data';
var fag_res = ['no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data'];

var ntb_sw_arm = 'no data';
var ntb_hw_arm = 'no data';
var ntb_wifi_rssi = 'no data';
var ntb_res = ['no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data'];

var rd_sw_arm = 'no data';
var rd_hw_arm = 'no data';
var rd_wifi_rssi = 'no data';
var rd_res = ['no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data'];

var sm_sw_arm = 'no data';
var sm_hw_arm = 'no data';
var sm_wifi_rssi = 'no data';
var sm_res = ['no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data'];

var pitd_sw_arm = 'no data';
var pitd_hw_arm = 'no data';
var pitd_wifi_rssi = 'no data';
var pitd_res = ['no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data'];

var cr_sw_arm = 'no data';
var cr_hw_arm = 'no data';
var cr_wifi_rssi = 'no data';
var cr_res = ['no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data'];

var ta_sw_arm = 'no data';
var ta_hw_arm = 'no data';
var ta_wifi_rssi = 'no data';
var ta_res = ['no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data'];

app.set('view engine', 'pug');

app.use(express.static('static'));

app.get('/status', function(req, res) {
	res.sendFile(__dirname + "/" + "status.htm");
})

app.post('/status', function(req, res) {
	if (req.headers.id === spa_id) {
		spa_ip = req.ip;
		spa_sw_arm = req.headers.sw_arm;
		spa_hw_arm = req.headers.hw_arm;
		spa_wifi_rssi = req.headers.wifi_rssi;
		spa_res[0] = req.headers.r0;
		spa_res[1] = req.headers.r1;
		spa_res[2] = req.headers.r2;
		spa_res[3] = req.headers.r3;
		spa_res[4] = req.headers.r4;
		spa_res[5] = req.headers.r5;
		spa_res[6] = req.headers.r6;
		spa_res[7] = req.headers.r7;
	}
	else if (req.headers.id === mm_id) {
		mm_ip = req.ip;
		mm_sw_arm = req.headers.sw_arm;
		mm_hw_arm = req.headers.hw_arm;
		mm_wifi_rssi = req.headers.wifi_rssi;
		mm_res[0] = req.headers.r0;
		mm_res[1] = req.headers.r1;
		mm_res[2] = req.headers.r2;
		mm_res[3] = req.headers.r3;
		mm_res[4] = req.headers.r4;
		mm_res[5] = req.headers.r5;
		mm_res[6] = req.headers.r6;
		mm_res[7] = req.headers.r7;
	}
	else if (req.headers.id === dlj_id) {
		dlj_ip = req.ip;
		dlj_sw_arm = req.headers.sw_arm;
		dlj_hw_arm = req.headers.hw_arm;
		dlj_wifi_rssi = req.headers.wifi_rssi;
		dlj_res[0] = req.headers.r0;
		dlj_res[1] = req.headers.r1;
		dlj_res[2] = req.headers.r2;
		dlj_res[3] = req.headers.r3;
		dlj_res[4] = req.headers.r4;
		dlj_res[5] = req.headers.r5;
		dlj_res[6] = req.headers.r6;
		dlj_res[7] = req.headers.r7;
	}
	else if (req.headers.id === fag_id) {
		fag_ip = req.ip;
		fag_sw_arm = req.headers.sw_arm;
		fag_hw_arm = req.headers.hw_arm;
		fag_wifi_rssi = req.headers.wifi_rssi;
		fag_res[0] = req.headers.r0;
		fag_res[1] = req.headers.r1;
		fag_res[2] = req.headers.r2;
		fag_res[3] = req.headers.r3;
		fag_res[4] = req.headers.r4;
		fag_res[5] = req.headers.r5;
		fag_res[6] = req.headers.r6;
		fag_res[7] = req.headers.r7;
	}
	else if (req.headers.id === ntb_id) {
		ntb_ip = req.ip;
		ntb_sw_arm = req.headers.sw_arm;
		ntb_hw_arm = req.headers.hw_arm;
		ntb_wifi_rssi = req.headers.wifi_rssi;
		ntb_res[0] = req.headers.r0;
		ntb_res[1] = req.headers.r1;
		ntb_res[2] = req.headers.r2;
		ntb_res[3] = req.headers.r3;
		ntb_res[4] = req.headers.r4;
		ntb_res[5] = req.headers.r5;
		ntb_res[6] = req.headers.r6;
		ntb_res[7] = req.headers.r7;
	}
	else if (req.headers.id === rd_id) {
		rd_ip = req.ip;
		rd_sw_arm = req.headers.sw_arm;
		rd_hw_arm = req.headers.hw_arm;
		rd_wifi_rssi = req.headers.wifi_rssi;
		rd_res[0] = req.headers.r0;
		rd_res[1] = req.headers.r1;
		rd_res[2] = req.headers.r2;
		rd_res[3] = req.headers.r3;
		rd_res[4] = req.headers.r4;
		rd_res[5] = req.headers.r5;
		rd_res[6] = req.headers.r6;
		rd_res[7] = req.headers.r7;
	}
	else if (req.headers.id === sm_id) {
		sm_ip = req.ip;
		sm_sw_arm = req.headers.sw_arm;
		sm_hw_arm = req.headers.hw_arm;
		sm_wifi_rssi = req.headers.wifi_rssi;
		sm_res[0] = req.headers.r0;
		sm_res[1] = req.headers.r1;
		sm_res[2] = req.headers.r2;
		sm_res[3] = req.headers.r3;
		sm_res[4] = req.headers.r4;
		sm_res[5] = req.headers.r5;
		sm_res[6] = req.headers.r6;
		sm_res[7] = req.headers.r7;
	}
	else if (req.headers.id === pitd_id) {
		pitd_ip = req.ip;
		pitd_sw_arm = req.headers.sw_arm;
		pitd_hw_arm = req.headers.hw_arm;
		pitd_wifi_rssi = req.headers.wifi_rssi;
		pitd_res[0] = req.headers.r0;
		pitd_res[1] = req.headers.r1;
		pitd_res[2] = req.headers.r2;
		pitd_res[3] = req.headers.r3;
		pitd_res[4] = req.headers.r4;
		pitd_res[5] = req.headers.r5;
		pitd_res[6] = req.headers.r6;
		pitd_res[7] = req.headers.r7;
	}
	else if (req.headers.id === cr_id) {
		cr_ip = req.ip;
		cr_sw_arm = req.headers.sw_arm;
		cr_hw_arm = req.headers.hw_arm;
		cr_wifi_rssi = req.headers.wifi_rssi;
		cr_res[0] = req.headers.r0;
		cr_res[1] = req.headers.r1;
		cr_res[2] = req.headers.r2;
		cr_res[3] = req.headers.r3;
		cr_res[4] = req.headers.r4;
		cr_res[5] = req.headers.r5;
		cr_res[6] = req.headers.r6;
		cr_res[7] = req.headers.r7;
	}
	else if (req.headers.id === ta_id) {
		ta_ip = req.ip;
		ta_sw_arm = req.headers.sw_arm;
		ta_hw_arm = req.headers.hw_arm;
		ta_wifi_rssi = req.headers.wifi_rssi;
		ta_res[0] = req.headers.r0;
		ta_res[1] = req.headers.r1;
		ta_res[2] = req.headers.r2;
		ta_res[3] = req.headers.r3;
		ta_res[4] = req.headers.r4;
		ta_res[5] = req.headers.r5;
		ta_res[6] = req.headers.r6;
		ta_res[7] = req.headers.r7;
	}
	res.end();
})

app.get('/getstatus', function(req, res) {
	res.render('status',
	{
		title: 'Magic Smoke Status',
		message: 'Magic Smoke',
		block1: {
			"Shemale Porn Addiction": {
				id: "spa", swarm: spa_sw_arm, hwarm: spa_hw_arm, rssi: spa_wifi_rssi, res: spa_res
			},
			"Moist Molly": {
				id: "mm", swarm: mm_sw_arm, hwarm: mm_hw_arm, rssi: mm_wifi_rssi, res: mm_res
			},
			"Dr. Lee's Jubiration": {
				id: "dlj", swarm: dlj_sw_arm, hwarm: dlj_hw_arm, rssi: dlj_wifi_rssi, res: dlj_res
			},
			"Fucking Assballs Greg": {
				id: "fag", swarm: fag_sw_arm, hwarm: fag_hw_arm, rssi: fag_wifi_rssi, res: fag_res
			},
			"Not the Bees": {
				id: "ntb", swarm: ntb_sw_arm, hwarm: ntb_hw_arm, rssi: ntb_wifi_rssi, res: ntb_res
			}
		},
		block2: {
			"Resplendent Deuce": {
				id: "rd", swarm: rd_sw_arm, hwarm: rd_hw_arm, rssi: rd_wifi_rssi, res: rd_res
			},
			"Savage Mistress": {
				id: "sm", swarm: sm_sw_arm, hwarm: sm_hw_arm, rssi: sm_wifi_rssi, res: sm_res
			},
			"Pain in the Dick": {
				id: "pitd", swarm: pitd_sw_arm, hwarm: pitd_hw_arm, rssi: pitd_wifi_rssi, res: pitd_res
			},
			"Clenched Ringpiece": {
				id: "cr", swarm: cr_sw_arm, hwarm: cr_hw_arm, rssi: cr_wifi_rssi, res: cr_res
			},
			"Totes Amazeballs": {
				id: "ta", swarm: ta_sw_arm, hwarm: ta_hw_arm, rssi: ta_wifi_rssi, res: ta_res
			}
		}
	});
})

var writeToClient = function(board_id, message) {
	console.log(board_id);
	console.log(message);
	var clientIP = '';
	if (board_id === 'spa') {
		clientIP = spa_ip;
	}
	else if (board_id === 'mm') {
		clientIP = mm_ip;
	}
	else if (board_id === 'dlj') {
		clientIP = dlj_ip;
	}
	else if (board_id === 'fag') {
		clientIP = fag_ip;
	}
	else if (board_id === 'ntb') {
		clientIP = ntb_ip;
	}
	else if (board_id === 'rd') {
		clientIP = rd_ip;
	}
	else if (board_id === 'sm') {
		clientIP = sm_ip;
	}
	else if (board_id === 'pitd') {
		clientIP = pitd_ip;
	}
	else if (board_id === 'cr') {
		clientIP = cr_ip;
	}
	else if (board_id === 'ta') {
		clientIP = ta_ip;
	}
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

app.get('/show', function(req, res) {
	res.render('show', show_config);
})

app.get('/', function(req, res) {
	res.render('home');
})

var server = app.listen(8080, function() {

	var host = server.address().address;
	var port = server.address().port;

	console.log("Listening at http://%s:%s", host, port);

})

