'use strict';

require('dotenv').config();

const path = require('path');

const rootPath = path.resolve(__dirname, '../../');

module.exports = {

    /*
    |--------------------------------------------------------------------------
    | Application
    |--------------------------------------------------------------------------
    */

    appName: process.env.APP_NAME || 'AICA WhatsApp Gateway',

    appEnv: process.env.APP_ENV || 'production',

    appDebug: process.env.APP_DEBUG === 'true',

    /*
    |--------------------------------------------------------------------------
    | Server
    |--------------------------------------------------------------------------
    */

    host: process.env.HOST || '0.0.0.0',

    port: Number(process.env.PORT || 8088),

    /*
    |--------------------------------------------------------------------------
    | API Security
    |--------------------------------------------------------------------------
    */

    token: process.env.TOKEN || '',

    /*
    |--------------------------------------------------------------------------
    | WhatsApp
    |--------------------------------------------------------------------------
    */

    sessionName: process.env.SESSION_NAME || 'AICA_GATEWAY',

    headless: process.env.HEADLESS === 'true',

    useChrome: process.env.USE_CHROME === 'true',

    chromePath: process.env.CHROME_PATH || undefined,

    autoClose: Number(process.env.AUTO_CLOSE || 0),

    deviceName: process.env.DEVICE_NAME || 'AICA Gateway',

    deviceBrowser: process.env.DEVICE_BROWSER || 'Chrome',

    devicePlatform: process.env.DEVICE_PLATFORM || 'Windows',

    /*
    |--------------------------------------------------------------------------
    | Queue
    |--------------------------------------------------------------------------
    */

    queueDelay: Number(process.env.QUEUE_DELAY || 1000),

    maxRetry: Number(process.env.MAX_RETRY || 5),

    sendTimeout: Number(process.env.SEND_TIMEOUT || 30000),

    /*
    |--------------------------------------------------------------------------
    | Reconnect
    |--------------------------------------------------------------------------
    */

    reconnectDelay: Number(process.env.RECONNECT_DELAY || 5000),

    maxReconnect: Number(process.env.MAX_RECONNECT || 999999),

    /*
    |--------------------------------------------------------------------------
    | Logger
    |--------------------------------------------------------------------------
    */

    logLevel: process.env.LOG_LEVEL || 'info',

    /*
    |--------------------------------------------------------------------------
    | Directory
    |--------------------------------------------------------------------------
    */

    rootPath,

    sessionFolder: 'session',

    sessionPath: path.join(rootPath, 'session'),

    backupPath: path.join(rootPath, 'backup'),

    tempPath: path.join(rootPath, 'temp'),

    logPath: path.join(rootPath, 'logs'),

    qrPath: path.join(rootPath, 'src', 'public', 'qr.png')

};