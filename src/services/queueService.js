'use strict';

const crypto = require('crypto');
const PQueue = require('p-queue').default;

const whatsapp = require('./whatsappService');
const logger = require('../helpers/logger');
const config = require('../config/config');
const socket = require('../socket/socket');
const messageStore = require('./messageStore');
const correlation = require('./messageCorrelation');
const repository = require('../repositories/messageRepository');

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

    const job = {

        id: crypto.randomUUID(),

        number,

        message,

        retry: 0,

        ack: null,

        status: 'WAITING',

        error: null

    };

    messageStore.create(job);

    await repository.create({

        job_id: job.id,

        wa_message_id: null,

        phone: job.number,

        message: job.message,

        status: job.status,

        ack: null,

        retry: 0,

        error: null,

        created_at: new Date(),

        sent_at: null,

        delivered_at: null,

        read_at: null,

        failed_at: null,

        updated_at: new Date()

    });

    console.log('QUEUE ADD');

    socket.emitQueue({

        waiting: queue.size + 1,

        processing: queue.pending,

        sent: totalSent,

        failed: totalFailed

    });

    return queue.add(async () => {

        let retry = 0;

        while (retry < config.maxRetry) {

            try {

                if (!whatsapp.isReady()) {

                    throw new Error('WhatsApp belum ready');

                }

                messageStore.update(job.id, {

                    status: 'SENDING'

                });

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

                                new Error('Send Timeout')

                            );

                        }, config.sendTimeout);

                    })

                ]);

                /*
                |--------------------------------------------------------------------------
                | SERVER ACCEPTED
                |--------------------------------------------------------------------------
                |
                | BUKAN Delivered.
                | Delivered nanti berasal dari ACK Listener.
                |
                */

                if (

                    result &&

                    result.ack >= 0 &&

                    !result.isSendFailure

                ) {

                    totalSent++;

                    if (result.id) {

                        correlation.register(

                            job.id,

                            result.id

                        );

                    }

                    messageStore.update(job.id, {

                        status: 'SERVER_RECEIVED',

                        ack: result.ack,

                        whatsappId: result.id || null,

                        raw: result,

                        sentAt: new Date()


                    });

                    await repository.update(

                        job.id,

                        {

                            wa_message_id: result.id || null,

                            status: 'SERVER_RECEIVED',

                            ack: result.ack,

                            sent_at: new Date(),

                            updated_at: new Date()

                        }

                    );

                    logger.info(

                        `[QUEUE] SUCCESS -> ${number}`

                    );

                }

                else {

                    totalFailed++;

                    messageStore.update(job.id, {

                        status: 'FAILED',

                        ack: result ? result.ack : -1,

                        raw: result,

                        failedAt: new Date()

                    });

                    await repository.update(

                        job.id,

                        {

                            status: 'FAILED',

                            ack: result ? result.ack : -1,

                            error: 'Send Failure',

                            failed_at: new Date(),

                            updated_at: new Date()

                        }

                    );

                    logger.warn(

                        `[QUEUE] FAILED -> ${number}`

                    );

                }

                socket.emitQueue({

                    waiting: queue.size,

                    processing: queue.pending,

                    sent: totalSent,

                    failed: totalFailed

                });

                return result;

            }

            catch (err) {

                retry++;

                job.retry = retry;

                logger.warn(

                    `[QUEUE] Retry ${retry}/${config.maxRetry}`

                );

                messageStore.update(job.id, {

                    retry,

                    error: err.message,

                    lastRetry: new Date()

                });


                await repository.update(

                    job.id,

                    {

                        retry,

                        error: err.message,

                        updated_at: new Date()

                    }

                );
                
                if (retry >= config.maxRetry) {

                    totalFailed++;

                    messageStore.update(job.id, {

                        status: 'FAILED',

                        error: err.message,

                        failedAt: new Date()

                    });

                    logger.error(err);

                    socket.emitQueue({

                        waiting: queue.size,

                        processing: queue.pending,

                        sent: totalSent,

                        failed: totalFailed

                    });

                    throw err;

                }

                await delay(3000);

            }

        }

    });

}

function statistics() {

    return {

        sent: totalSent,

        failed: totalFailed,

        waiting: queue.size,

        processing: queue.pending,

        messages: messageStore.statistics()

    };

}

function size() {

    return queue.size;

}

function pending() {

    return queue.pending;

}

function clear() {

    queue.clear();

    messageStore.clear();

}

module.exports = {

    sendText,

    size,

    pending,

    clear,

    statistics

};