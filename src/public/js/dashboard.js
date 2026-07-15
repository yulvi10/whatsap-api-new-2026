const socket = io();

socket.on('connect', () => {

    console.log('Dashboard Connected');

});

socket.on('health', data => {

    document.getElementById('wa-status').innerText =
        data.whatsapp.status;

    document.getElementById('wa-phone').innerText =
        data.whatsapp.phone || '-';

    document.getElementById('queue-waiting').innerText =
        data.queue.waiting;

    document.getElementById('memory-rss').innerText =
        data.memory.rss;

    document.getElementById('uptime').innerText =
        data.uptime.formatted;

});