'use strict';

const wppconnect = require('@wppconnect-team/wppconnect');
// const path = require('path');

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

            gatewayState.update({

                lastReconnect: new Date(),

                reconnectAttempt

            });

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

    gatewayState.update({

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

                logger.info(
                    'STATUS : ' + currentStatus
                );

                status = currentStatus;

                gatewayState.setStatus(currentStatus);

                socket.emitStatus({

                    ready: gatewayState.get().ready,

                    status: gatewayState.get().status,

                    phone: gatewayState.get().phone

                });

                socket.emitHealth(

                    healthService.getHealth()

                );

                socket.emitLog(

                    'info',

                    'Status : ' + currentStatus

                );

            },

            onLoadingScreen(percent, message) {

                logger.info(
                    `Loading ${percent}% ${message}`
                );

            }

        });



        try {

            phoneNumber = await client.getHostNumber();

            isReady = true;

            gatewayState.update({

                ready: true,

                status: 'CONNECTED',

                phone: phoneNumber,

                qr: null,

                connectedAt: new Date()

            });

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

        } catch (err) {

            logger.warn(

                'Unable to get host number'

            );

            phoneNumber = null;

        }

        logger.info(
            'CONNECTED : ' +
            (phoneNumber || '-')
        );



        if (!listenersRegistered) {

            listenersRegistered = true;

            client.onAck(async (ack) => {

                try {

                    if (ack) {

                        await ackService.handle(ack);

                    }

                } catch (err) {

                    logger.error(err);

                }

            });

        }


        return client;

    } catch (err) {

        isReady = false;

        client = null;

        phoneNumber = null;

        status = 'ERROR';

        gatewayState.update({

            status: 'ERROR',

            ready: false,

            lastError: err.message

        });

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

    if (!gatewayState.get().ready)
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

    if (isRestarting) {

        logger.warn('Restart already in progress');

        return;

    }

    isRestarting = true;

    clearReconnectTimer();

    logger.warn('Restarting WhatsApp...');

    try {

        if (client) {

            try {

                await client.close();

            }

            catch (err) {

                logger.error(err);

            }

        }

        client = null;


        isReady = false;

        phoneNumber = null;

        qrCode = null;

        status = 'RESTARTING';

        gatewayState.update({

            status: 'RESTARTING',

            ready: false,

            phone: null,

            qr: null,

            lastReconnect: new Date(),

            reconnectAttempt

        });

        socket.emitHealth(

            healthService.getHealth()

        );

        socket.emitStatus({

            ready: false,

            status: 'RESTARTING',

            phone: null

        });

        await delay(2000);

        return await start();

    }

    finally {

        isRestarting = false;

    }

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

    } catch (_) { }

    client = null;

    isReady = false;

    phoneNumber = null;

    qrCode = null;

    status = 'LOGOUT';

    gatewayState.update({

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

    clearReconnectTimer();

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

        }

        catch (err) {

            logger.error(err);

        }

    }

    client = null;

    qrCode = null;

    phoneNumber = null;


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