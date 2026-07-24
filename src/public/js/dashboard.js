'use strict'

const socket = window.GATEWAY ? window.GATEWAY.SOCKET : io()

let chartInstance = null

let historyCache = []

function updateClock() {
    const el = document.getElementById('current-time')
    if (el && window.moment) {
        el.textContent = moment().format('DD MMM YYYY HH:mm:ss')
    }
}

function prependLog(message) {
    const log = document.getElementById('live-log')

    if (!log) {
        return
    }

    const row = document.createElement('div')

    row.className = 'log-item'

    row.innerHTML = `

        <strong>

        ${moment().format('HH:mm:ss')}

        </strong>

        ${message}

        `

    log.prepend(row)

    while (log.children.length > 100) {
        log.removeChild(log.lastChild)
    }
}

function initChart() {
    const canvas = document.getElementById('gatewayChart')
    if (!canvas || !window.Chart) return

    chartInstance = new Chart(canvas, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Messages',
                    data: [],
                    borderWidth: 2,
                    tension: 0.35
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    })
}

function addChart(value) {
    if (!chartInstance) {
        return
    }

    chartInstance.data.labels.push(moment().format('HH:mm:ss'))

    chartInstance.data.datasets[0].data.push(value)

    if (chartInstance.data.labels.length > 20) {
        chartInstance.data.labels.shift()

        chartInstance.data.datasets[0].data.shift()
    }

    chartInstance.update()
}

function updateGatewayState(data) {
    const qrPanel = document.getElementById('qr-panel')
    if (!qrPanel) return
    const ready = !!data.whatsapp?.ready
    const phone = data.whatsapp?.phone || '-'
    const status = data.whatsapp?.status || 'STOPPED'
    if (ready) {
        qrPanel.innerHTML = `
            <div class="text-center">
                <div class="mb-3">
                    <i class="bi bi-check-circle-fill text-success"
                       style="font-size:70px;"></i>
                </div>
                <h5 class="text-success">
                    Device Connected
                </h5>
                <div class="mt-2">
                    ${phone}
                </div>
                <small class="text-muted">
                    Status :
                    ${status}
                </small>
            </div>
        `
    }
    else if (status === 'STOPPED') {

        qrPanel.innerHTML = `
        <span class="text-muted">
            Gateway belum dijalankan
        </span>
    `;

    }


}

function updateDashboard(data) {
    const statusEl = document.getElementById('wa-status')
    const phoneEl = document.getElementById('wa-phone')
    const queueEl = document.getElementById('queue-waiting')
    const memEl = document.getElementById('memory-rss')
    const uptimeEl = document.getElementById('uptime')

    if (statusEl) statusEl.textContent = data.whatsapp?.status || '-'
    if (phoneEl) phoneEl.textContent = data.whatsapp?.phone || '-'
    if (queueEl) queueEl.textContent = data.queue?.waiting ?? 0
    if (memEl) memEl.textContent = data.memory?.rss || '-'
    if (uptimeEl) uptimeEl.textContent = data.uptime?.formatted || '-'

    const navbarStatus = document.getElementById('navbar-status')
    const navbarQueue = document.getElementById('navbar-queue')
    const sidebarStatus = document.getElementById('sidebar-status')
    const sidebarQueue = document.getElementById('sidebar-queue')
    const sidebarMemory = document.getElementById('sidebar-memory')
    const sidebarCpu = document.getElementById('sidebar-cpu')
    const sidebarUptime = document.getElementById('sidebar-uptime')
    const footerStatus = document.getElementById('footer-status')
    const footerQueue = document.getElementById('footer-queue')
    const footerNode = document.getElementById('footer-node')

    const ready = !!data.whatsapp?.ready
    const statusText = data.whatsapp?.status || 'UNKNOWN'

    if (navbarStatus) navbarStatus.textContent = statusText
    if (navbarQueue) navbarQueue.textContent = data.queue?.waiting ?? 0
    if (sidebarStatus) sidebarStatus.textContent = statusText
    if (sidebarQueue) sidebarQueue.textContent = data.queue?.waiting ?? 0
    if (sidebarMemory) sidebarMemory.textContent = data.memory?.rss || '-'
    if (sidebarCpu) sidebarCpu.textContent = `${data.cpu?.cores ?? '-'} Core`
    if (sidebarUptime) sidebarUptime.textContent = data.uptime?.formatted || '-'
    if (footerStatus) {
        footerStatus.textContent = ready ? 'CONNECTED' : 'DISCONNECTED'
        footerStatus.className = `badge ${ready ? 'bg-success' : 'bg-danger'}`
    }
    if (footerQueue) footerQueue.textContent = data.queue?.waiting ?? 0
    if (footerNode) footerNode.textContent = data.gateway?.node || '-'

    setGatewayButtonState(

        data.whatsapp.status

    );
}

