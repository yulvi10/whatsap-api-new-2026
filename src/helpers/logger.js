'use strict';

const fs = require('fs');
const path = require('path');

const {
    createLogger,
    format,
    transports
} = require('winston');

const config = require('../config/config');

/**
 * ==========================================================
 * Create Logs Directory
 * ==========================================================
 */

if (!fs.existsSync(config.logPath)) {

    fs.mkdirSync(config.logPath, {
        recursive: true
    });

}

/**
 * ==========================================================
 * Logger Format
 * ==========================================================
 */

const logFormat = format.combine(

    format.timestamp({

        format: 'YYYY-MM-DD HH:mm:ss'

    }),

    format.printf(({

        timestamp,
        level,
        message

    }) => {

        return `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    })

);

/**
 * ==========================================================
 * Logger
 * ==========================================================
 */

const logger = createLogger({

    level: config.logLevel,

    format: logFormat,

    transports: [

        /**
         * Console
         */
        new transports.Console({

            format: format.combine(

                format.colorize(),

                format.timestamp({

                    format: 'YYYY-MM-DD HH:mm:ss'

                }),

                format.printf(({

                    timestamp,
                    level,
                    message

                }) => {

                    return `[${timestamp}] [${level}] ${message}`;

                })

            )

        }),

        /**
         * App Log
         */
        new transports.File({

            filename: path.join(

                config.logPath,

                'app.log'

            ),

            level: 'info'

        }),

        /**
         * Error Log
         */
        new transports.File({

            filename: path.join(

                config.logPath,

                'error.log'

            ),

            level: 'error'

        }),

        /**
         * WhatsApp Log
         */
        new transports.File({

            filename: path.join(

                config.logPath,

                'whatsapp.log'

            ),

            level: 'verbose'

        })

    ],

    exitOnError: false

});

/**
 * ==========================================================
 * Helper Method
 * ==========================================================
 */

logger.success = function (message) {

    logger.info(`✅ ${message}`);

    const logFile = require('../services/logService');

    logFile.info(message);

};

logger.warning = function (message) {

    logger.warn(`⚠️ ${message}`);

    const logFile = require('../services/logService');

    logFile.info(message);

};

logger.whatsapp = function (message) {

    logger.verbose(`[WHATSAPP] ${message}`);

};

logger.queue = function (message) {

    logger.info(`[QUEUE] ${message}`);

    const logFile = require('../services/logService');

    logFile.info(message);

};

logger.api = function (message) {

    logger.info(`[API] ${message}`);

    const logFile = require('../services/logService');

    logFile.info(message);

};

module.exports = logger;