'use strict';

const fs = require('fs');
const path = require('path');

const config = require('../config/config');
const logger = require('../helpers/logger');

class SessionService {

    constructor() {

        this.sessionName = config.sessionName;

        this.sessionRoot = config.sessionPath;

        this.sessionPath = path.join(

            config.sessionPath,

            config.sessionName

        );

    }

    exists() {

        return fs.existsSync(this.sessionPath);

    }

    getFiles(dir) {

        let results = [];

        if (!fs.existsSync(dir)) {

            return results;

        }

        const list = fs.readdirSync(dir);

        list.forEach(file => {

            const filePath = path.join(dir, file);

            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {

                results = results.concat(

                    this.getFiles(filePath)

                );

            } else {

                results.push({

                    path: filePath,

                    size: stat.size,

                    mtime: stat.mtime

                });

            }

        });

        return results;

    }

    size() {

        if (!this.exists()) {

            return 0;

        }

        const files = this.getFiles(this.sessionPath);

        return files.reduce((total, file) => {

            return total + file.size;

        }, 0);

    }

    fileCount() {

        if (!this.exists()) {

            return 0;

        }

        return this.getFiles(this.sessionPath).length;

    }

    lastModified() {

        if (!this.exists()) {

            return null;

        }

        const files = this.getFiles(this.sessionPath);

        if (files.length === 0) {

            return null;

        }

        files.sort((a, b) => {

            return b.mtime - a.mtime;

        });

        return files[0].mtime;

    }

    info() {

        try {

            return {

                exists: this.exists(),

                session: this.sessionName,

                size: this.size(),

                sizeFormatted: this.formatBytes(

                    this.size()

                ),

                files: this.fileCount(),

                lastModified: this.lastModified()

            };

        }

        catch (err) {

            logger.error(err);

            return {

                exists: false,

                session: this.sessionName,

                path: this.sessionPath,

                size: 0,

                files: 0,

                lastModified: null,

                error: err.message

            };

        }

    }

    getPath() {

        return this.sessionPath;

    }

    analyze() {

        if (!this.exists()) {

            return [];

        }

        const result = [];

        const folders = fs.readdirSync(this.sessionPath);

        folders.forEach(name => {

            const folder = path.join(this.sessionPath, name);

            const stat = fs.statSync(folder);

            if (!stat.isDirectory()) {

                return;

            }

            const files = this.getFiles(folder);

            const size = files.reduce((total, file) => {

                return total + file.size;

            }, 0);

            result.push({

                name,

                files: files.length,

                size,

                sizeFormatted: this.formatBytes(size)

            });

        });

        result.sort((a, b) => b.size - a.size);

        return result;

    }

    formatBytes(bytes) {

        if (bytes === 0) {

            return '0 B';

        }

        const sizes = [

            'B',

            'KB',

            'MB',

            'GB'

        ];

        const i = Math.floor(

            Math.log(bytes) /

            Math.log(1024)

        );

        return (

            bytes /

            Math.pow(1024, i)

        ).toFixed(2) +

            ' ' +

            sizes[i];

    }

}


module.exports = new SessionService();