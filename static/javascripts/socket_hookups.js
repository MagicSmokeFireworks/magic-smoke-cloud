
var socket = io();

socket.on('fresh data', function(sname, telemetry) {
	// reset telemetry timer
	var y = document.getElementById(sname);
	y.getElementByClassName("datatimer")[0].innerHTML = "0";

	// firmware version
	firmver = document.getElementById(sname+"_firmver");
	firmver.innerHTML = telemetry["firmver"];

	// software arm
	swarm = document.getElementById(sname+"_swarm");
	if (telemetry["swarm"] == "no data") {
		swarm.innerHTML = "no data";
	}
	else if (telemetry["swarm"] == "0") {
		swarm.innerHTML = "SW DISARMED";
	}
	else {
		swarm.innerHTML = "SW ARMED";
	}

	// hardware arm
	hwarm = document.getElementById(sname+"_hwarm");
	hwarm.innerHTML = telemetry["hwarm"];

	// wifi rssi
	rssi = document.getElementById(sname+"_rssi");
	if (parseInt(telemetry["rssi"]) < -60) {
		rssi.className = "rb1sfading";
	}
	else {
		rssi.className = "";
	}
	rssi.innerHTML = telemetry["rssi"];

	// command count
	cmdcount = document.getElementById(sname+"_cmdcount");
	cmdcount.innerHTML = telemetry["cmdcount"];

	// resistance measurements
	for (var i = 0; i < 8; i++) {
		var res = document.getElementById(sname+"_res"+i);
		res.innerHTML = telemetry["res"][i];
	}

	// fire counts
	for (var i = 0; i < 8; i++) {
		var firecount = document.getElementById(sname+"_firecount"+i);
		firecount.innerHTML = telemetry["firecount"][i];
	}
});


socket.on('fresh predicts', function(sname, predictions) {

	// software arm
	swarm = document.getElementById(sname+"_swarm_predict");
	if (predictions["swarm"] == "1") {
		swarm.innerHTML = "SW ARMED";
	}
	else {
		swarm.innerHTML = "SW DISARMED";
	}
	

	// command count
	cmdcount = document.getElementById(sname+"_cmdcount_predict");
	cmdcount.innerHTML = predictions["cmdcount"];

	// resistance
	for (var i = 0; i < 8; i++) {
		var res = document.getElementById(sname+"_res"+i+"_predict");
		res.innerHTML = predictions["res"][i];
	}

	// fire counts
	for (var i = 0; i < 8; i++) {
		var firecount = document.getElementById(sname+"_firecount"+i+"_predict");
		firecount.innerHTML = predictions["firecount"][i];
	}
});


