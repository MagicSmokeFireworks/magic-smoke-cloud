
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

