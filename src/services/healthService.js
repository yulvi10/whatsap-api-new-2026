'use strict';

const os = require('os');

const config = require('../config/config');
const whatsapp = require('./whatsappService');
const queue = require('./queueService');

class HealthService {

    constructor() {

        this.startTime = Date.now();

    }

    uptime() {

        const sec = Math.floor((Date.now() - this.startTime) / 1000);

        const day = Math.floor(sec / 86400);

        const hour = Math.floor((sec % 86400) / 3600);

        const minute = Math.floor((sec % 3600) / 60);

        const second = sec % 60;

        return {

            seconds: sec,

            formatted: `${day} Day ${hour} Hour ${minute} Minute ${second} Second`

        };

    }

    memory() {

        const mem = process.memoryUsage();

        return {

            rss: (mem.rss / 1024 / 1024).toFixed(2) + ' MB',

            heapTotal: (mem.heapTotal / 1024 / 1024).toFixed(2) + ' MB',

            heapUsed: (mem.heapUsed / 1024 / 1024).toFixed(2) + ' MB',

            external: (mem.external / 1024 / 1024).toFixed(2) + ' MB'

        };

    }

    cpu() {

        return {

            cores: os.cpus().length,

            model: os.cpus()[0].model,

            loadAverage: os.loadavg(),

            architecture: os.arch()

        };

    }

    system() {

        return {

            hostname: os.hostname(),

            platform: os.platform(),

            release: os.release(),

            totalMemory:

                (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + ' GB',

            freeMemory:

                (os.freemem() / 1024 / 1024 / 1024).toFixed(2) + ' GB'

        };

    }

    whatsapp() {

        return {

            ready: whatsapp.isReady(),

            status: whatsapp.getStatus(),

            phone: whatsapp.getPhoneNumber(),

            qr: whatsapp.getQRCode() ? true : false

        };

    }

    queue() {

        return {

            waiting: queue.size(),

            processing: queue.pending()

        };

    }

    gateway() {

        return {

            name: config.appName,

            version: '4.0.0',

            environment: config.appEnv,

            node: process.version,

            pid: process.pid

        };

    }

    getHealth() {

        return {

            gateway: this.gateway(),

            whatsapp: this.whatsapp(),

            queue: this.queue(),

            uptime: this.uptime(),

            memory: this.memory(),

            cpu: this.cpu(),

            system: this.system(),

            timestamp: new Date()

        };

    }

}

module.exports = new HealthService();