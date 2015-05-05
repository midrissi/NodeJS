var net = require('net');
var util = require('util');
var events = require('events');

function Server(config) {
	events.EventEmitter.call(this);

	this.clients = [];
	this.server = null;
	this.started = false;

	this.init(config);
}

util.inherits(Server, events.EventEmitter);

Server.prototype.init = function(config) {
	config = config && typeof config === 'object' ? config : {};

	config.host = config.host || '0.0.0.0';
	config.port = isNaN(config.port)? 4000: parseInt(config.port);

	this.config = config;
};

Server.prototype.start = function(config) {
	var that = this;

	if(config){
		this.init(config);
	}

	var server = this.server = net.createServer(function(c) {
		console.log('connected');

		c.on('end', function() {
			for (var i = that.clients.length - 1; i >= 0; i--) {
				if (that.clients[i] == c) {
					that.clients.splice(i, 1);
				}
			}
		});

		c.on('data', function(d) {
			try {
				d = JSON.parse(d);

				if(!d.type || typeof d.type !== 'string'){
					return;
				}

				switch (d.type) {
					case 'init':
						c.busy = false;
						that.clients.push(c);
						break;
					case 'available':
						c.busy = false;
						break;
					default:
						for (var i = that.clients.length - 1; i >= 0; i--) {
							var socket = that.clients[i];
							if (!socket.busy) {
								socket.write(JSON.stringify({
									command: d.type,
									data: d.data
								}));
								socket.busy = true;
								return;
							}
						}
						break;
				}
			} catch (e) {

			}
		});
		c.pipe(c);
	});
	
	server.listen(this.config.port, this.config.host, function() {
		this.started = true;
		console.log('Server listening!')
	});
};

module.exports = Server;