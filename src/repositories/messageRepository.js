'use strict';

const db = require('../database/mysql');

/*
|--------------------------------------------------------------------------
| Create Message
|--------------------------------------------------------------------------
*/

async function create(data) {

    return await db.query(

        `
        INSERT INTO whatsapp_message_log
        (
            job_id,
            wa_message_id,
            phone,
            message,
            status,
            ack,
            retry,
            error,
            created_at,
            sent_at,
            delivered_at,
            read_at,
            failed_at,
            updated_at
        )
        VALUES
        (
            ?,?,?,?,?,?,?,?,?,?,?,?,?,?
        )
        `,
        [

            data.job_id,

            data.wa_message_id,

            data.phone,

            data.message,

            data.status,

            data.ack,

            data.retry,

            data.error,

            data.created_at,

            data.sent_at,

            data.delivered_at,

            data.read_at,

            data.failed_at,

            data.updated_at

        ]

    );

}

/*
|--------------------------------------------------------------------------
| Update
|--------------------------------------------------------------------------
*/

async function update(jobId, data) {

    const fields = [];

    const values = [];

    Object.keys(data).forEach(key => {

        fields.push(`${key}=?`);

        values.push(data[key]);

    });

    values.push(jobId);

    return db.query(

        `
        UPDATE whatsapp_message_log
        SET ${fields.join(',')}
        WHERE job_id=?
        `,
        values

    );

}

/*
|--------------------------------------------------------------------------
| Update Status
|--------------------------------------------------------------------------
*/

async function updateStatus(jobId, status, ack) {

    const data = {

        status,

        ack,

        updated_at: new Date()

    };

    switch (status) {

        case 'SENT':

            data.sent_at = new Date();

            break;

        case 'DELIVERED':

            data.delivered_at = new Date();

            break;

        case 'READ':

            data.read_at = new Date();

            break;

        case 'FAILED':

            data.failed_at = new Date();

            break;

    }

    return update(jobId, data);

}

/*
|--------------------------------------------------------------------------
| Retry
|--------------------------------------------------------------------------
*/

async function updateRetry(jobId, retry) {

    return update(jobId, {

        retry,

        updated_at: new Date()

    });

}

/*
|--------------------------------------------------------------------------
| Error
|--------------------------------------------------------------------------
*/

async function updateError(jobId, error) {

    return update(jobId, {

        error,

        failed_at: new Date(),

        updated_at: new Date()

    });

}

/*
|--------------------------------------------------------------------------
| Find by Job
|--------------------------------------------------------------------------
*/

async function find(jobId) {

    const rows = await db.query(

        `
        SELECT *
        FROM whatsapp_message_log
        WHERE job_id=?
        LIMIT 1
        `,

        [jobId]

    );

    return rows[0] || null;

}

/*
|--------------------------------------------------------------------------
| Find by WA Message ID
|--------------------------------------------------------------------------
*/

async function findByMessageId(messageId) {

    const rows = await db.query(

        `
        SELECT *
        FROM whatsapp_message_log
        WHERE wa_message_id=?
        LIMIT 1
        `,

        [messageId]

    );

    return rows[0] || null;

}

/*
|--------------------------------------------------------------------------
| History
|--------------------------------------------------------------------------
*/

async function history(limit = 100) {

    limit = parseInt(limit, 10);

    if (isNaN(limit) || limit <= 0) {

        limit = 100;

    }

    return await db.query(

        `
        SELECT *
        FROM whatsapp_message_log
        ORDER BY serial_id DESC
        LIMIT ${limit}
        `

    );

}

/*
|--------------------------------------------------------------------------
| Delete Old Log
|--------------------------------------------------------------------------
*/

async function deleteOld(days = 30) {

    return await db.query(

        `
        DELETE
        FROM whatsapp_message_log
        WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
        `,

        [days]

    );

}

/*
|--------------------------------------------------------------------------
| Latest Message
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Latest Message
|--------------------------------------------------------------------------
*/

async function latest(limit = 50) {

    limit = parseInt(limit, 10);

    if (isNaN(limit) || limit <= 0) {

        limit = 50;

    }

    return await db.query(

        `
        SELECT
            serial_id,
            job_id,
            phone,
            message,
            status,
            ack,
            retry,
            error,
            created_at,
            sent_at,
            delivered_at,
            read_at,
            failed_at
        FROM whatsapp_message_log
        ORDER BY serial_id DESC
        LIMIT ${limit}
        `

    );

}

module.exports = {

    create,

    update,

    updateStatus,

    updateRetry,

    updateError,

    find,

    findByMessageId,

    history,

    latest,

    deleteOld

};