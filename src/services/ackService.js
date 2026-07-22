'use strict';

const logger = require('../helpers/logger');

const messageStore = require('./messageStore');

const correlation = require('./messageCorrelation');

const repository = require('../repositories/messageRepository');

const socket = require('../socket/socket');

/*
|--------------------------------------------------------------------------
| ACK Mapping
|--------------------------------------------------------------------------
*/

function mapStatus(ack) {

    switch (ack) {

        case 0:

            return 'SERVER_RECEIVED';

        case 1:

            return 'SENT';

        case 2:

            return 'DELIVERED';

        case 3:

            return 'READ';

        default:

            return 'FAILED';

    }

}

/*
|--------------------------------------------------------------------------
| Handle ACK
|--------------------------------------------------------------------------
*/

async function handle(message) {

    try {

        if (!message) {

            return;

        }

        const whatsappId =

            message.id || message.msgId || null;

        if (!whatsappId) {

            return;

        }

        const jobId =

            correlation.findJob(

                whatsappId

            );

        if (!jobId) {

            return;

        }

        const status =

            mapStatus(

                message.ack

            );

        /*
        |--------------------------------------------------------------------------
        | Message Store
        |--------------------------------------------------------------------------
        */

        messageStore.update(

            jobId,

            {

                ack: message.ack,

                status

            }

        );

        /*
        |--------------------------------------------------------------------------
        | Database
        |--------------------------------------------------------------------------
        */

        const updateData = {

            ack: message.ack,

            status,

            updated_at: new Date(),

            retry: message.retry || 0,

            error: message.error || null

        };

        if (status === 'SENT') {

            updateData.sent_at =

                new Date();

        }

        if (status === 'DELIVERED') {

            updateData.delivered_at =

                new Date();

        }


        if (status === 'READ') {

            updateData.read_at =

                new Date();

        }

        if (status === 'FAILED') {

            updateData.failed_at =

                new Date();

        }

        await repository.update(

            jobId,

            updateData

        );

        /*
        |--------------------------------------------------------------------------
        | Dashboard
        |--------------------------------------------------------------------------
        */

        socket.emit(

            'ack',

            {

                jobId,

                ack: message.ack,

                status

            }

        );

        socket.emitHealth(

            require('./healthService').getHealth()

        );

        socket.emitQueue({

            waiting: require('./queueService').size(),

            processing: require('./queueService').pending()

        });

        logger.info(

            `[ACK] Job:${jobId} Ack:${message.ack} Status:${status}`

        );

    }

    catch (err) {

        logger.error(err);

    }

}

module.exports = {

    handle

};