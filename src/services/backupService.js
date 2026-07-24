'use strict';

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const config = require('../config/config');
const logger = require('../helpers/logger');
const sessionService = require('./sessionService');

class BackupService {

    constructor() {

        this.backupPath = config.backupPath;

        this.tempPath = config.tempPath;


    }

    getSessionPath() {

        return sessionService.sessionPath;

    }

    ensureDirectory() {

        if (!fs.existsSync(this.backupPath)) {

            fs.mkdirSync(this.backupPath, {

                recursive: true

            });

        }

    }

    generateFileName() {

        const now = new Date();

        const yyyy = now.getFullYear();

        const mm = String(now.getMonth() + 1).padStart(2, '0');

        const dd = String(now.getDate()).padStart(2, '0');

        const hh = String(now.getHours()).padStart(2, '0');

        const mi = String(now.getMinutes()).padStart(2, '0');

        const ss = String(now.getSeconds()).padStart(2, '0');

        return `session_${yyyy}${mm}${dd}_${hh}${mi}${ss}.zip`;

    }

    getBackupFile() {

        return path.join(

            this.backupPath,

            this.generateFileName()

        );

    }

    formatBytes(bytes) {

        if (bytes === 0) {

            return '0 B';

        }

        const units = [

            'B',

            'KB',

            'MB',

            'GB',

            'TB'

        ];

        const index = Math.floor(

            Math.log(bytes) / Math.log(1024)

        );

        return (

            bytes /

            Math.pow(1024, index)

        ).toFixed(2) +

            ' ' +

            units[index];

    }

    async createZip(source, destination) {

        return new Promise((resolve, reject) => {

            const output = fs.createWriteStream(destination);

            const archive = archiver('zip', {

                zlib: {

                    level: 9

                }

            });


            output.on('close', () => {

                resolve({

                    success: true,

                    file: destination,

                    bytes: archive.pointer(),

                    sizeFormatted: this.formatBytes(

                        archive.pointer()

                    )

                });

            });

            output.on('error', reject);

            archive.on('error', reject);

            archive.pipe(output);


            archive.directory(

                source,

                false

            );

            archive.finalize();

        });

    }

    async backup() {

        try {

            if (!sessionService.exists()) {

                throw new Error(

                    'Session folder not found.'

                );

            }

            this.ensureDirectory();


            const target = this.getBackupFile();

            logger.info('========================================');

            logger.info('START SESSION BACKUP');

            logger.info('========================================');

            logger.info(

                `Session : ${this.getSessionPath()}`

            );

            logger.info(

                `Target  : ${target}`

            );

            const stat = {

                copied: 0,

                skipped: 0

            };

            const workspace = this.createWorkspace();

            this.copyDirectory(

                this.getSessionPath(),

                workspace,

                stat

            );

            this.buildMetadata(

                workspace,

                stat

            );

            let result;

            try {

                result = await this.createZip(

                    workspace,

                    target

                );

            }
            finally {

                this.clearTemp();

            }

            result.copied = stat.copied;

            result.skipped = stat.skipped;

            logger.info(

                `Backup Size : ${result.sizeFormatted}`

            );

            logger.info('SESSION BACKUP SUCCESS');

            logger.info('========================================');

            return result;

        }

        catch (err) {

            logger.error(

                'SESSION BACKUP FAILED'

            );

            console.error(err);

            logger.error(err.message);

            throw err;

        }

    }

    ensureTemp() {

        if (!fs.existsSync(this.tempPath)) {

            fs.mkdirSync(this.tempPath, {

                recursive: true

            });

        }

    }

    getTempFolder() {

        return path.join(

            this.tempPath,

            'session_backup'

        );

    }

    clearTemp() {

        const folder = this.getTempFolder();

        if (fs.existsSync(folder)) {

            fs.rmSync(folder, {

                recursive: true,

                force: true

            });

        }

    }


    createWorkspace() {

        this.clearTemp();

        this.ensureTemp();

        const workspace = this.getTempFolder();

        fs.mkdirSync(workspace, {

            recursive: true

        });

        return workspace;

    }

    copyFile(source, destination) {

        try {

            fs.copyFileSync(

                source,

                destination

            );

            return true;

        }

        catch (err) {

            if (

                err.code === 'EBUSY' ||

                err.code === 'EPERM' ||

                err.code === 'EACCES'

            ) {

                logger.warn(

                    `Skip Locked : ${source}`

                );

                return false;

            }

            throw err;

        }

    }

    copyDirectory(source, destination, stat) {

        try {

            if (!fs.existsSync(destination)) {

                fs.mkdirSync(destination, {

                    recursive: true

                });

            }

            const entries = fs.readdirSync(source, {

                withFileTypes: true

            });

            for (const entry of entries) {

                const src = path.join(source, entry.name);

                const dst = path.join(destination, entry.name);

                if (entry.isDirectory()) {

                    this.copyDirectory(

                        src,

                        dst,

                        stat

                    );

                }

                else {

                    const copied = this.copyFile(

                        src,

                        dst

                    );

                    copied

                        ? stat.copied++

                        : stat.skipped++;

                }

            }

        }

        catch (err) {

            logger.warn(

                `Skip Folder : ${source}`

            );

            stat.skipped++;

        }

    }

    buildMetadata(workspace, stat) {

        const data = {

            gateway: config.appName,

            version: '5.0.0',

            session: config.sessionName,

            createdAt: new Date(),

            copied: stat.copied,

            skipped: stat.skipped

        };

        fs.writeFileSync(

            path.join(

                workspace,

                'backup.json'

            ),

            JSON.stringify(

                data,

                null,

                4

            )

        );

    }

    async list() {

        this.ensureDirectory();

        const files = fs.readdirSync(this.backupPath);

        const backups = [];

        for (const file of files) {

            if (!file.endsWith('.zip')) {

                continue;

            }

            const fullPath = path.join(

                this.backupPath,

                file

            );

            const stat = fs.statSync(fullPath);

            backups.push({

                file,

                size: stat.size,

                sizeFormatted: this.formatBytes(

                    stat.size

                ),

                createdAt: stat.birthtime,

                modifiedAt: stat.mtime

            });

        }

        backups.sort((a, b) =>

            b.createdAt - a.createdAt

        );

        return backups;

    }

    delete(file) {

        const target = path.join(

            this.backupPath,

            file

        );

        if (!fs.existsSync(target)) {

            throw new Error(

                'Backup file not found.'

            );

        }

        fs.unlinkSync(target);

        return true;

    }

    clear() {

        this.ensureDirectory();

        const files = fs.readdirSync(

            this.backupPath

        );

        let deleted = 0;

        for (const file of files) {

            if (!file.endsWith('.zip')) {

                continue;

            }

            fs.unlinkSync(

                path.join(

                    this.backupPath,

                    file

                )

            );

            deleted++;

        }

        return deleted;

    }

    downloadPath(file) {

        return path.join(

            this.backupPath,

            file

        );

    }

}

module.exports = new BackupService();