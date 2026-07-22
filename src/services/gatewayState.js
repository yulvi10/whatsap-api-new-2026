'use strict';

const state = {

    status: 'STOPPED',

    ready: false,

    phone: null,

    qr: null,

    reconnectAttempt: 0,

    lastReconnect: null,

    lastError: null,

    startedAt: null,

    connectedAt: null,

    disconnectedAt: null,

    sessionName: null,

    version: null,

    battery: null,

    plugged: null

};

function get() {

    return { ...state };

}

function update(data = {}) {

    Object.assign(state, data);

}

function reset() {

    state.status = 'STOPPED';

    state.ready = false;

    state.phone = null;

    state.qr = null;

    state.reconnectAttempt = 0;

    state.lastReconnect = null;

    state.lastError = null;

    state.startedAt = null;

    state.connectedAt = null;

    state.disconnectedAt = null;

    state.sessionName = null;

}

function setStatus(status) {

    state.status = status;

}

function setReady(ready) {

    state.ready = ready;

}

function setPhone(phone) {

    state.phone = phone;

}

function setQR(qr) {

    state.qr = qr;

}

module.exports = {

    get,

    update,

    reset,

    setStatus,

    setReady,

    setPhone,

    setQR

};