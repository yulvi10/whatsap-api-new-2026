'use strict';

const queue = require('../services/queueService');
const whatsapp = require('../services/whatsappService');
const config = require('../config/config');
const health = require('../services/healthService');


exports.health = async (req, res) => {

    res.json(

        health.getHealth()

    );

    // return res.json({

    //     success: true,

    //     app: config.appName,

    //     ready: whatsapp.isReady(),

    //     status: whatsapp.getStatus(),

    //     phone: whatsapp.getPhoneNumber(),

    //     queue: {

    //         waiting: queue.size(),

    //         processing: queue.pending()

    //     }

    // });

};

exports.sendMessage = async (req, res) => {

    console.log('==========================');
    console.log('TOKEN REQUEST :', req.query.token);
    console.log('TOKEN CONFIG  :', config.token);
    console.log('==========================');

    try {

        const {

            token,

            number,

            message

        } = req.query;

        if (token !== config.token) {

            return res.status(401).json({

                status: false,

                code: 401,

                message: "Invalid Token"

            });

        }

        if (!number) {

            return res.status(400).json({

                status: false,

                code: 400,

                message: "Number is required"

            });

        }

        if (!message) {

            return res.status(400).json({

                status: false,

                code: 400,

                message: "Message is required"

            });

        }

        console.log('==============================');
        console.log('SEND MESSAGE REQUEST');
        console.log(number);
        console.log(message);
        console.log('==============================');

        const result = await queue.sendText(

            number,

            message

        );

        return res.status(200).json({

            status: true,

            code: 200,

            message: "Message sent successfully",

            number: number,

            result: result

        });

    } catch (err) {

        return res.status(500).json({

            status: false,

            code: 500,

            message: err.message

        });

    }

};