
var fs = require("fs");

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017';

const dbName = 'magicsmoke';


var command = process.argv[2];
var repeat = process.argv[3];


MongoClient.connect(url, function(err, client) {
	assert.equal(null, err);

	const db = client.db(dbName);

	const col = db.collection('eventlog');

	var eventlog = [];

	if (command == "dump") {
		col.find({}).each(function(err, doc) {
			if (doc) {
				//console.log(doc);
				eventlog.push(doc);
			}
			else {
				client.close();
				var json = JSON.stringify(eventlog);
				fs.writeFile('eventlog.json', json, 'utf8', function(err) {
					if (err) throw err;
				});
				console.log("wrote event log");
				return false;
			}
		});
	}
	else if (command == "clean") {
		if (repeat == "clean") {
			col.deleteMany({}, function(err, r) {
				assert.equal(null, err);
				console.log(r.deletedCount);
				client.close();
			});
		}
		else {
			console.log("no repeat");
			client.close();
		}
	}
	else {
		client.close();
	}
});


