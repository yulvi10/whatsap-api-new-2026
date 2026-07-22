'use strict';

const config = require('../config/config');
const logger = require('../helpers/logger');

/*
|--------------------------------------------------------------------------
| Retry Delay
|--------------------------------------------------------------------------
*/

const delays = [

    5000,

    10000,

    20000,

    40000,

    60000

];

/*
|--------------------------------------------------------------------------
| Permanent Error
|--------------------------------------------------------------------------
*/

const permanentErrors = [

    'invalid number',

    'not exists',

    'blocked',

    'forbidden',

    'restricted',

    'logged out',

    'logout',

    '403'

];

/*
|--------------------------------------------------------------------------
| Retryable Error
|--------------------------------------------------------------------------
*/

const retryableErrors = [

    'timeout',

    'timed out',

    'network',

    'connection',

    'socket',

    'reset',

    'browser',

    'chrome',

    'disconnected'

];

/*
|--------------------------------------------------------------------------
| Need Retry ?
|--------------------------------------------------------------------------
*/

function shouldRetry(error, retry = 0) {

    if (retry >= config.maxRetry) {

        return false;

    }

    const message = String(

        error || ''

    ).toLowerCase();

    if (

        permanentErrors.some(

            item => message.includes(item)

        )

    ) {

        return false;

    }

    if (

        retryableErrors.some(

            item => message.includes(item)

        )

    ) {

        return true;

    }

    return false;

}

/*
|--------------------------------------------------------------------------
| Backoff
|--------------------------------------------------------------------------
*/

function getDelay(retry = 0) {

    return delays[

        Math.min(

            retry,

            delays.length - 1

        )

    ];

}

/*
|--------------------------------------------------------------------------
| Sleep
|--------------------------------------------------------------------------
*/

function sleep(ms) {

    return new Promise(resolve => {

        setTimeout(resolve, ms);

    });

}

/*
|--------------------------------------------------------------------------
| Execute Retry
|--------------------------------------------------------------------------
*/

async function execute(job, callback) {

    const retry =

        job.retry || 0;

    if (

        !shouldRetry(

            job.error,

            retry

        )

    ) {

        logger.warn(

            `[RETRY] STOP Job ${job.id}`

        );

        return false;

    }

    const delay =

        getDelay(retry);

    logger.warn(

        `[RETRY] Job ${job.id} Retry ${retry + 1}/${config.maxRetry} (${delay} ms)`

    );

    await sleep(delay);

    job.retry++;

    await callback(job);

    return true;

}

module.exports = {

    shouldRetry,

    getDelay,

    execute

};