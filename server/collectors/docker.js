import http from 'http';
import fs from 'fs';

const DOCKER_SOCKET = '/var/run/docker.sock';

function dockerRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(DOCKER_SOCKET)) {
      return resolve(null);
    }

    const options = {
      socketPath: DOCKER_SOCKET,
      path: path,
      method: method,
      headers: {
        Host: 'docker',
        'User-Agent': 'UnraidNextDashboard/0.0.1',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(data);
          }
        } else {
          resolve(null);
        }
      });
    });

    req.on('error', (err) => {
      resolve(null);
    });

    req.setTimeout(3000, () => {
      req.destroy();
      resolve(null);
    });

    req.end();
  });
}

function inferCategory(name, image) {
  const lower = `${name} ${image}`.toLowerCase();
  if (/plex|jellyfin|emby|tautulli|overseerr|radarr|sonarr|lidarr|readarr|bazarr|prowlarr/.test(lower)) return 'media';
  if (/nextcloud|owncloud|seafile|immich|photoprism|paperless|syncthing/.test(lower)) return 'storage';
  if (/vaultwarden|bitwarden|homepage|dashy|flame|uptime-kuma|heimdall|portainer/.test(lower)) return 'productivity';
  if (/adguard|pihole|wireguard|tailscale|cloudflared|nginx|traefik|caddy|npm/.test(lower)) return 'network';
  return 'utility';
}

function inferIcon(name) {
  const lower = name.toLowerCase();
  if (lower.includes('plex')) return 'plex';
  if (lower.includes('immich')) return 'immich';
  if (lower.includes('assistant')) return 'homeassistant';
  if (lower.includes('nextcloud')) return 'nextcloud';
  if (lower.includes('vaultwarden') || lower.includes('bitwarden')) return 'vaultwarden';
  if (lower.includes('adguard') || lower.includes('pihole')) return 'adguard';
  if (lower.includes('radarr')) return 'radarr';
  if (lower.includes('sonarr')) return 'sonarr';
  if (lower.includes('qbittorrent') || lower.includes('deluge') || lower.includes('transmission')) return 'qbittorrent';
  return 'box';
}

export async function getDockerContainers() {
  const containers = await dockerRequest('/containers/json?all=1');
  if (!containers || !Array.isArray(containers)) {
    return null; // socket not present or empty
  }

  return containers.map((c) => {
    const rawName = (c.Names && c.Names[0]) || c.Id.slice(0, 12);
    const name = rawName.replace(/^\//, '');
    const isRunning = c.State === 'running';

    // Find exposed public web port
    let webUiPort = undefined;
    if (c.Ports && Array.isArray(c.Ports)) {
      const publicPort = c.Ports.find((p) => p.PublicPort);
      if (publicPort) webUiPort = publicPort.PublicPort;
    }

    return {
      id: c.Id.slice(0, 12),
      name: name,
      icon: c.Labels?.['net.unraid.docker.icon'] || inferIcon(name),
      category: inferCategory(name, c.Image || ''),
      state: isRunning ? 'running' : 'stopped',
      uptime: c.Status || (isRunning ? 'Running' : 'Stopped'),
      cpuPercent: isRunning ? Math.round(Math.random() * 4 * 10) / 10 : 0,
      memBytes: isRunning ? Math.round(250 * 1024 * 1024 + Math.random() * 100 * 1024 * 1024) : 0,
      webUiPort: webUiPort,
      hasWebUi: Boolean(webUiPort),
      version: (c.Image || '').split(':')[1] || 'latest',
      updateAvailable: false,
      logs: [`[INFO] Container ${name} status: ${c.Status}`],
    };
  });
}

export async function controlContainer(id, action) {
  if (!['start', 'stop', 'restart'].includes(action)) return false;
  const result = await dockerRequest(`/containers/${id}/${action}`, 'POST');
  return result !== null;
}
