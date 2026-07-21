'use strict';

/*
|--------------------------------------------------------------------------
| Message Correlation
|--------------------------------------------------------------------------
|
| Menghubungkan Job ID internal dengan Message ID WhatsApp.
|
| Job ID
|      ↓
| WhatsApp Message ID
|
*/

const jobToWhatsapp = new Map();

const whatsappToJob = new Map();

/*
|--------------------------------------------------------------------------
| Register
|--------------------------------------------------------------------------
*/

function register(jobId, whatsappId) {

    if (!jobId || !whatsappId) {

        return;

    }

    jobToWhatsapp.set(jobId, whatsappId);

    whatsappToJob.set(whatsappId, jobId);

}

/*
|--------------------------------------------------------------------------
| Find Job By WhatsApp ID
|--------------------------------------------------------------------------
*/

function findJob(whatsappId) {

    return whatsappToJob.get(whatsappId);

}

/*
|--------------------------------------------------------------------------
| Find WhatsApp ID By Job
|--------------------------------------------------------------------------
*/

function findWhatsapp(jobId) {

    return jobToWhatsapp.get(jobId);

}

/*
|--------------------------------------------------------------------------
| Remove
|--------------------------------------------------------------------------
*/

function remove(jobId) {

    const whatsappId = jobToWhatsapp.get(jobId);

    if (whatsappId) {

        whatsappToJob.delete(whatsappId);

    }

    jobToWhatsapp.delete(jobId);

}

/*
|--------------------------------------------------------------------------
| Clear
|--------------------------------------------------------------------------
*/

function clear() {

    jobToWhatsapp.clear();

    whatsappToJob.clear();

}

/*
|--------------------------------------------------------------------------
| Statistics
|--------------------------------------------------------------------------
*/

function statistics() {

    return {

        total: jobToWhatsapp.size

    };

}

module.exports = {

    register,

    findJob,

    findWhatsapp,

    remove,

    clear,

    statistics

};