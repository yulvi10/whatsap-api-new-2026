'use strict';

const whatsapp = require('../services/whatsappService');

/*
|--------------------------------------------------------------------------
| START GATEWAY
|--------------------------------------------------------------------------
*/

exports.start = async (req, res) => {

    try {

        if (whatsapp.isReady()) {

            return res.json({

                success: true,

                running: true,

                message: 'Gateway already running'

            });

        }

        await whatsapp.start();

        return res.json({

            success: true,

            running: true,

            message: 'Gateway started'

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            running: false,

            message: err.message

        });

    }

};

/*
|--------------------------------------------------------------------------
| STOP GATEWAY
|--------------------------------------------------------------------------
*/

exports.stop = async (req, res) => {

    try {

        await whatsapp.shutdown();

        return res.json({

            success: true,

            running: false,

            message: 'Gateway stopped'

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            running: true,

            message: err.message

        });

    }

};

/*
|--------------------------------------------------------------------------
| RESTART GATEWAY
|--------------------------------------------------------------------------
*/

exports.restart = async (req, res) => {

    try {

        await whatsapp.restart();

        return res.json({

            success: true,

            running: true,

            message: 'Gateway restarted'

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

/*
|--------------------------------------------------------------------------
| RECONNECT GATEWAY
|--------------------------------------------------------------------------
*/

exports.reconnect = async (req, res) => {

    try {

        await whatsapp.restart();

        return res.json({

            success: true,

            running: true,

            message: 'Gateway reconnected'

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

/*
|--------------------------------------------------------------------------
| LOGOUT DEVICE
|--------------------------------------------------------------------------
*/

exports.logout = async (req, res) => {

    try {

        await whatsapp.logout();

        return res.json({

            success: true,

            running: false,

            message: 'Logout success'

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

/*
|--------------------------------------------------------------------------
| GATEWAY STATUS
|--------------------------------------------------------------------------
*/

exports.status = async (req, res) => {

    return res.json({

        success: true,

        running: whatsapp.isReady(),

        status: whatsapp.getStatus(),

        phone: whatsapp.getPhoneNumber(),

        qr: whatsapp.getQRCode()

    });

};