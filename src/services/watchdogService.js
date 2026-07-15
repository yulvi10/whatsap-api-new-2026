'use strict';

const logger = require('../helpers/logger');
const whatsapp = require('./whatsappService');

class WatchdogService {

    constructor() {

        this.interval = null;

        this.running = false;

        this.failCount = 0;

        this.maxFail = 3;

    }

    async check() {

        if (this.running) {

            return;

        }

        this.running = true;

        try {

            const ready = whatsapp.isReady();

            const status = whatsapp.getStatus();

            logger.info(

                `[WATCHDOG] READY=${ready} STATUS=${status}`

            );

            if (!ready) {

                this.failCount++;

                logger.warn(

                    `[WATCHDOG] Disconnect detected (${this.failCount}/${this.maxFail})`

                );

                try {

                    const reconnect = require('./reconnectService');

                    await reconnect.reconnect();

                    logger.info(

                        '[WATCHDOG] Restart success'

                    );

                    this.failCount = 0;

                } catch (err) {

                    logger.error(err);

                }

            } else {

                this.failCount = 0;

            }

        } catch (err) {

            logger.error(err);

        }

        this.running = false;

    }

    start() {

        if (this.interval) {

            return;

        }

        logger.info(

            '[WATCHDOG] Started'

        );

        this.interval = setInterval(

            () => this.check(),

            30000

        );

    }

    stop() {

        if (this.interval) {

            clearInterval(this.interval);

            this.interval = null;

        }

        logger.info(

            '[WATCHDOG] Stopped'

        );

    }

}

module.exports = new WatchdogService();