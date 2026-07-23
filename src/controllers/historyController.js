'use strict';

const repository = require('../repositories/messageRepository');

exports.latest = async (req, res) => {

    try {

        const limit = Number(req.query.limit || 50);

        const rows = await repository.latest(limit);

        return res.json({

            success: true,

            total: rows.length,

            data: rows

        });

    }

    catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }

};