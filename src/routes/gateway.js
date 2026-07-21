'use strict';

const express = require('express');

const router = express.Router();

const gateway = require('../controllers/gatewayController');

console.log('Gateway routes loaded');

/*
|--------------------------------------------------------------------------
| Gateway Lifecycle
|--------------------------------------------------------------------------
*/

router.get('/status', gateway.status);

router.post('/start', gateway.start);

router.post('/stop', gateway.stop);

router.post('/restart', gateway.restart);

router.post('/reconnect', gateway.reconnect);

router.post('/logout', gateway.logout);

module.exports = router;