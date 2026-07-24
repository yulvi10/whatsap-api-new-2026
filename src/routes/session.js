'use strict';

const router = require('express').Router();

const controller = require('../controllers/sessionController');


router.get('/info', controller.info);

router.get('/analyze', controller.analyze);

router.post('/backup', controller.backup);

/*
|--------------------------------------------------------------------------
| Backup Management
|--------------------------------------------------------------------------
*/

router.get('/backups', controller.list);

router.get('/backup/download/:file', controller.download);

router.delete('/backup/:file', controller.delete);

router.delete('/backups', controller.clear);

module.exports = router;