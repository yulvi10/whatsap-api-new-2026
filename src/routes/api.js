'use strict';

const express = require('express');

const router = express.Router();

const messageController = require('../controllers/messageController');


router.get('/', (req, res) => {

    res.json({

        success: true,

        message: 'AICA WhatsApp API',

        version: '4.0.0'

    });

});

// router.get('/', (req, res) => {

//     res.json({

//         success: true,

//         app: 'AICA WhatsApp Gateway',

//         version: '3.0.0'

//     });

// });

router.get('/health', messageController.health);

router.get('/send-message', messageController.sendMessage);

module.exports = router;