var Client = require('ftp');
var fs = require('fs');

var c = new Client();
c.on('ready', function() {
	c.put('foo.txt', '/tmp/foo.remote-copy.txt', function(err) {
		if (err) throw err;
		c.end();
	});
});

c.connect({
	host: process.env.FTP_HOST,
	port: process.env.FTP_PORT,
	user: process.env.FTP_USER,
	password: process.env.FTP_PASSWORD
});