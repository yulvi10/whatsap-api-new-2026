'use strict';

const fs = require('fs');
const path = require('path');

const config = require('../config/config');

class LogService {

    constructor() {

        this.logDir = config.logPath;

    }

    ensureDirectory() {

        if (!fs.existsSync(this.logDir)) {

            fs.mkdirSync(this.logDir, {

                recursive: true

            });

        }

    }

    currentFile() {

        const now = new Date();

        const yyyy = now.getFullYear();

        const mm = String(now.getMonth() + 1).padStart(2, '0');

        const dd = String(now.getDate()).padStart(2, '0');

        return path.join(

            this.logDir,

            `${yyyy}-${mm}-${dd}.log`

        );

    }

    write(level, message) {

        this.ensureDirectory();

        const now = new Date().toISOString();

        const line = `[${now}] [${level}] ${message}\n`;

        fs.appendFileSync(

            this.currentFile(),

            line,

            'utf8'

        );

    }

    info(msg) {

        this.write('INFO', msg);

    }

    warn(msg) {

        this.write('WARN', msg);

    }

    error(msg) {

        this.write('ERROR', msg);

    }

}

module.exports = new LogService();