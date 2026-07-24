'use strict';

const sessionService = require('../services/sessionService');
const backupService = require('../services/backupService');

/*
|--------------------------------------------------------------------------
| Session Info
|--------------------------------------------------------------------------
*/

exports.info = async (req, res) => {

    try {

        return res.json({

            success: true,

            data: sessionService.info()

        });

    }

    catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

/*
|--------------------------------------------------------------------------
| Session Analyze
|--------------------------------------------------------------------------
*/

exports.analyze = async (req, res) => {

    try {

        return res.json({

            success: true,

            data: sessionService.analyze()

        });

    }

    catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

/*
|--------------------------------------------------------------------------
| Create Backup
|--------------------------------------------------------------------------
*/

exports.backup = async (req, res) => {

    try {

        const result = await backupService.backup();

        return res.json({

            success: true,

            data: result

        });

    }

    catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

/*
|--------------------------------------------------------------------------
| Backup List
|--------------------------------------------------------------------------
*/

exports.list = async (req, res) => {

    try {

        const backups = await backupService.list();

        return res.json({

            success: true,

            total: backups.length,

            data: backups

        });

    }

    catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

/*
|--------------------------------------------------------------------------
| Download Backup
|--------------------------------------------------------------------------
*/

exports.download = async (req, res) => {

    try {

        const file = backupService.downloadPath(

            req.params.file

        );

        return res.download(file);

    }

    catch (err) {

        return res.status(404).json({

            success: false,

            message: err.message

        });

    }

};

/*
|--------------------------------------------------------------------------
| Delete Backup
|--------------------------------------------------------------------------
*/

exports.delete = async (req, res) => {

    try {

        backupService.delete(

            req.params.file

        );

        return res.json({

            success: true,

            message: 'Backup deleted.'

        });

    }

    catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

/*
|--------------------------------------------------------------------------
| Delete All Backup
|--------------------------------------------------------------------------
*/

exports.clear = async (req, res) => {

    try {

        const total = backupService.clear();

        return res.json({

            success: true,

            deleted: total

        });

    }

    catch (err) {

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};