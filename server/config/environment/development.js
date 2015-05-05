'use strict';

// Development specific configuration
// ==================================
module.exports = {
	// MongoDB connection options
	socket: {
		port: process.env.SOCKET_PORT || 4000,
		host: process.env.SOCKET_HOST || process.env.IP || '127.0.0.1'
	},
	ip: process.env.IP ||
		'0.0.0.0',

	// Server port
	port: process.env.PORT ||
		8080,

	// MongoDB connection options
	mongo: {
		uri: process.env.MONGODB_URL ||
			'mongodb://localhost/fileconverter'
	}
};