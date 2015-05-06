'use strict';

var express = require('express');
var controller = require('./file.controller');

var router = express.Router();
router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.delete('/:id', controller.destroy);
router.delete('/', controller.destroyAll);

module.exports = router;

// var prefix = '/api/files';
// app.get(prefix + '/', controller.index);
// app.get(prefix + '/:id', controller.show);
// app.post(prefix + '/', controller.create);
// app.delete(prefix + '/:id', controller.destroy);
// app.delete(prefix, controller.destroyAll);

// module.exports = {};