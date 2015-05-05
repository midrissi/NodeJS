var Q = require('q');
var net = require('net');
var util = require('util');
var events = require('events');

function Client(config) {
	events.EventEmitter.call(this);

	this.connected = false;
	this.socket = null;

	this.init(config);
}

util.inherits(Client, events.EventEmitter);

Client.prototype.init = function(config) {
	config = config && typeof config === 'object' ? config : {};

	config.host = config.host || '127.0.0.1';
	config.port = isNaN(config.port) ? 4000 : parseInt(config.port);

	this.config = config;
};

Client.prototype.available = function() {
	this.send({
		type: 'available'
	});
};

Client.prototype.connect = function(config, isClient) {
	var that = this;

	if (config) {
		that.init(config);
	}

	return Q.Promise(function(resolve, reject) {
		var socket = that.socket = net.connect(that.config, function() {
			that.connected = true;

			if (isClient === true) {
				socket.write(JSON.stringify({
					type: 'init'
				}));
			}

			resolve();
		});

		socket.on('data', function(data) {
			try {
				data = JSON.parse(data);
				if (data && data.type != 'init') {
					that.emit('data', data);
				}
			} catch (e) {

			}
		});

		socket.on('end', function() {
			that.emit('end');
		});
	});
};

Client.prototype.close = function() {
	if (this.socket) {
		this.socket.end();
	}
};

Client.prototype.send = function(data, close) {
	var closeIt = function closeIt() {
		if (close === true) {
			this.close();
		}
	};

	closeIt.bind(this);

	if (this.connected) {
		this.socket.write(JSON.stringify(data));
		closeIt();
	} else {
		var that = this;
		var args = arguments;

		that
			.connect()
			.then(function() {
				that.send.apply(that, args);
				closeIt();
			});
	}

	return this;
};

module.exports = Client;