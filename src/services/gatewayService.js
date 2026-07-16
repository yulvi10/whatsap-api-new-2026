// 'use strict';

// const socket = require('../socket/socket');
// const health = require('./healthService');

// class GatewayService {

//     broadcastHealth(){

//         socket.emit(

//             'health',

//             health.getHealth()

//         );

//     }

//     broadcastStatus(){

//         socket.emit(

//             'status',

//             health.getHealth().whatsapp

//         );

//     }

//     broadcastQueue(){

//         socket.emit(

//             'queue',

//             health.getHealth().queue

//         );

//     }

//     broadcastLog(level,message){

//         socket.emit(

//             'log',

//             {

//                 level,

//                 message,

//                 time:new Date()

//             }

//         );

//     }

//     broadcastQR(qr){

//         socket.emit(

//             'qr',

//             {

//                 qr

//             }

//         );

//     }

// }

// module.exports = new GatewayService();