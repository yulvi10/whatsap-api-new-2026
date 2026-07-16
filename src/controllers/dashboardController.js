'use strict';

const health = require('../services/healthService');

exports.index = (req, res) => {
    const data = health.getHealth();

    return res.render('dashboard', {
        title: 'Dashboard',
        pageTitle: 'Dashboard',
        script: '/js/dashboard.js',
        health: data
    });
};