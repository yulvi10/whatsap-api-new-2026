'use strict';

const wppconnect = require('@wppconnect-team/wppconnect');
const path = require('path');

const logger = require('../helpers/logger');
const config = require('../config/config');
const socket = require('../socket/socket');
const gatewayState = require('./gatewayState');

const ackService = require('./ackService');
const healthService = require('./healthService');


let client = null;

let isReady = false;
let isStarting = false;
let isRestarting = false;

let qrCode = null;
let phoneNumber = null;
let status = 'STOPPED';

let reconnectTimer = null;

let reconnectAttempt = 0;

let listenersRegistered = false;

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function clearReconnectTimer() {

    if (reconnectTimer) {

        clearTimeout(reconnectTimer);

        reconnectTimer = null;

    }

}

function getReconnectDelay() {

    const delays = [

        5000,

        10000,

        20000,

        40000,

        60000

    ];

    return delays[

        Math.min(

            reconnectAttempt,

            delays.length - 1

        )

    ];

}

function scheduleReconnect() {

    if (reconnectTimer) {

        return;

    }

    reconnectAttempt++;

    const delay = getReconnectDelay();

    logger.warn(

        `Reconnect in ${delay / 1000}s (Attempt ${reconnectAttempt})`

    );

    reconnectTimer = setTimeout(async () => {

        reconnectTimer = null;

        try {

            await restart();

        }

        catch (err) {

            logger.error(err);

        }

    }, delay);

}

async function start() {

    if (isStarting)
        return client;

    if (client && isReady)
        return client;

    isStarting = true;

    logger.info('====================================');
    logger.info('STARTING WHATSAPP');
    logger.info('====================================');

    gatewayState.setStatus({

        status: 'STARTING',

        ready: false,

        startedAt: new Date()

    });



    try {

        client = await wppconnect.create({

            session: config.sessionName,

            headless: config.headless,

            autoClose: 0,

            waitForLogin: true,

            disableWelcome: true,

            updatesLog: false,

            folderNameToken: config.sessionFolder,

            puppeteerOptions: {

                executablePath: config.chromePath,

                // headless: config.headless,

                // userDataDir: path.join(
                //     process.cwd(),
                //     config.sessionPath,
                //     config.sessionName
                // ),

                args: [

                    '--no-sandbox',

                    '--disable-setuid-sandbox',

                    '--disable-dev-shm-usage',

                    '--disable-gpu',

                    '--disable-web-security',

                    '--disable-features=site-per-process'

                ]

            },

            catchQR(base64Qr, asciiQR) {

                logger.info('QR GENERATED');

                qrCode = base64Qr;

                gatewayState.setStatus('WAITING_QR');

                gatewayState.setReady(false);

                gatewayState.setQR(base64Qr);

                socket.emitQR({

                    connected: false,

                    qr: base64Qr

                });

                socket.emitStatus({

                    ready: false,

                    status: 'WAITING_QR',

                    phone: null

                });

                socket.emitHealth(

                    healthService.getHealth()

                );

                socket.emitLog(

                    'info',

                    'QR Code Generated'

                );

                console.clear();

                console.log(asciiQR);

            },

            catchLinkCode(code) {

                logger.info(
                    'LINK CODE : ' + code
                );

            },

            statusFind(currentStatus) {



                // const socket = require('../socket/socket');

                // socket.emitStatus({

                //     ready: isReady,

                //     status,

                //     phone: phoneNumber

                // });

                status = currentStatus;
                gatewayState.setStatus(currentStatus);

                socket.emitStatus({

                    ready: isReady,

                    status: currentStatus,

                    phone: phoneNumber

                });

                logger.info(
                    'STATUS : ' + currentStatus
                );

            },

            onLoadingScreen(percent, message) {

                logger.info(
                    `Loading ${percent}% ${message}`
                );

            }

        });

        isReady = true;

        gatewayState.setReady(true);

        try {

            gatewayState.setPhone(phoneNumber);

            socket.emitQR({

                connected: true,

                qr: null

            });

            qrCode = null;

            socket.emitHealth(

                healthService.getHealth()

            );

            socket.emitLog(

                'success',

                'WhatsApp Connected'

            );

        } catch (_) {

            phoneNumber = null;

        }

        logger.info(
            'CONNECTED : ' +
            (phoneNumber || '-')
        );



        if (!listenersRegistered) {

            listenersRegistered = true;


        }


        return client;

    } catch (err) {

        isReady = false;

        client = null;

        phoneNumber = null;

        status = 'ERROR';

        logger.error(err);

        scheduleReconnect();

        throw err;

    } finally {

        isStarting = false;

    }

}

async function sendText(number, text) {

    console.log('INSIDE SENDTEXT');
    console.log(number);

    if (!client)
        throw new Error(
            'Client belum dibuat'
        );

    if (!isReady)
        throw new Error(
            'WhatsApp belum ready'
        );

    if (!number)
        throw new Error(
            'Nomor kosong'
        );

    number = number
        .replace(/\D/g, '');

    if (
        !number.endsWith('@c.us')
    ) {

        number += '@c.us';

    }

    return await client.sendText(

        number,

        text

    );


}

async function restart() {

    logger.warn('Restarting WhatsApp...');

    try {

        if (client) {

            try {

                await client.close();

                await delay(2000);

                await start();

            } catch (_) { }

        }

    } catch (_) { }

    client = null;

    isReady = false;

    status = 'RESTARTING';

    return await start();

    // if (isRestarting) {
    //     return;
    // }

    // isRestarting = true;

    // clearReconnectTimer();

    // logger.warn('RESTARTING WHATSAPP...');

    // try {

    //     if (client) {

    //         try {

    //             await client.close();

    //         } catch (_) { }

    //     }

    // } finally {

    //     client = null;

    //     isReady = false;

    //     phoneNumber = null;

    //     status = 'RESTARTING';

    //     await delay(3000);

    //     isRestarting = false;

    // }

    // return start();

}

async function logout() {

    clearReconnectTimer();

    if (!client) {
        return;
    }

    try {

        await client.logout();

    } catch (err) {

        logger.error(err);

    }

    try {

        await client.close();

        await delay(2000);

        await start();

    } catch (_) { }

    client = null;

    isReady = false;

    phoneNumber = null;

    status = 'LOGOUT';

    gatewayState.setStatus({

        status: 'LOGOUT',

        ready: false,

        phone: null,

        qr: null

    });
    socket.emitHealth(

        healthService.getHealth()

    );

    socket.emitStatus({

        ready: false,

        status: "LOGOUT"

    });

}

async function shutdown() {

    logger.warn('Shutdown WhatsApp...');

    isReady = false;

    status = 'STOPPED';

    gatewayState.reset();

    socket.emitHealth(

        healthService.getHealth()

    );

    if (client) {

        try {

            await client.close();

            await delay(2000);

            await start();

        } catch (_) { }

    }

    client = null;


    // clearReconnectTimer();

    // logger.warn('STOPPING WHATSAPP...');

    // if (client) {

    //     try {

    //         await client.close();

    //     } catch (_) { }

    // }

    // client = null;

    // isReady = false;

    // phoneNumber = null;

    // status = 'STOPPED';

}

function getClient() {

    return client;

}

function getQRCode() {

    return qrCode;

}

function getPhoneNumber() {

    return phoneNumber;

}

function getStatus() {

    return status;

}

function ready() {

    return isReady;

}

module.exports = {

    start,

    restart,

    shutdown,

    logout,

    sendText,

    getClient,

    getQRCode,

    getPhoneNumber,

    getStatus,

    isReady: ready

};