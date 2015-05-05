'use strict';

var fs = require('fs');
var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var gfs = Grid(mongoose.connection.db, mongoose.mongo);
var formidable = require('formidable');
var Client = require('../../components/socket').Client;


// Get list of files
exports.index = function(req, res) {
	gfs.files.find({}).toArray(function(err, files) {
		if (err) {
			return handleError(res, err);
		}
		return res.json(files);
	})
};

// Get a single file
exports.show = function(req, res) {
	gfs.findOne({
		_id: req.params.id
	}, function(err, file) {
		if (err) {
			return handleError(res, err);
		}
		if (!file) {
			return res.send(404);
		}
		return res.json(file);
	});
};

// Creates a new file in the DB.
exports.create = function(req, res) {
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
		if (err) {
			return handleError(res, err);
		}

		var f = files.file;

		if (!f) {
			return res.status(400).json({
				error: 'Validation Error: No file specified'
			});
		}

		var types = [
			'application/msword',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'application/pdf',
			'application/vnd.openxmlformats-officedocument.presentationml.presentation',
			'application/vnd.ms-powerpointtd',
			'text/plain'
		];

		if (types.indexOf(files.file.type) < 0) {
			return res.status(400).json({
				error: 'Validation Error: Invalid file type.'
			});
		}

		var writestream = gfs.createWriteStream({
			filename: f.name,
			content_type: f.type,
			metadata: fields
		});

		var s = fs.createReadStream(f.path);
		s.pipe(writestream);
		writestream.on('error', function() {
			return res.status(400).json({
				error: 'Error: File error.'
			});
		});
		writestream.on('close', function(file) {
			new Client(config.socket).send({
				type: 'convert',
				data: {
					_id: file._id
				}
			}, true);
			return res.status(200).json({
				result: true
			});
		});
	});
};

// Deletes a file from the DB.
exports.destroy = function(req, res) {
	gfs.findOne({
		_id: req.params.id
	}, function(err, file) {
		if (err) {
			return handleError(res, err);
		}
		if (!file) {
			return res.send(404);
		}
		gfs.remove({
			_id: req.params.id
		}, function(err) {
			if (err) return handleError(err);
			return res.send(204);
		});
	});
};

function handleError(res, err) {
	return res.send(500, err);
}