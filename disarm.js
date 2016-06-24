
var net = require('net');

var client = new net.Socket();

client.connect(23, '192.168.0.106', function() {
	console.log('connected');
	client.write('disarm');
});

client.on('data', function(data) {
	console.log('data: ' + data);
	client.destroy();
});

client.on('close', function() {
	console.log('connection closed');
});

