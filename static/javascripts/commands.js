
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
