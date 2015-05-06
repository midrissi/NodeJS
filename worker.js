var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var Q = require('q');
var fs = require('fs');
var config = require('./server/config/environment');
var exec = require('child_process').exec;
var input = '.input/';
var output = '.output/';

// The socket client
var Client = require('./server/components/socket').Client;
var client = new Client();

// Create the temp folders if deos not exist
Q.denodeify(fs.lstat)(input).catch(function () {
	fs.mkdir(input);
});
Q.denodeify(fs.lstat)(output).catch(function () {
	fs.mkdir(output);
});

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

				console.log('working...');

				var readstream = gfs.createReadStream(d);
				var fname = file.filename;
				fname = fname.substr(0, fname.lastIndexOf('.'))
				var fs_write_stream = fs.createWriteStream('.input/' + file.filename);

				readstream.pipe(fs_write_stream);
				fs_write_stream.on('close', function() {
					exec('./script.sh "' + fs_write_stream.path + '"', function(error, stdout, stderr) {
						if(stderr){
							console.error('stderr: ' + stderr);
							return client.available();
						}
						
						var s = fs.createReadStream('.output/' + fname + '.pdf');
						var writestream = gfs.createWriteStream({
							_id: d._id,
							content_type: 'application/pdf',
							filename: fname + '.pdf'
						});
						s.pipe(writestream);
						writestream.on('error', function() {
							console.log('error while writing to mongoDB');
							client.available();
						});
						writestream.on('close', function(file) {
							fs.unlink('.output/' + fname + '.pdf');
							console.log('done.');
							client.available();
						});
					});
				});
			});
			break;
	}
});