'use strict';

/**
 * ==========================================================
 * Delay
 * ==========================================================
 * @param {number} ms
 * @returns {Promise<void>}
 */

function delay(ms = 1000) {

    ms = Number(ms);

    if (Number.isNaN(ms) || ms < 0) {
        ms = 0;
    }

    return new Promise(resolve => {

        setTimeout(resolve, ms);

    });

}

/**
 * ==========================================================
 * Timeout Wrapper
 * ==========================================================
 * @param {Promise} promise
 * @param {number} timeout
 * @returns {Promise}
 */

function withTimeout(promise, timeout = 30000) {

    return Promise.race([

        promise,

        new Promise((_, reject) => {

            setTimeout(() => {

                reject(new Error('Operation Timeout'));

            }, timeout);

        })

    ]);

}

module.exports = {

    delay,

    withTimeout

};