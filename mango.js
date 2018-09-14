
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

	if (command == "seed") {
		if (repeat == "boards") {
			// read boardinfo.json
			var contents = fs.readFileSync("boardinfo.json");
			var boardinfo = JSON.parse(contents);
			// create board entries
			db.collection('boards').deleteMany({}, function(err, r) {
				assert.equal(null, err);
				console.log(r.deletedCount);
				
				for (board in boardinfo) {
					console.log(boardinfo[board]['name']);
					var sname = boardinfo[board]['sname'];
					var name = boardinfo[board]['name'];
					var bid = boardinfo[board]['id'];
					var comments = boardinfo[board]['comments'];
					var blocation = "inactive";
					var channels = [{"group":"", "effect":""},{"group":"", "effect":""},{"group":"", "effect":""},{"group":"", "effect":""},{"group":"", "effect":""},{"group":"", "effect":""},{"group":"", "effect":""},{"group":"", "effect":""}];
					db.collection('boards').insertOne({sname: sname, name: name, id: bid, comments: comments, location: blocation, channels: channels}, function(err, r) {
						assert.equal(null, err);
						assert.equal(1, r.insertedCount);
					}); 
				}
			});
		}
		else {
			console.log("unknown seed");
		}
	}
	else if (command == "dump") {
		db.collection('eventlog').find({}).each(function(err, doc) {
			if (doc) {
				//console.log(doc);
				eventlog.push(doc);
			}
			else {
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
			db.collection('eventlog').deleteMany({}, function(err, r) {
				assert.equal(null, err);
				console.log(r.deletedCount);
			});
		}
		else {
			console.log("no repeat");
		}
	}

	var closeclient = setTimeout(function() {
		client.close();
	}, 2000);
});


