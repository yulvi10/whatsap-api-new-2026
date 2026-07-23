'use strict';

const express = require('express');

const router = express.Router();

const controller = require('../controllers/historyController');

router.get('/latest', controller.latest);

module.exports = router;