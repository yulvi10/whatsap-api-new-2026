'use strict';

const mysql = require('mysql2/promise');
const logger = require('../helpers/logger');

const pool = mysql.createPool({

    host: process.env.DB_HOST || '192.168.62.20',

    port: process.env.DB_PORT || 3306,

    user: process.env.DB_USER || 'db_server_20_new',

    password: process.env.DB_PASSWORD || 'aicafox2022',

    database: process.env.DB_NAME || 'e_it_system',

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0,

    charset: 'utf8mb4'

});

async function query(sql, params = []) {

    try {

        const [rows] = await pool.execute(sql, params);

        return rows;

    }

    catch (err) {

        logger.error(err);

        throw err;

    }

}

async function getConnection() {

    return await pool.getConnection();

}

module.exports = {

    query,

    getConnection,

    pool

};