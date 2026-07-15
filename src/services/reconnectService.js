'use strict';

const logger = require('../helpers/logger');
const whatsapp = require('./whatsappService');

class ReconnectService {

    constructor() {

        this.isReconnecting = false;

        this.retry = 0;

        this.maxRetry = 5;

        this.delay = 5000;

    }

    async reconnect() {

        if (this.isReconnecting) {

            logger.warn('[RECONNECT] Already reconnecting');

            return false;

        }

        this.isReconnecting = true;

        while (this.retry < this.maxRetry) {

            try {

                this.retry++;

                logger.info(

                    `[RECONNECT] Attempt ${this.retry}/${this.maxRetry}`

                );

                await whatsapp.restart();

                if (whatsapp.isReady()) {

                    logger.info(

                        '[RECONNECT] SUCCESS'

                    );

                    this.retry = 0;

                    this.isReconnecting = false;

                    return true;

                }

            } catch (err) {

                logger.error(err);

            }

            logger.warn(

                `[RECONNECT] Waiting ${this.delay / 1000} seconds...`

            );

            await new Promise(resolve => {

                setTimeout(resolve, this.delay);

            });

        }

        logger.error(

            '[RECONNECT] FAILED'

        );

        this.retry = 0;

        this.isReconnecting = false;

        return false;

    }

}

module.exports = new ReconnectService();