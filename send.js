var Client = require('./server/components/socket').Client;
var config = {
	port: process.env.SOCKET_PORT,
	host: process.env.SOCKET_HOST
};

new Client(config).send({
	type: 'convert',
	data: {
		_id: '5547b9e46c9a63b9029fa125'
	}
}, true);