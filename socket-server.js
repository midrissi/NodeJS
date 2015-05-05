var socket = require('./server/components/socket');
var Server = socket.Server;
var config = require('./server/config/environment');

new Server({
	port: process.env.SOCKET_PORT
}).start();