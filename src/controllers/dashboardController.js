'use strict';

const health = require('../services/healthService');

exports.index = (req, res) => {

    res.render('dashboard/index', {

        title: 'Dashboard',

        pageTitle: 'Dashboard',

        script: '/js/dashboard.js',

        health: health.getHealth()

    });

};