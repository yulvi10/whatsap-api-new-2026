'use strict';

/**
 * ==========================================================
 * Remove karakter selain angka
 * ==========================================================
 */
function normalizePhone(number) {

    if (!number) {
        return '';
    }

    return String(number)
        .trim()
        .replace(/\D/g, '');

}

/**
 * ==========================================================
 * Ubah nomor menjadi format Indonesia
 * ==========================================================
 */
function formatPhone(number) {

    number = normalizePhone(number);

    if (!number) {
        return '';
    }

    if (number.startsWith('0')) {

        number = '62' + number.substring(1);

    }

    if (number.startsWith('620')) {

        number = '62' + number.substring(3);

    }

    return number;

}

/**
 * ==========================================================
 * JID WhatsApp
 * ==========================================================
 */
function createJid(number) {

    return formatPhone(number) + '@c.us';

}

/**
 * ==========================================================
 * Validasi Nomor Indonesia
 * ==========================================================
 */
function isValidPhone(number) {

    number = formatPhone(number);

    return /^62\d{8,15}$/.test(number);

}

/**
 * ==========================================================
 * Validasi Pesan
 * ==========================================================
 */
function isValidMessage(message) {

    if (typeof message !== 'string') {
        return false;
    }

    return message.trim().length > 0;

}

/**
 * ==========================================================
 * Validasi URL
 * ==========================================================
 */
function isValidUrl(url) {

    try {

        new URL(url);

        return true;

    } catch (_) {

        return false;

    }

}

/**
 * ==========================================================
 * Validasi Base64
 * ==========================================================
 */
function isBase64(value) {

    if (!value) {
        return false;
    }

    return /^data:.+;base64,/.test(value);

}

/**
 * ==========================================================
 * Validasi File Exists
 * ==========================================================
 */
const fs = require('fs');

function fileExists(file) {

    return fs.existsSync(file);

}

module.exports = {

    normalizePhone,

    formatPhone,

    createJid,

    isValidPhone,

    isValidMessage,

    isValidUrl,

    isBase64,

    fileExists

};