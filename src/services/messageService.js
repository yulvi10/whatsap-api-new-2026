'use strict';

const repository = require('../repositories/messageRepository');

async function create(job) {

    return await repository.create({

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

}

async function update(jobId, data) {

    data.updated_at = new Date();

    return await repository.update(

        jobId,

        data

    );

}

async function find(jobId) {

    return await repository.find(jobId);

}

module.exports = {

    create,

    update,

    find

};