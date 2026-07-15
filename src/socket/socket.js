'use strict';

const { Server } = require('socket.io');

let io = null;

function initialize(server) {

    io = new Server(server, {

        cors: {

            origin: '*'

        }

    });

    io.on('connection', socket => {

        console.log('Dashboard Connected');

        socket.on('disconnect', () => {

            console.log('Dashboard Disconnected');

        });

    });

}

function emit(event, data) {

    if (io) {

        io.emit(event, data);

    }

}

function getIO() {

    return io;

}

module.exports = {

    initialize,

    emit,

    getIO

};