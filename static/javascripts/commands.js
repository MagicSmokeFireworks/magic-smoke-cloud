
var clickFire = function(id,channel) {
        var xhttp;
        xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/fire?id="+id+"&channels="+channel, true);
        xhttp.send();
};

var groupClick = function(group) {
	var xhttp;
	xhttp = new XMLHttpRequest();
	xhttp.open("POST", "/firegroup?groupid="+group, true);
	xhttp.send();
};

var jumpToGroup = function(group) {
	var xhttp;
	xhttp = new XMLHttpRequest();
	xhttp.open("POST", "/jumptogroup?groupid="+group, true);
	xhttp.send();
};

var clickArm = function(id) {
        var xhttp;
        xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/arm?id="+id, true);
        xhttp.send();
};

var clickArmAll = function() {
        var xhttp;
        xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/armall", true);
        xhttp.send();
};

var clickDisarm = function(id) {
        var xhttp;
        xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/disarm?id="+id, true);
        xhttp.send();
};

var clickDisarmAll = function() {
        var xhttp;
        xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/disarmall", true);
        xhttp.send();
};

var clickStartClock = function() {
		var xhttp;
		xhttp = new XMLHttpRequest();
		xhttp.open("POST", "/startclock", true);
		xhttp.send();
};

var clickStopClock = function() {
		var xhttp;
		xhttp = new XMLHttpRequest();
		xhttp.open("POST", "/stopclock", true);
		xhttp.send();
};

var clickClockPlus = function() {
		var xhttp;
		xhttp = new XMLHttpRequest();
		xhttp.open("POST", "/clockplus", true);
		xhttp.send();
};

var clickClockMinus = function() {
		var xhttp;
		xhttp = new XMLHttpRequest();
		xhttp.open("POST", "/clockminus", true);
		xhttp.send();
};

var clickIdentify = function(id) {
        var xhttp;
        xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/identify?id="+id, true);
        xhttp.send();
};

var addBoard = function(id) {
	var xhttp;
	xhttp = new XMLHttpRequest();
	xhttp.open("POST", "/configshow?id="+id, true);
	xhttp.send();
};

var addNewGroup = function() {

	var table = document.getElementById("group_table");

	var row = table.insertRow(-1);

	var cell0 = row.insertCell(0);
	var cell1 = row.insertCell(1);
	var cell2 = row.insertCell(2);

	cell0.innerHTML = "<input type=\"text\" name=\"group_id[]\" value=\"none\" />";
	cell1.innerHTML = "<input class=\"group_desc\" type=\"text\" name=\"group_desc[]\" value=\"none\" />";

	cell2.innerHTML = "";
};

var deleteGroup = function(rowid) {

	var table = document.getElementById("group_table");

	var row = document.getElementById(rowid);

	table.deleteRow(row.rowIndex);
};

var saveGroups = function() {
	
};

var toggleShowAll = function() {
	var showallbutton = document.getElementById("toggleshowall");
	if (showallbutton != null) {
		showallbutton.id = "toggleshowhide";
		showallbutton.innerHTML = "Hide Non-configured Boards";
		var nonconfigrows = document.getElementsByClassName("nonconfigrow");
		var i;
		for (i = 0; i < nonconfigrows.length; i++) {
			nonconfigrows[i].classList.remove("hiddenrow");
		}
	}
	else {
		var showhidebutton = document.getElementById("toggleshowhide");
		showhidebutton.id = "toggleshowall";
		showhidebutton.innerHTML = "Show all Boards";
		var nonconfigrows = document.getElementsByClassName("nonconfigrow");
		var i;
		for (i = 0; i < nonconfigrows.length; i++) {
			nonconfigrows[i].classList.add("hiddenrow");
		}
	}
};

