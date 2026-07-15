'use strict';

const logger = require('../helpers/logger');

const watchdog = require('./watchdogService');
const health = require('./healthService');
const queue = require('./queueService');

const socket = require('../socket/socket');

class SchedulerService {

    constructor() {

        this.jobs = [];

    }

    start() {

        logger.info('[SCHEDULER] Starting...');

        /*
        |--------------------------------------------------------------------------
        | Watchdog
        |--------------------------------------------------------------------------
        */

        this.jobs.push(setInterval(() => {

            watchdog.check();

        }, 30000));

        /*
        |--------------------------------------------------------------------------
        | Queue Monitor
        |--------------------------------------------------------------------------
        */

        this.jobs.push(setInterval(() => {

            logger.info(

                `[QUEUE] Waiting=${queue.size()} Processing=${queue.pending()}`

            );

        }, 60000));

        /*
        |--------------------------------------------------------------------------
        | Health Monitor
        |--------------------------------------------------------------------------
        */

        this.jobs.push(setInterval(() => {

            const info = health.getHealth();

            logger.info(

                `[HEALTH] READY=${info.whatsapp.ready} STATUS=${info.whatsapp.status}`

            );

        }, 60000));

        logger.info('[SCHEDULER] Started');

    }

    stop() {

        logger.warn('[SCHEDULER] Stop');

        this.jobs.forEach(clearInterval);

        this.jobs = [];

    }



}
setInterval(() => {

    socket.emit(

        'health',

        health.getHealth()

    );

}, 2000);

module.exports = new SchedulerService();