'use strict';

const PQueue = require('p-queue').default;

const whatsapp = require('./whatsappService');
const logger = require('../helpers/logger');
const config = require('../config/config');

let totalSent = 0;
let totalFailed = 0;

const queue = new PQueue({

    concurrency: 1,

    intervalCap: 1,

    interval: config.queueDelay,

    carryoverConcurrencyCount: true

});

async function delay(ms) {

    return new Promise(resolve => {

        setTimeout(resolve, ms);

    });

}

async function sendText(number, message) {

    console.log('QUEUE ADD');
    return queue.add(async () => {

        let retry = 0;

        while (retry < config.maxRetry) {

            try {

                if (!whatsapp.isReady()) {

                    throw new Error(
                        'WhatsApp belum ready'
                    );

                }

                logger.info(

                    `[QUEUE] SEND -> ${number}`

                );

                const result = await Promise.race([

                    whatsapp.sendText(
                        number,
                        message
                    ),

                    new Promise((_, reject) => {

                        setTimeout(() => {

                            reject(

                                new Error(
                                    'Send Timeout'
                                )

                            );

                        }, config.sendTimeout);

                    })

                ]);

                logger.info(

                    `[QUEUE] SUCCESS -> ${number}`

                );

                return result;

            } catch (err) {

                retry++;

                logger.warn(

                    `[QUEUE] Retry ${retry}/${config.maxRetry}`

                );

                if (retry >= config.maxRetry) {

                    logger.error(err);

                    throw err;

                }

                await delay(3000);

            }

        }

    });

}

function size() {

    return queue.size;

}

function pending() {

    return queue.pending;

}

function clear() {

    queue.clear();

}

module.exports = {

    sendText,

    size,

    pending,

    clear

};