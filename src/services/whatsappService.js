'use strict';

const wppconnect = require('@wppconnect-team/wppconnect');
const path = require('path');

const logger = require('../helpers/logger');
const config = require('../config/config');
const socket = require('../socket/socket');

let client = null;

let isReady = false;
let isStarting = false;
let isRestarting = false;

let qrCode = null;
let phoneNumber = null;
let status = 'STOPPED';

let reconnectTimer = null;

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function clearReconnectTimer() {

    if (reconnectTimer) {

        clearTimeout(reconnectTimer);

        reconnectTimer = null;

    }

}

function scheduleReconnect() {

    clearReconnectTimer();

    reconnectTimer = setTimeout(async () => {

        try {

            logger.warn('Reconnect WhatsApp...');

            await restart();

        } catch (err) {

            logger.error(err);

        }

    }, 5000);

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

                qrCode = base64Qr;

                const socket = require('../socket/socket');

                socket.emitQR({

                    connected: false,

                    qr: base64Qr

                });

                // socket.emitQR({

                //     qr: true,

                //     image: base64Qr

                // });

                socket.emitLog(

                    'info',

                    'QR Code Generated'

                );

                console.clear();

                console.log(asciiQR);

                logger.info('QR GENERATED');

            },

            catchLinkCode(code) {

                logger.info(
                    'LINK CODE : ' + code
                );

            },

            statusFind(currentStatus) {

                status = currentStatus;

                const socket = require('../socket/socket');

                socket.emitStatus({

                    ready: isReady,

                    status,

                    phone: phoneNumber

                });

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

        try {

            phoneNumber =
                await client.getHostNumber();

            socket.emitQR({
                connected: true,
                image: null
            });
            socket.emitQR({

                connected: true,

                qr: null

            });

            qrCode = null;

            socket.emitHealth({

                ready: true,

                status,

                phone: phoneNumber

            });

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

        client.onStateChange(async (state) => {

            status = state;

            socket.emitStatus({

                ready: isReady,

                status,

                phone: phoneNumber

            });

            socket.emitLog(

                'info',

                'State : ' + state

            );

            logger.info(
                'STATE : ' + state
            );

            switch (state) {

                case 'CONNECTED':

                    isReady = true;

                    clearReconnectTimer();

                    break;

                case 'CONFLICT':

                    logger.warn(
                        'CONFLICT DETECTED'
                    );

                    try {

                        await client.useHere();

                    } catch (_) { }

                    break;

                case 'UNPAIRED':

                case 'UNPAIRED_IDLE':

                case 'DISCONNECTED':

                    socket.emitQR({

                        connected: false,

                        qr: null

                    });

                    socket.emitStatus({

                        ready: false,

                        status

                    });

                    socket.emitLog(

                        'warning',

                        'Disconnected'

                    );

                    isReady = false;

                    scheduleReconnect();

                    break;

            }

        });

        client.onMessage(async (message) => {

            try {

                logger.info(


                    `[MESSAGE] ${message.from} : ${message.body}`

                );

                socket.emitLog(

                    'message',

                    `${message.from} : ${message.body}`

                );

            } catch (err) {

                logger.error(err);

            }

        });


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

    } catch (_) { }

    client = null;

    isReady = false;

    phoneNumber = null;

    status = 'LOGOUT';

}

async function shutdown() {

    logger.warn('Shutdown WhatsApp...');

    isReady = false;

    status = 'STOPPED';

    if (client) {

        try {

            await client.close();

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