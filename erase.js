var fs = require('fs');
var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var config = require('./server/config/environment');

mongoose.connect(config.mongo.uri);

Grid.mongo = mongoose.mongo;
var gfs = Grid(mongoose.connection.db);

mongoose.connection.once('open', function() {
	var s = fs.createReadStream('Classeur1.xlsx');
	var writestream = gfs.createWriteStream({
		filename: 'Classeur1.xlsx',
		content_type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
	});
	s.pipe(writestream);
	writestream.on('error', function() {
		console.log('error while writing to mongoDB');
	});
	writestream.on('close', function(file) {
		console.log(file);
	});
});

// var http = require('http');
// http.createServer(function(req, res) {
// 	res.writeHead(200, {
// 		'Content-Type': 'application/pdf'
// 	});
// 	gfs.createReadStream({
// 		_id: '5548db611be5be3271be369b'
// 	}).pipe(res);
// }).listen(1337, '127.0.0.1');
// console.log('Server running at http://127.0.0.1:1337/');