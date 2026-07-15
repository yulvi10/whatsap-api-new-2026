'use strict';

const express = require('express');
const path = require('path');

const config = require('./config/config');
const logger = require('./helpers/logger');

const whatsapp = require('./services/whatsappService');
const scheduler = require('./services/schedulerService');
const watchdog = require('./services/watchdogService');

const dashboardRoutes = require('./routes/dashboard');
const apiRoutes = require('./routes/api');

const http = require('http');

const socket = require('./socket/socket');

const app = express();
const server = http.createServer(app);
/*
|--------------------------------------------------------------------------
| View Engine
|--------------------------------------------------------------------------
*/

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/*
|--------------------------------------------------------------------------
| Static Files
|--------------------------------------------------------------------------
*/

app.use(express.static(path.join(__dirname, 'public')));

/*
|--------------------------------------------------------------------------
| Body Parser
|--------------------------------------------------------------------------
*/

app.use(express.json({
    limit: '20mb'
}));

app.use(express.urlencoded({
    extended: true,
    limit: '20mb'
}));

app.disable('x-powered-by');

/*
|--------------------------------------------------------------------------
| Request Logger
|--------------------------------------------------------------------------
*/

app.use((req, res, next) => {

    logger.info(`${req.method} ${req.originalUrl}`);

    next();

});

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/
// Dashboard
app.use('/', dashboardRoutes);

// API Lama (Backward Compatible)
app.use('/', apiRoutes);

// API Baru
app.use('/api', apiRoutes);

/*
|--------------------------------------------------------------------------
| 404
|--------------------------------------------------------------------------
*/

app.use((req, res) => {

    return res.status(404).json({

        success: false,

        message: 'Endpoint Not Found'

    });

});

/*
|--------------------------------------------------------------------------
| Error Handler
|--------------------------------------------------------------------------
*/

app.use((err, req, res, next) => {

    logger.error(err.stack || err);

    return res.status(500).json({

        success: false,

        message: err.message || 'Internal Server Error'

    });

});

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

async function startServer() {

    try {

        await whatsapp.start();

        scheduler.start();

        watchdog.start();

        socket.initialize(server);

        server.listen(config.port, config.host, () => {

            logger.info('==========================================');
            logger.info('AICA WhatsApp Gateway v4');
            logger.info('==========================================');
            logger.info(`URL : http://localhost:${config.port}`);
            logger.info(`API : http://localhost:${config.port}/api`);
            logger.info('Gateway Ready');
            logger.info('==========================================');

        });

        // app.listen(config.port, config.host, () => {

        //     logger.info('==========================================');
        //     logger.info('AICA WhatsApp Gateway v4');
        //     logger.info('==========================================');
        //     logger.info(`URL : http://localhost:${config.port}`);
        //     logger.info(`API : http://localhost:${config.port}/api`);
        //     logger.info('Gateway Ready');
        //     logger.info('==========================================');

        // });

    } catch (err) {

        logger.error(err);

        process.exit(1);

    }

}

/*
|--------------------------------------------------------------------------
| Shutdown
|--------------------------------------------------------------------------
*/

async function shutdown(signal) {

    logger.warn(`${signal} received`);

    try {

        scheduler.stop();

        watchdog.stop();

        await whatsapp.shutdown();

    } catch (err) {

        logger.error(err);

    }

    process.exit(0);

}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();

module.exports = app;