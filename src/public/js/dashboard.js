'use strict';

const socket = window.GATEWAY ? window.GATEWAY.SOCKET : io();

let chartInstance = null;

function updateClock() {
    const el = document.getElementById('current-time');
    if (el && window.moment) {
        el.textContent = moment().format('DD MMM YYYY HH:mm:ss');
    }
}

function prependLog(message) {

    const log =

        document.getElementById(

            'live-log'

        );

    if (!log) {

        return;

    }

    const row =

        document.createElement(

            'div'

        );

    row.className =

        'log-item';

    row.innerHTML =

        `

        <strong>

        ${moment().format(

            'HH:mm:ss'

        )}

        </strong>

        ${message}

        `;

    log.prepend(row);

    while (log.children.length > 100) {

        log.removeChild(

            log.lastChild

        );

    }

}

function initChart() {
    const canvas = document.getElementById('gatewayChart');
    if (!canvas || !window.Chart) return;

    chartInstance = new Chart(canvas, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Messages',
                data: [],
                borderWidth: 2,
                tension: 0.35
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    function addChart(value) {

        if (!chartInstance) {

            return;

        }

        chartInstance.data.labels.push(

            moment().format(

                'HH:mm:ss'

            )

        );

        chartInstance.data.datasets[0].data.push(

            value

        );

        if (chartInstance.data.labels.length > 20) {

            chartInstance.data.labels.shift();

            chartInstance.data.datasets[0].data.shift();

        }

        chartInstance.update();

    }
}

function updateDashboard(data) {
    const statusEl = document.getElementById('wa-status');
    const phoneEl = document.getElementById('wa-phone');
    const queueEl = document.getElementById('queue-waiting');
    const memEl = document.getElementById('memory-rss');
    const uptimeEl = document.getElementById('uptime');

    if (statusEl) statusEl.textContent = data.whatsapp?.status || '-';
    if (phoneEl) phoneEl.textContent = data.whatsapp?.phone || '-';
    if (queueEl) queueEl.textContent = data.queue?.waiting ?? 0;
    if (memEl) memEl.textContent = data.memory?.rss || '-';
    if (uptimeEl) uptimeEl.textContent = data.uptime?.formatted || '-';

    const navbarStatus = document.getElementById('navbar-status');
    const navbarQueue = document.getElementById('navbar-queue');
    const sidebarStatus = document.getElementById('sidebar-status');
    const sidebarQueue = document.getElementById('sidebar-queue');
    const sidebarMemory = document.getElementById('sidebar-memory');
    const sidebarCpu = document.getElementById('sidebar-cpu');
    const sidebarUptime = document.getElementById('sidebar-uptime');
    const footerStatus = document.getElementById('footer-status');
    const footerQueue = document.getElementById('footer-queue');
    const footerNode = document.getElementById('footer-node');

    const ready = !!data.whatsapp?.ready;
    const statusText = data.whatsapp?.status || 'UNKNOWN';

    if (navbarStatus) navbarStatus.textContent = statusText;
    if (navbarQueue) navbarQueue.textContent = data.queue?.waiting ?? 0;
    if (sidebarStatus) sidebarStatus.textContent = statusText;
    if (sidebarQueue) sidebarQueue.textContent = data.queue?.waiting ?? 0;
    if (sidebarMemory) sidebarMemory.textContent = data.memory?.rss || '-';
    if (sidebarCpu) sidebarCpu.textContent = `${data.cpu?.cores ?? '-'} Core`;
    if (sidebarUptime) sidebarUptime.textContent = data.uptime?.formatted || '-';
    if (footerStatus) {
        footerStatus.textContent = ready ? 'CONNECTED' : 'DISCONNECTED';
        footerStatus.className = `badge ${ready ? 'bg-success' : 'bg-danger'}`;
    }
    if (footerQueue) footerQueue.textContent = data.queue?.waiting ?? 0;
    if (footerNode) footerNode.textContent = data.gateway?.node || '-';
}

document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);
    initChart();
});

socket.on('connect', () => {

    prependLog(

        'Dashboard Connected'

    );

});

socket.on('disconnect', () => {

    prependLog(

        'Dashboard Disconnected'

    );

});

socket.on('health', (data) => {
    updateDashboard(data);
});

socket.on('status', (data) => {

    const statusEl = document.getElementById('wa-status');

    const phoneEl = document.getElementById('wa-phone');

    const navbarStatus = document.getElementById('navbar-status');

    const sidebarStatus = document.getElementById('sidebar-status');

    if (statusEl) {

        statusEl.textContent = data.status || '-';

    }

    if (phoneEl) {

        phoneEl.textContent = data.phone || '-';

    }

    if (navbarStatus) {

        navbarStatus.textContent = data.status || '-';

    }

    if (sidebarStatus) {

        sidebarStatus.textContent = data.status || '-';

    }

});

socket.on('queue', (data) => {

    addChart(

        data.waiting

    );

    document.getElementById('queue-waiting').textContent =

        data.waiting ?? 0;

    document.getElementById('navbar-queue').textContent =

        data.waiting ?? 0;

    document.getElementById('sidebar-queue').textContent =

        data.waiting ?? 0;

});

socket.on('log', (data) => {

    prependLog(

        `[${data.level.toUpperCase()}] ${data.message}`

    );

});

socket.on('qr', (data) => {

    let panel =

        document.getElementById('qr-panel');

    if (!panel) {

        return;

    }

    if (!data.qr) {

        panel.innerHTML = '';

        return;

    }

    panel.innerHTML =

        `

    <img

        class="img-fluid"

        src="${data.image}"

    >

    `;

});

async function callGateway(action) {

    try {

        prependLog(action.toUpperCase() + '...');

        const res = await axios.post('/api/gateway/' + action);

        prependLog(res.data.message);

    } catch (err) {

        prependLog('ERROR : ' + (err.response?.data?.message || err.message));

    }

}

window.addEventListener('DOMContentLoaded', () => {

    const reconnectBtn = document.getElementById('btnReconnect');
    const reconnectBtn2 = document.getElementById('btnReconnect2');
    const restartBtn = document.getElementById('btnRestart');
    const restartBtn2 = document.getElementById('btnRestart2');
    const logoutBtn = document.getElementById('btnLogout');

    if (reconnectBtn) {
        reconnectBtn.onclick = () => callGateway('reconnect');
    }

    if (reconnectBtn2) {
        reconnectBtn2.onclick = () => callGateway('reconnect');
    }

    if (restartBtn) {
        restartBtn.onclick = () => callGateway('restart');
    }

    if (restartBtn2) {
        restartBtn2.onclick = () => callGateway('restart');
    }

    if (logoutBtn) {
        logoutBtn.onclick = () => callGateway('logout');
    }

});