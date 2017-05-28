
var clickFire = function(id,channel) {
        var xhttp;
        xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/fire?id="+id+"&channels="+channel, true);
        xhttp.send();
};

var clickArm = function(id) {
        var xhttp;
        xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/arm?id="+id, true);
        xhttp.send();
};

var clickDisarm = function(id) {
        var xhttp;
        xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/disarm?id="+id, true);
        xhttp.send();
};

var clickIdentify = function(id) {
        var xhttp;
        xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/identify?id="+id, true);
        xhttp.send();
};

