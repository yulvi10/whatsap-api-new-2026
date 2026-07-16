'use strict';

const express = require('express');

const router = express.Router();

const controller = require('../controllers/gatewayController');

router.post('/restart', controller.restart);

router.post('/logout', controller.logout);

router.post('/reconnect', controller.reconnect);

module.exports = router;