
var express = require('express');
var app = express();

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

var fga_sw_arm = 'no data';
var fga_hw_arm = 'no data';
var fga_wifi_rssi = 'no data';
var fga_res = ['no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data'];

var ntb_sw_arm = 'no data';
var ntb_hw_arm = 'no data';
var ntb_wifi_rssi = 'no data';
var ntb_res = ['no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data'];

var name6_sw_arm = 'no data';
var name6_hw_arm = 'no data';
var name6_wifi_rssi = 'no data';
var name6_res = ['no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data'];

var name7_sw_arm = 'no data';
var name7_hw_arm = 'no data';
var name7_wifi_rssi = 'no data';
var name7_res = ['no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data'];

var name8_sw_arm = 'no data';
var name8_hw_arm = 'no data';
var name8_wifi_rssi = 'no data';
var name8_res = ['no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data'];

var name9_sw_arm = 'no data';
var name9_hw_arm = 'no data';
var name9_wifi_rssi = 'no data';
var name9_res = ['no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data'];

var name10_sw_arm = 'no data';
var name10_hw_arm = 'no data';
var name10_wifi_rssi = 'no data';
var name10_res = ['no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data', 'no data'];

app.set('view engine', 'pug');

app.use(express.static('static'));

app.get('/status', function(req, res) {
	res.sendFile(__dirname + "/" + "status.htm");
})

app.post('/status', function(req, res) {
	if (req.headers.id === '210043000347343138333038') {
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
	else if (req.headers.id === 'mm') {
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
	else if (req.headers.id === 'dlj') {
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
	else if (req.headers.id === 'fga') {
		fga_sw_arm = req.headers.sw_arm;
		fga_hw_arm = req.headers.hw_arm;
		fga_wifi_rssi = req.headers.wifi_rssi;
		fga_res[0] = req.headers.r0;
		fga_res[1] = req.headers.r1;
		fga_res[2] = req.headers.r2;
		fga_res[3] = req.headers.r3;
		fga_res[4] = req.headers.r4;
		fga_res[5] = req.headers.r5;
		fga_res[6] = req.headers.r6;
		fga_res[7] = req.headers.r7;
	}
	else if (req.headers.id === 'ntb') {
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
	else if (req.headers.id === 'name6') {
		name6_sw_arm = req.headers.sw_arm;
		name6_hw_arm = req.headers.hw_arm;
		name6_wifi_rssi = req.headers.wifi_rssi;
		name6_res[0] = req.headers.r0;
		name6_res[1] = req.headers.r1;
		name6_res[2] = req.headers.r2;
		name6_res[3] = req.headers.r3;
		name6_res[4] = req.headers.r4;
		name6_res[5] = req.headers.r5;
		name6_res[6] = req.headers.r6;
		name6_res[7] = req.headers.r7;
	}
	else if (req.headers.id === 'name7') {
		name7_sw_arm = req.headers.sw_arm;
		name7_hw_arm = req.headers.hw_arm;
		name7_wifi_rssi = req.headers.wifi_rssi;
		name7_res[0] = req.headers.r0;
		name7_res[1] = req.headers.r1;
		name7_res[2] = req.headers.r2;
		name7_res[3] = req.headers.r3;
		name7_res[4] = req.headers.r4;
		name7_res[5] = req.headers.r5;
		name7_res[6] = req.headers.r6;
		name7_res[7] = req.headers.r7;
	}
	else if (req.headers.id === 'name8') {
		name8_sw_arm = req.headers.sw_arm;
		name8_hw_arm = req.headers.hw_arm;
		name8_wifi_rssi = req.headers.wifi_rssi;
		name8_res[0] = req.headers.r0;
		name8_res[1] = req.headers.r1;
		name8_res[2] = req.headers.r2;
		name8_res[3] = req.headers.r3;
		name8_res[4] = req.headers.r4;
		name8_res[5] = req.headers.r5;
		name8_res[6] = req.headers.r6;
		name8_res[7] = req.headers.r7;
	}
	else if (req.headers.id === 'name9') {
		name9_sw_arm = req.headers.sw_arm;
		name9_hw_arm = req.headers.hw_arm;
		name9_wifi_rssi = req.headers.wifi_rssi;
		name9_res[0] = req.headers.r0;
		name9_res[1] = req.headers.r1;
		name9_res[2] = req.headers.r2;
		name9_res[3] = req.headers.r3;
		name9_res[4] = req.headers.r4;
		name9_res[5] = req.headers.r5;
		name9_res[6] = req.headers.r6;
		name9_res[7] = req.headers.r7;
	}
	else if (req.headers.id === 'name10') {
		name10_sw_arm = req.headers.sw_arm;
		name10_hw_arm = req.headers.hw_arm;
		name10_wifi_rssi = req.headers.wifi_rssi;
		name10_res[0] = req.headers.r0;
		name10_res[1] = req.headers.r1;
		name10_res[2] = req.headers.r2;
		name10_res[3] = req.headers.r3;
		name10_res[4] = req.headers.r4;
		name10_res[5] = req.headers.r5;
		name10_res[6] = req.headers.r6;
		name10_res[7] = req.headers.r7;
	}
	res.end();
})

app.get('/getstatus', function(req, res) {
	res.render('status',
	{
		title: 'Random!',
		message: 'Magic Smoke',
		block1: {
			spa: {
				swarm: spa_sw_arm, hwarm: spa_hw_arm, rssi: spa_wifi_rssi, res: spa_res
			},
			mm: {
				swarm: mm_sw_arm, hwarm: mm_hw_arm, rssi: mm_wifi_rssi, res: mm_res
			},
			dlj: {
				swarm: dlj_sw_arm, hwarm: dlj_hw_arm, rssi: dlj_wifi_rssi, res: dlj_res
			},
			fga: {
				swarm: fga_sw_arm, hwarm: fga_hw_arm, rssi: fga_wifi_rssi, res: fga_res
			},
			ntb: {
				swarm: ntb_sw_arm, hwarm: ntb_hw_arm, rssi: ntb_wifi_rssi, res: ntb_res
			}
		},
		block2: {
			name6: {
				swarm: name6_sw_arm, hwarm: name6_hw_arm, rssi: name6_wifi_rssi, res: name6_res
			},
			name7: {
				swarm: name7_sw_arm, hwarm: name7_hw_arm, rssi: name7_wifi_rssi, res: name7_res
			},
			name8: {
				swarm: name8_sw_arm, hwarm: name8_hw_arm, rssi: name8_wifi_rssi, res: name8_res
			},
			name9: {
				swarm: name9_sw_arm, hwarm: name9_hw_arm, rssi: name9_wifi_rssi, res: name9_res
			},
			name10: {
				swarm: name10_sw_arm, hwarm: name10_hw_arm, rssi: name10_wifi_rssi, res: name10_res
			}
		}
	});
})

app.get('/', function(req, res) {
	res.send('Hello World');
})

var server = app.listen(8081, function() {

	var host = server.address().address;
	var port = server.address().port;

	console.log("Listening at http://%s:%s", host, port);

})