function setGatewayButtonState(status) {
    const start = document.getElementById('btnStartGateway')

    const stop = document.getElementById('btnStopGateway')

    const restart = document.getElementById('btnRestartGateway')

    const logout = document.getElementById('btnLogoutGateway')

    if (!start) return

    switch (status) {
        case 'CONNECTED':

        case 'inChat':
            start.disabled = true

            stop.disabled = false

            restart.disabled = false

            logout.disabled = false

            break

        default:
            start.disabled = false

            stop.disabled = true

            restart.disabled = true

            logout.disabled = true
    }
}



socket.on('connect', () => {
    prependLog('Dashboard Connected')
})

socket.on('disconnect', () => {
    prependLog('Dashboard Disconnected')
})

socket.on('health', data => {
    updateDashboard(data)
    updateGatewayState(data)
})

socket.on('status', data => {
    const statusEl = document.getElementById('wa-status')

    const phoneEl = document.getElementById('wa-phone')

    const navbarStatus = document.getElementById('navbar-status')

    const sidebarStatus = document.getElementById('sidebar-status')

    if (statusEl) {
        statusEl.textContent = data.status || '-'
    }

    if (phoneEl) {
        phoneEl.textContent = data.phone || '-'
    }

    if (navbarStatus) {
        navbarStatus.textContent = data.status || '-'
    }

    if (sidebarStatus) {
        sidebarStatus.textContent = data.status || '-'
    }

    setGatewayButtonState(
        data.status
    );
})

socket.on('queue', data => {
    console.log('QUEUE EVENT :', data)

    addChart(data.waiting)
    const totalQueue = (data.waiting ?? 0) + (data.processing ?? 0)

    document.getElementById('queue-waiting').textContent = totalQueue

    document.getElementById('navbar-queue').textContent = totalQueue

    document.getElementById('sidebar-queue').textContent = totalQueue
})

socket.on('log', data => {
    prependLog(`[${data.level.toUpperCase()}] ${data.message}`)
})

socket.on('qr', data => {
    const panel = document.getElementById('qr-panel')

    if (!panel) return

    if (data.connected) {
        panel.innerHTML = `
            <div class="alert alert-success">
                WhatsApp Connected
            </div>
        `

        return
    }

    if (!data.qr) {
        panel.innerHTML = `
            <span class="text-muted">
                QR belum tersedia
            </span>
        `

        return
    }

    panel.innerHTML = `
        <img
            src="${data.qr}"
            class="img-fluid"
            style="max-width:260px">
    `
})

async function callGateway(action) {
    try {
        prependLog(action.toUpperCase() + '...')

        const res = await axios.post('/api/gateway/' + action)

        prependLog(res.data.message)

        await loadGatewayStatus()
    } catch (err) {
        prependLog('ERROR : ' + (err.response?.data?.message || err.message))
    }
}

async function loadGatewayStatus() {
    try {
        const res = await axios.get('/api/gateway/status')

        const data = res.data

        document.getElementById('wa-status').innerHTML = data.status

        document.getElementById('wa-phone').innerHTML = data.phone || '-'

        updateGatewayState({
            whatsapp: {
                ready: data.running,

                phone: data.phone,

                status: data.status
            }
        })

        setGatewayButtonState(
            data.status
        );
    } catch (err) {
        console.error(err)
    }


}

