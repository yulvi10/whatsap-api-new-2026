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
    const logEl = document.getElementById('live-log');
    if (!logEl) return;

    const row = document.createElement('div');
    row.className = 'mb-2 p-2 rounded border bg-light';
    row.textContent = `[${moment().format('HH:mm:ss')}] ${message}`;

    logEl.prepend(row);
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
    prependLog('Socket connected');
});

socket.on('disconnect', () => {
    prependLog('Socket disconnected');
});

socket.on('health', (data) => {
    updateDashboard(data);
});

window.addEventListener('DOMContentLoaded', () => {
    const reconnectBtn = document.getElementById('btnReconnect');
    const reconnectBtn2 = document.getElementById('btnReconnect2');
    const restartBtn = document.getElementById('btnRestart');
    const restartBtn2 = document.getElementById('btnRestart2');
    const logoutBtn = document.getElementById('btnLogout');

    [reconnectBtn, reconnectBtn2].forEach(btn => {
        if (btn) btn.addEventListener('click', () => prependLog('Reconnect requested'));
    });

    [restartBtn, restartBtn2].forEach(btn => {
        if (btn) btn.addEventListener('click', () => prependLog('Restart requested'));
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => prependLog('Logout requested'));
    }
});