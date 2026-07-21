'use strict';

/*
|--------------------------------------------------------------------------
| Message Store
|--------------------------------------------------------------------------
|
| Menyimpan seluruh lifecycle message selama gateway berjalan.
| Nantinya digunakan oleh:
|
| - Queue Service
| - ACK Listener
| - Dashboard
| - Database Logger
| - Retry Engine
|
*/

const messages = new Map();

/*
|--------------------------------------------------------------------------
| Create
|--------------------------------------------------------------------------
*/

function create(message) {

    messages.set(message.id, {

        ...message,

        createdAt: new Date(),

        updatedAt: new Date()

    });

}

/*
|--------------------------------------------------------------------------
| Update
|--------------------------------------------------------------------------
*/

function update(id, data = {}) {

    if (!messages.has(id)) {

        return null;

    }

    const current = messages.get(id);

    const updated = {

        ...current,

        ...data,

        updatedAt: new Date()

    };

    messages.set(id, updated);

    return updated;

}

/*
|--------------------------------------------------------------------------
| Get
|--------------------------------------------------------------------------
*/

function get(id) {

    return messages.get(id);

}

/*
|--------------------------------------------------------------------------
| Get All
|--------------------------------------------------------------------------
*/

function all() {

    return Array.from(

        messages.values()

    );

}

/*
|--------------------------------------------------------------------------
| Remove
|--------------------------------------------------------------------------
*/

function remove(id) {

    messages.delete(id);

}

/*
|--------------------------------------------------------------------------
| Clear
|--------------------------------------------------------------------------
*/

function clear() {

    messages.clear();

}

/*
|--------------------------------------------------------------------------
| Statistics
|--------------------------------------------------------------------------
*/

function statistics() {

    let waiting = 0;
    let sending = 0;
    let delivered = 0;
    let failed = 0;
    let read = 0;

    messages.forEach(item => {

        switch (item.status) {

            case 'WAITING':

                waiting++;

                break;

            case 'SENDING':

                sending++;

                break;

            case 'DELIVERED':

                delivered++;

                break;

            case 'READ':

                read++;

                break;

            case 'FAILED':

                failed++;

                break;

        }

    });

    return {

        total: messages.size,

        waiting,

        sending,

        delivered,

        read,

        failed

    };

}

module.exports = {

    create,

    update,

    get,

    all,

    remove,

    clear,

    statistics

};