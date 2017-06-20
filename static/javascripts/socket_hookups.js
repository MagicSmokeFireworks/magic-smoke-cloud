
var get_cmdstatus = function(board, telemetry, predictions) {
	var cmdcount = telemetry[board].cmdcount;
        var cmdcount_predict = predictions[board].cmdcount;
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

var get_channelstatus = function(board, channel, telemetry, show) {
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

var socket = io();

socket.on('fresh data', function(boardinfo, telemetry, predictions, show) {
	for (board in boardinfo) {
		// reset telemetry timer
		//var datatimer = document.getElementById(board+"_datatimer")
		//if (datatimer != null) {
		//	datatimer.innerHTML = "0";
		//}
	
		// firmware version
		var firmver = document.getElementById(board+"_firmver");
		if (firmver != null) {
			firmver.innerHTML = telemetry[board]["firmver"];
		}

		// ip
		var ip = document.getElementById(board+"_ip");
		if (ip != null) {
			ip.innerHTML = telemetry[board]["ip"];
		}

		// software arm
		var swarm = document.getElementById(board+"_swarm");
		var swarm_predict = document.getElementById(board+"_swarm_predict");
		var swarm_val = "no data";
		if (telemetry[board]["swarm"] == "0") {
			swarm_val = "SW DISARMED";
		}
		else if (telemetry[board]["swarm"] == "1") {
			swarm_val = "SW ARMED";
		}
		if (swarm != null) {
			if (telemetry[board]["swarm"] == "no data") {
				swarm.className = "error_status";
				if (swarm_predict != null) {
					swarm_predict.className = "warning_status";
				}
			}
			else if( telemetry[board]["swarm"] == predictions[board]["swarm"] ) {
				swarm.className = "normal_status";
				if (swarm_predict != null) {
					swarm_predict.className = "normal_status";
				}
			}
			else {
				swarm.className = "warning_status";
				if (swarm_predict != null) {
					swarm_predict.className = "warning_status";
				}
			}
			swarm.innerHTML = swarm_val;
		}

		// hardware arm
		var hwarm = document.getElementById(board+"_hwarm");
		var hwarm_val = "no data";
		if (telemetry[board]["hwarm"] == "DISARMED") {
			hwarm_val = "HW DISARMED";
		}
		else if (telemetry[board]["hwarm"] == "ARMED") {
			hwarm_val = "HW ARMED";
		}
		if (hwarm != null) {
			if (hwarm_val == "no data") {
				hwarm.className = "error_status";
			}
			else if (hwarm_val == "HW DISARMED" && swarm_val == "SW ARMED") {
				hwarm.className = "warning_status";
			}
			else {
				hwarm.className = "normal_status";
			}
			hwarm.innerHTML = hwarm_val;
		}

		// wifi rssi
		var rssi = document.getElementById(board+"_rssi");
		var rssi_val = telemetry[board]["rssi"];
		if (rssi != null) {
			if (parseInt(telemetry[board]["rssi"]) < -60) {
				rssi.className = "warning_status";
			}
			else if (parseInt(telemetry[board]["rssi"]) == 1) {
				rssi.className = "error_status";
				rssi_val = "WiFi Chip Error";
			}
			else if (parseInt(telemetry[board]["rssi"]) == 2) {
				rssi.className = "error_status";
				rssi_val = "Time-out Error";
			}
			else if (telemetry[board]["rssi"] == "no data") {
				rssi.className = "error_status";
			}
			else  {
				rssi.className = "normal_status";
			}
			rssi.innerHTML = rssi_val;
		}

		// command count
		var cmdcount = document.getElementById(board+"_cmdcount");
		if (cmdcount != null) {
			cmdcount.innerHTML = telemetry[board]["cmdcount"];
		}

		// show status
		for (var i = 0; i < 8; i++) {
			var showstatus = document.getElementById(board+"_showstatus"+i);
			if (showstatus != null) {
				if (telemetry[board]["firecount"][i] > 0) {
					showstatus.innerHTML = "Fired";
					showstatus.className = "";
				}
				else if (telemetry[board]["connection"] != "active") {
					showstatus.innerHTML = "No Conn";
					showstatus.className = "error_status";
				}
				else if (telemetry[board]["hwarm"] != "ARMED") {
					showstatus.innerHTML = "HW Disarmed";
					showstatus.className = "warning_status";
				}
				else if (telemetry[board]["swarm"] != 1) {
					showstatus.innerHTML = "SW Disarmed";
					showstatus.className = "warning_status";
				}
				else {
					showstatus.innerHTML = "Ready";
					showstatus.className = "good_status";
				}
			}
		}

		// connection status
		var connstatus = document.getElementById(board+"_connstatus");
		if (connstatus != null) {
			if (telemetry[board]["connection"] == "never") {
				connstatus.innerHTML = "Never Connected";
				connstatus.className = "error_status";
			}
			else if (telemetry[board]["connection"] == "inactive") {
				connstatus.innerHTML = "Connection Lost";
				connstatus.className = "warning_status";
			}
			else {
				if (parseInt(telemetry[board]["rssi"]) < -60) {
					connstatus.innerHTML = "Low Signal";
					connstatus.className = "warning_status";
				}
				else {
					connstatus.innerHTML = "Connected";
					connstatus.className = "normal_status";
				}
			}
		}

		// command status
		var cmdstatus_array = get_cmdstatus(board, telemetry, predictions);
		cmdstatus = document.getElementById(board+"_cmdstatus");
		if (cmdstatus != null) {
			cmdstatus.className = cmdstatus_array[1];
			cmdstatus.innerHTML = cmdstatus_array[0];
		}

		// resistance measurements
		for (var i = 0; i < 8; i++) {
			var res = document.getElementById(board+"_res"+i);
			if (res != null) {
				res.innerHTML = telemetry[board]["res"][i];
			}
		}

		// fire counts
		for (var i = 0; i < 8; i++) {
			var firecount = document.getElementById(board+"_firecount"+i);
			if (firecount != null) {
				firecount.innerHTML = telemetry[board]["firecount"][i];
			}
		}

		// channel status
		for (var i = 0; i < 8; i++) {
			var channelstatus_array = get_channelstatus(board, i, telemetry, show);
			channelstatus = document.getElementById(board+"_channelstatus"+i);
			if (channelstatus != null) {
				channelstatus.className = channelstatus_array[1];
				channelstatus.innerHTML = channelstatus_array[0];
			}
		}
	}

	// show connection status
	var conns = 0;
	var noconns = 0;
	var conn_val = "No Connections";
	var conn_class = "error_status";
	for (board in boardinfo) {
		if (board in show) {
			if (telemetry[board].connection == "active") {
				conns = conns + 1;
			}
			else {
				noconns = noconns + 1;
			}
		}
	}
	if (conns == 0) {
		conn_val = "No Connections";
		conn_class = "error_status";
	}
	else if (noconns == 0) {
		conn_val = "Good Connections";
		conn_class = "good_status";
	}
	else {
		conn_val = noconns + " Bad Connection(s)";
		conn_class = "warning_status";
	}
	var showconnstatus = document.getElementById("show_conn_status");
	if (showconnstatus != null) {
		showconnstatus.className = conn_class;
		showconnstatus.innerHTML = conn_val;
	}
});


socket.on('fresh predicts', function(boardinfo, predictions, telemetry, show) {

	for (board in boardinfo) {

		// software arm
		var swarm = document.getElementById(board+"_swarm");
		var swarm_predict = document.getElementById(board+"_swarm_predict");
		var swarm_predict_val = "SW DISARMED";
		if (predictions[board]["swarm"] == "1") {
			swarm_predict_val = "SW ARMED";
		}
		if (swarm_predict != null) {
			if( telemetry[board]["swarm"] == predictions[board]["swarm"] ) {
				swarm_predict.className = "normal_status";
				if ( swarm != null) {
					swarm.className = "normal_status";
				}
			}
			else {
				swarm_predict.className = "warning_status";
				if ( swarm != null) {
					swarm.className = "warning_status";
				}
			}
			swarm_predict.innerHTML = swarm_predict_val;
		}
	

		// command count
		cmdcount = document.getElementById(board+"_cmdcount_predict");
		if (cmdcount != null) {
			cmdcount.innerHTML = predictions[board]["cmdcount"];
		}

		// command status
		/*var cmdstatus_array = get_cmdstatus(board);
		cmdstatus = document.getElementById(board+"_cmdstatus");
		cmdstatus.className = cmdstatus_array[1];
		cmdstatus.innerHTML = cmdstatus_array[0];*/

		// resistance
		for (var i = 0; i < 8; i++) {
			var res = document.getElementById(board+"_res"+i+"_predict");
			if (res != null) {
				res.innerHTML = predictions[board]["res"][i];
			}
		}

		// fire counts
		for (var i = 0; i < 8; i++) {
			var firecount = document.getElementById(board+"_firecount"+i+"_predict");
			if (firecount != null) {
				firecount.innerHTML = predictions[board]["firecount"][i];
			}
		}

		// channel status
		/*for (var i = 0; i < 8; i++) {
			var channelstatus_array = get_channelstatus(board, i);
			channelstatus = document.getElementById(board+"_channelstatus");
			channelstatus.className = channelstatus_array[1];
			channelstatus.innerHTML = channelstatus_array[0];
		}*/
	}
});


