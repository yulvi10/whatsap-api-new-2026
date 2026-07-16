'use strict';

let io = null;

function initialize(server) {

    const { Server } = require('socket.io');

    io = new Server(server, {

        cors: {

            origin: "*",

            methods: [

                "GET",

                "POST"

            ]

        }

    });

    io.on('connection', socket => {

        console.log(

            'Dashboard Connected'

        );

        socket.on(

            'disconnect',

            () => {

                console.log(

                    'Dashboard Disconnected'

                );

            }

        );

    });

}

function emit(event, data) {

    if (!io) return;

    io.emit(event, data);

}

function emitStatus(data) {

    emit(

        'status',

        data

    );

}

function emitHealth(data) {

    emit(

        'health',

        data

    );

}

function emitQueue(data) {

    emit(

        'queue',

        data

    );

}

function emitQR(data) {

    emit(

        'qr',

        data

    );

}

function emitLog(level, message) {

    emit(

        'log',

        {

            level,

            message,

            time: new Date()

        }

    );

}

module.exports = {

    initialize,

    emit,

    emitStatus,

    emitHealth,

    emitQueue,

    emitQR,

    emitLog,

    getIO() {

        return io;

    }

};