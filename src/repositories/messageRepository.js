'use strict';

const db = require('../database/mysql');

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

async function update(jobId, data) {

    const fields = [];

    const values = [];

    Object.keys(data).forEach(key => {

        fields.push(`${key}=?`);

        values.push(data[key]);

    });

    values.push(jobId);

    return await db.query(

        `

        UPDATE whatsapp_message_log

        SET

        ${fields.join(',')}

        WHERE job_id=?

        `,

        values

    );

}

async function find(jobId) {

    const rows = await db.query(

        `

        SELECT *

        FROM whatsapp_message_log

        WHERE job_id=?

        LIMIT 1

        `,

        [

            jobId

        ]

    );

    return rows[0] || null;

}

module.exports = {

    create,

    update,

    find

};