'use strict';

const health = require('../services/healthService');

exports.index = (req, res) => {

    const data = health.getHealth();

    console.log(data);

    res.render('dashboard', {

        health: data

    });

};