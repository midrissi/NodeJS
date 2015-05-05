var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var Q = require('q');
var fs = require('fs');
var config = require('./server/config/environment');
var exec = require('child_process').exec;

// The socket client
var Client = require('./server/components/socket').Client;
var client = new Client();

// Connect to the mongodb server
mongoose.connect(config.mongo.uri);

// Configure the GridFS module
Grid.mongo = mongoose.mongo;
var gfs = Grid(mongoose.connection.db);

// Connect to the socket server
client.connect(config.socket, true);

// Listen the incoming data
client.on('data', function(data) {
	switch (data.command) {
		case 'convert':
			var d = data.data;

			if (!d || !d._id) {
				console.error('Invalid incoming message.');
				client.available();
				return;
			}

			gfs.findOne(d, function(err, file) {
				if (err) {
					console.error('GridFS error.');
					return client.available();
				}

				var readstream = gfs.createReadStream(d);
				var fs_write_stream = fs.createWriteStream(file.filename);

				readstream.pipe(fs_write_stream);
				fs_write_stream.on('close', function() {
					exec('./script.sh "' + fs_write_stream.path + '"', function(error, stdout, stderr) {
						console.log('stdout: ' + stdout);
					});
				});
				client.available();
			});
			break;
	}
});