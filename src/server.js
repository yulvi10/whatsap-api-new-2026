'use strict';

const express = require('express');
const path = require('path');

const config = require('./config/config');
const logger = require('./helpers/logger');

const whatsapp = require('./services/whatsappService');
const scheduler = require('./services/schedulerService');
const queue = require('./services/queueService');
const watchdog = require('./services/watchdogService');

const dashboardRoutes = require('./routes/dashboard');
const apiRoutes = require('./routes/api');

const http = require('http');

const socket = require('./socket/socket');

const expressLayouts =
    require('express-ejs-layouts');

const app = express();
const server = http.createServer(app);
/*
|--------------------------------------------------------------------------
| View Engine
|--------------------------------------------------------------------------
*/

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);

app.set(
    'layout',
    'layouts/master'
);

app.set(
    'layout extractScripts',
    true
);

app.set(
    'layout extractStyles',
    true
);

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


// API Baru
app.use('/api', apiRoutes);
const gatewayRoutes = require('./routes/gateway');
console.log('Register Gateway Route');

console.log('Mount : /api/gateway');

app.use('/api/gateway', gatewayRoutes);

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

        socket.initialize(server);

        scheduler.start();

        watchdog.start();

        const health = require('./services/healthService');

        setInterval(() => {

            socket.emitHealth(

                health.getHealth()

            );

            socket.emitQueue({

                waiting: queue.size(),

                processing: queue.pending(),

                ...queue.statistics()

            });

        },1000);

        server.listen(config.port,config.host,()=>{

            logger.info('==========================================');
            logger.info('AICA WhatsApp Gateway v5');
            logger.info('==========================================');
            logger.info(`URL : http://localhost:${config.port}`);
            logger.info('Dashboard Ready');
            logger.info('Gateway Status : STOPPED');
            logger.info('==========================================');

        });

    }

    catch(err){

        logger.error(err);

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