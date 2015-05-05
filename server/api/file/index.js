'use strict';

var express = require('express');
var controller = require('./file.controller');

//var router = express.Router();
var prefix = '/api/files';
app.get(prefix + '/', controller.index);
app.get(prefix + '/:id', controller.show);
app.post(prefix + '/', controller.create);
app.delete(prefix + '/:id', controller.destroy);

module.exports = {};