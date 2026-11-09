import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { getSystemUptime, getCpuMetrics, getMemoryMetrics, getNetworkMetrics } from './collectors/system.js';
import { getDockerContainers, controlContainer } from './collectors/docker.js';
import { getUnraidInfo, getUnraidDisks } from './collectors/unraid.js';
import { BASE_SERVER_STATE } from './mockBaseline.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3080', 10);
const HOST = '0.0.0.0';

// Locate static directory: priority to server/public, then prototype/dist
function getStaticDir() {
  const p1 = path.join(__dirname, 'public');
  if (fs.existsSync(p1)) return p1;
  const p2 = path.resolve(__dirname, '../prototype/dist');
  if (fs.existsSync(p2)) return p2;
  return null;
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

async function buildLiveServerState() {
  // Start with a clean copy of the baseline
  const state = JSON.parse(JSON.stringify(BASE_SERVER_STATE));
  let isLiveSystem = false;

  // 1. Live Uptime
  const uptime = getSystemUptime();
  if (uptime) {
    state.info.uptime = uptime;
    isLiveSystem = true;
  }

  // 2. Live CPU
  const cpu = getCpuMetrics();
  if (cpu) {
    state.resources.cpuUsagePercent = cpu.usagePercent;
    if (cpu.cores.length > 0) {
      state.resources.cores = cpu.cores;
      state.resources.cpuCoresTotal = cpu.cores.length;
    }
    isLiveSystem = true;
  }

  // 3. Live RAM
  const mem = getMemoryMetrics();
  if (mem) {
    state.resources.ramTotalBytes = mem.ramTotalBytes;
    state.resources.ramUsedBytes = mem.ramUsedBytes;
    state.resources.ramFreeBytes = mem.ramFreeBytes;
    state.resources.ramAvailableBytes = mem.ramAvailableBytes;
    state.resources.ramDockerBytes = mem.ramDockerBytes;
    state.resources.ramSystemBytes = mem.ramSystemBytes;
    isLiveSystem = true;
  }

  // 4. Live Network
  const net = getNetworkMetrics();
  if (net) {
    state.resources.network.inboundKbps = net.inboundKbps;
    state.resources.network.outboundKbps = net.outboundKbps;
    state.resources.network.interfaceName = net.interfaceName;
    isLiveSystem = true;
  }

  // 5. Live Docker containers from socket
  try {
    const liveContainers = await getDockerContainers();
    if (liveContainers && liveContainers.length > 0) {
      state.apps = liveContainers;
      isLiveSystem = true;
    }
  } catch (err) {
    console.error('[Docker] Error polling containers:', err.message);
  }

  // 6. Live Unraid emhttp info
  const unraid = getUnraidInfo();
  if (unraid) {
    state.info.hostname = unraid.hostname;
    state.info.unraidVersion = unraid.unraidVersion;
    state.info.arrayStatus = unraid.arrayStatus;
    state.storage.array.parityStatus = unraid.parityStatus;
    isLiveSystem = true;
  }

  // 7. Live Disks
  const disks = getUnraidDisks();
  if (disks && disks.devices.length > 0) {
    state.storage.array.devices = disks.devices.filter((d) => d.role === 'data' || d.role === 'parity');
    state.storage.array.totalBytes = disks.arrayTotal;
    state.storage.array.usedBytes = disks.arrayUsed;
    state.storage.array.freeBytes = Math.max(0, disks.arrayTotal - disks.arrayUsed);

    const cacheDevs = disks.devices.filter((d) => d.role === 'cache');
    if (cacheDevs.length > 0) {
      state.storage.cache.devices = cacheDevs;
      state.storage.cache.totalBytes = disks.cacheTotal;
      state.storage.cache.usedBytes = disks.cacheUsed;
      state.storage.cache.freeBytes = Math.max(0, disks.cacheTotal - disks.cacheUsed);
    }
    isLiveSystem = true;
  }

  state.connectionStatus = 'connected';
  state.lastUpdatedTimestamp = Date.now();
  state._isLive = isLiveSystem;

  return state;
}

const server = http.createServer(async (req, res) => {
  // CORS Headers for development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // --- API Endpoints ---
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'ok',
        uptime: process.uptime(),
        dockerSocket: fs.existsSync('/var/run/docker.sock'),
        timestamp: Date.now(),
      })
    );
    return;
  }

  if (pathname === '/api/status') {
    try {
      const state = await buildLiveServerState();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(state));
    } catch (err) {
      console.error('[API /status Error]:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message, fallback: BASE_SERVER_STATE }));
    }
    return;
  }

  if (pathname.startsWith('/api/docker/') && pathname.endsWith('/action') && req.method === 'POST') {
    const parts = pathname.split('/');
    const containerId = parts[3];

    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const action = parsed.action || 'restart';
        const ok = await controlContainer(containerId, action);
        res.writeHead(ok ? 200 : 400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: ok, containerId, action }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // --- Static File Serving ---
  const staticDir = getStaticDir();
  if (!staticDir) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>Unraid Next Dashboard API Server</h1><p>Static frontend build not found. Run <code>npm run build</code> in <code>prototype/</code>.</p>');
    return;
  }

  let filePath = path.join(staticDir, pathname === '/' ? 'index.html' : pathname);

  // Security check: prevent directory traversal
  if (!filePath.startsWith(staticDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA Fallback: serve index.html for client-side routing
      const indexPath = path.join(staticDir, 'index.html');
      fs.readFile(indexPath, (readErr, indexData) => {
        if (readErr) {
          res.writeHead(404);
          res.end('Not Found');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(indexData);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000',
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`===============================================`);
  console.log(` 🚀 Unraid Next Dashboard Container Server`);
  console.log(` 🌐 Listening at: http://${HOST}:${PORT}`);
  console.log(` 📂 Static Assets: ${getStaticDir() || 'NOT FOUND'}`);
  console.log(` 🐳 Docker Socket: ${fs.existsSync('/var/run/docker.sock') ? 'CONNECTED' : 'NOT MOUNTED (Demo Mode)'}`);
  console.log(` 💾 Unraid emhttp: ${fs.existsSync('/host/emhttp') || fs.existsSync('/var/local/emhttp') ? 'MOUNTED' : 'NOT MOUNTED (Simulated)'}`);
  console.log(`===============================================`);
});
