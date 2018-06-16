
var get_cmdstatus = function(board, telemetry, predictions) {
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
					if (telemetry[board]["res"][i] > 2500) {
						showstatus.innerHTML = "Fired";
						showstatus.className = "normal_status";
					}
					else if (telemetry[board]["res"][i] < 800) {
						showstatus.innerHTML = "Fired. Low?";
						showstatus.className = "normal_status";
					}
					else {
						showstatus.innerHTML = "Fired. Low?";
						showstatus.className = "warning_status";
					}
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
				else if (showstatus.innerHTML == "BAD FIRE") {
				}
				else if (showstatus.innerHTML == "firing...") {
				}
				else {
					// 2500, 800
					if (telemetry[board]["res"][i] > 2500) {
						showstatus.innerHTML = "Ready. High?";
						showstatus.className = "good_status";
					}
					else if (telemetry[board]["res"][i] < 700) {
						showstatus.innerHTML = "Ready. Low?";
						showstatus.className = "good_status";
					}
					else {
						showstatus.innerHTML = "Ready";
						showstatus.className = "good_status";
					}
				}
			}
		}

		// show status fire command
		for (var i = 0; i < 8; i++) {
			var ssfire = document.getElementById(board+"_showstatus_pred"+i);
			if (ssfire != null) {
				var isTried = (predictions[board]["trycount"][i] > 0);
				var isFired = (predictions[board]["firecount"][i] > 0);

				if (isTried) {
					if (isFired) {
						ssfire.innerHTML = "Good Cmd";
						ssfire.className = "normal_status";
					}
					else {
						ssfire.innerHTML = "Bad Cmd";
						ssfire.className = "error_status";
					}
				}
				else {
					ssfire.innerHTML = "Not Fired";
					ssfire.className = "good_status";
				}
			}
		}

		// show status resistance
		for (var i = 0; i < 8; i++) {
			var ssres = document.getElementById(board+"_showstatus_res"+i);
			if (ssres != null) {
				var isFired = (telemetry[board]["firecount"][i] > 0);
				var isConn = (telemetry[board]["connection"] == "active");

				if (telemetry[board]["res"][i] == "no data") {
					ssres.innerHTML = "No Data";
					ssres.className = "error_status";
				}
				else if (telemetry[board]["res"][i] > 2500) {
					if (isFired) {
						ssres.innerHTML = "Open";
						ssres.className = "normal_status";
					}
					else if (isConn) {
						ssres.innerHTML = "High Res";
						ssres.className = "warning_status";
					}
					else {
						ssres.innerHTML = "Stale: High Res";
						ssres.className = "warning_status";
					}
				}
				else if (telemetry[board]["res"][i] < 700) {
					if (isFired) {
						ssres.innerHTML = "Low Res";
						ssres.className = "warning_status";
					}
					else if (isConn) {
						ssres.innerHTML = "Low Res";
						ssres.className = "warning_status";
					}
					else {
						ssres.innerHTML = "Stale: Low Res";
						ssres.className = "warning_status";
					}
				}
				else {
					if (isFired) {
						ssres.innerHTML = "Match Res";
						ssres.className = "error_status";
					}
					else if (isConn) {
						ssres.innerHTML = "Good Match";
						ssres.className = "good_status";
					}
					else {
						ssres.innerHTML = "Stale: Good Match";
						ssres.className = "warning_status";
					}
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

	// show arm and connection status
	var swarms = 0;
	var noswarms = 0;
	var swarm_val = "unknown";
	var swarm_class = "error_status";
	var hwarms = 0;
	var nohwarms = 0;
	var hwarm_val = "unknown";
	var hwarm_class = "error_status";
	var conns = 0;
	var noconns = 0;
	var conn_val = "No Connections";
	var conn_class = "error_status";
	for (board in boardinfo) {
		if (show.boards[board].location != "inactive") {
			if (telemetry[board].connection == "active") {
				conns = conns + 1;
			}
			else {
				noconns = noconns + 1;
			}

			if (telemetry[board].swarm == "1") {
				swarms = swarms + 1;
			}
			else {
				noswarms = noswarms + 1;
			}

			if (telemetry[board].hwarm == "ARMED") {
				hwarms = hwarms + 1;
			}
			else {
				nohwarms = nohwarms + 1;
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

	if (swarms == 0) {
		swarm_val = "ALL DISARMED";
		swarm_class = "error_status";
	}
	else if (noswarms == 0) {
		swarm_val = "ALL ARMED";
		swarm_class = "good_status";
	}
	else {
		swarm_val = swarms + " ARMED; " + noswarms + " DISARMED";
		swarm_class = "warning_status";
	}
	var showswarmstatus = document.getElementById("show_swarm_status");
	if (showswarmstatus != null) {
		showswarmstatus.className = swarm_class;
		showswarmstatus.innerHTML = swarm_val;
	}

	if (hwarms == 0) {
		hwarm_val = "ALL DISARMED";
		hwarm_class = "error_status";
	}
	else if (nohwarms == 0) {
		hwarm_val = "ALL ARMED";
		hwarm_class = "good_status";
	}
	else {
		hwarm_val = hwarms + " ARMED; " + nohwarms + " DISARMED";
		hwarm_class = "warning_status";
	}
	var showhwarmstatus = document.getElementById("show_hwarm_status");
	if (showhwarmstatus != null) {
		showhwarmstatus.className = hwarm_class;
		showhwarmstatus.innerHTML = hwarm_val;
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
		cmdcount = document.getElementById(board+"_cmdrequests");
		if (cmdcount != null) {
			cmdcount.innerHTML = predictions[board]["cmdrequests"];
		}
		cmdcount = document.getElementById(board+"_cmdresponses");
		if (cmdcount != null) {
			cmdcount.innerHTML = predictions[board]["cmdresponses"];
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

socket.on('tick clock', function(show_clock_val, jump) {
	var show_clock = document.getElementById("show_clock");
	if (show_clock != null) {
		show_clock.innerHTML = show_clock_val;
	}

	var now_bar = document.getElementById("now_bar");
	if (now_bar != null) {
		now_bar.children[0].innerHTML = "Show Clock: " + show_clock_val;
		var groups = document.getElementsByClassName("show-table");
		var inserted = false;
		for (var i = 0; i < groups.length; i++) {
			var grouptime = document.getElementById("time_"+groups[i].id).innerHTML;
			if (parseFloat(grouptime) > show_clock_val) {
				now_bar.parentNode.insertBefore(now_bar, groups[i]);
				inserted = true;
				break;
			}
		}
		if (inserted == false) {
			now_bar.parentNode.insertBefore(now_bar, null);
		}

		for (var i = 0; i < groups.length; i ++) {
			var grouptime = document.getElementById("time_"+groups[i].id).innerHTML;
			var countdown = show_clock_val - parseFloat(grouptime);
			countdown = countdown.toFixed(1);
			var cdel = document.getElementById("countdown_"+groups[i].id);
			var grouptable = document.getElementById("group_table_"+groups[i].id);
			if (cdel != null) {
				if (countdown < 0) {
					cdel.innerHTML = "T"+countdown;
					var children = grouptable.getElementsByTagName('*');
					for (var k = 0; k < children.length; k++) {
						if (children[k].id.includes("showstatus")) {
							if ((children[k].innerHTML == "firing...") || (children[k].innerHTML == "BAD FIRE")) {
								children[k].innerHTML = "try again?";
								children[k].className = "warning_status";
							}
						}
					}
				}
				else {
					cdel.innerHTML = "T+"+countdown;
					if ((countdown < 0.09) && (jump == false)) {
						//cdel.className = "group_fired_status";
						grouptable.className = "group-fired-table";
						var children = grouptable.getElementsByTagName('*');
						for (var k = 0; k < children.length; k++) {
							if (children[k].id.includes("showstatus")) {
								children[k].innerHTML = "firing...";
								children[k].className = "firing_status";
							}
						}
					}
					else {
						//cdel.className = "normal_status";
						if (countdown > 0.5) {
							grouptable.className = "table";
						}
						if (countdown > 4) {
							var children = grouptable.getElementsByTagName('*');
							for (var k = 0; k < children.length; k++) {
								if (children[k].id.includes("showstatus")) {
									if (children[k].innerHTML == "firing...") {
										children[k].innerHTML = "BAD FIRE";
										children[k].className = "error_status";
									}
								}
							}
						}
					}
				}
			}
		}
	}
});