window.addEventListener('DOMContentLoaded', () => {
    const reconnectBtn = document.getElementById('btnReconnect')
    const reconnectBtn2 = document.getElementById('btnReconnect2')
    const restartBtn = document.getElementById('btnRestart')
    const restartBtn2 = document.getElementById('btnRestart2')
    const logoutBtn = document.getElementById('btnLogout')

    updateClock()
    setInterval(updateClock, 1000)
    initChart()

    if (reconnectBtn) {
        reconnectBtn.onclick = () => callGateway('reconnect')
    }

    if (reconnectBtn2) {
        reconnectBtn2.onclick = () => callGateway('reconnect')
    }

    if (restartBtn) {
        restartBtn.onclick = () => callGateway('restart')
    }

    if (restartBtn2) {
        restartBtn2.onclick = () => callGateway('restart')
    }

    if (logoutBtn) {
        logoutBtn.onclick = () => callGateway('logout')
    }

    loadGatewayStatus();

    loadHistory();

    setInterval(loadHistory, 5000);

    const btnStart = document.getElementById("btnStartGateway");

    if (btnStart) {

        btnStart.onclick = () => callGateway("start");

    }

    const btnStop = document.getElementById("btnStopGateway");

    if (btnStop) {

        btnStop.onclick = () => callGateway("stop");

    }

    const btnRestart = document.getElementById("btnRestartGateway");

    if (btnRestart) {

        btnRestart.onclick = () => callGateway("restart");

    }

    const btnLogout = document.getElementById("btnLogoutGateway");

    if (btnLogout) {

        btnLogout.onclick = () => callGateway("logout");

    }
})


async function loadHistory() {

    try {

        const response = await fetch('/api/history/latest');

        const result = await response.json();

        historyCache = result.data || [];

        const tbody = document.getElementById('historyBody');

        if (!tbody) {

            return;

        }

        tbody.innerHTML = '';

        if (!result.success || result.total === 0) {

            tbody.innerHTML = `

                <tr>

                    <td colspan="7" class="text-center text-muted py-4">

                        No Message

                    </td>

                </tr>

            `;

            return;

        }

        result.data.forEach(item => {

            let html = '';

            result.data.forEach(item => {

                html += createHistoryRow(item);

            });

            tbody.innerHTML = html;

        });

    }

    catch (err) {

        console.error(err);

    }

}



function createHistoryRow(item) {

    return `

        <tr>

            <td>

                ${formatDateTime(item.created_at)}

            </td>

            <td>

                ${item.phone}

            </td>

            <td>

                ${shortMessage(item.message)}

            </td>

            <td>

                ${statusBadge(item.status)}

            </td>

            <td>

                ${ackBadge(item.ack)}

            </td>

            <td>

                ${retryBadge(item.retry)}

            </td>

            <td>

                <button class="btn btn-sm btn-primary btn-history-detail" data-id="${item.job_id}">

                <i class="bi bi-eye"></i> Detail

                </button>

            </td>

        </tr>

    `;

}

function statusBadge(status) {

    switch (status) {

        case 'READ':

            return '<span class="badge bg-success">READ</span>';

        case 'DELIVERED':

            return '<span class="badge bg-warning text-dark">DELIVERED</span>';

        case 'SERVER_RECEIVED':

            return '<span class="badge bg-info">SERVER</span>';

        case 'FAILED':

            return '<span class="badge bg-danger">FAILED</span>';

        case 'SENDING':

            return '<span class="badge bg-primary">SENDING</span>';

        case 'WAITING':

            return '<span class="badge bg-secondary">WAITING</span>';

        default:

            return `<span class="badge bg-light text-dark">

                ${status}

            </span>`;

    }

}

function formatDateTime(dateString) {

    if (!dateString) {

        return '-';

    }

    const date = new Date(dateString);

    const tanggal = date.toLocaleDateString('id-ID', {

        day: '2-digit',

        month: 'short'

    });

    const jam = date.toLocaleTimeString('id-ID', {

        hour: '2-digit',

        minute: '2-digit'

    });

    return `

        <div>

            ${tanggal}

            <br>

            <small class="text-muted">

                ${jam}

            </small>

        </div>

    `;

}


function shortMessage(message) {

    if (!message) return '-';

    if (message.length <= 45) {

        return message;

    }

    return message.substring(0, 45) + '...';

}

function ackBadge(ack) {

    switch (Number(ack)) {

        case 3:

            return '<span class="badge bg-success">READ</span>';

        case 2:

            return '<span class="badge bg-warning text-dark">DELIVERED</span>';

        case 1:

            return '<span class="badge bg-primary">SENT</span>';

        case 0:

            return '<span class="badge bg-secondary">PENDING</span>';

        default:

            return '<span class="badge bg-danger">-</span>';

    }

}


function retryBadge(retry) {

    retry = Number(retry || 0);

    if (retry === 0) {

        return '<span class="badge bg-success">0</span>';

    }

    if (retry <= 2) {

        return `<span class="badge bg-warning text-dark">

            ${retry}

        </span>`;

    }

    return `<span class="badge bg-danger">

        ${retry}

    </span>`;

}