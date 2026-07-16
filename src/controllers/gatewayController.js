'use strict';

const whatsapp = require('../services/whatsappService');

exports.restart = async (req, res) => {

    try {

        await whatsapp.restart();

        return res.json({

            success: true,

            message: 'Gateway restarting'

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.logout = async (req, res) => {

    try {

        await whatsapp.logout();

        return res.json({

            success: true,

            message: 'Logout success'

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.reconnect = async (req, res) => {

    try {

        await whatsapp.restart();

        return res.json({

            success: true,

            message: 'Reconnect success'

        });

    } catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};