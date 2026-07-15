'use strict';

const config = require('../config/config');
const logger = require('../helpers/logger');

/**
 * ==========================================================
 * Authentication Middleware
 * ==========================================================
 */

module.exports = (req, res, next) => {

    try {

        const token =
            req.headers['x-token'] ||
            req.headers['authorization'] ||
            req.body.token ||
            req.query.token;

        if (!token) {

            logger.warning(

                `${req.method} ${req.originalUrl} -> Token Required`

            );

            return res.status(401).json({

                success: false,

                message: 'Token Required'

            });

        }

        if (token !== config.token) {

            logger.warning(

                `${req.method} ${req.originalUrl} -> Invalid Token`

            );

            return res.status(403).json({

                success: false,

                message: 'Invalid Token'

            });

        }

        next();

    }
    catch (err) {

        logger.error(err.stack);

        return res.status(500).json({

            success: false,

            message: 'Authentication Error'

        });

    }

};