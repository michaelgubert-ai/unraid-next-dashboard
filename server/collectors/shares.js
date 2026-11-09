import fs from 'fs';
import path from 'path';

function findFile(paths) {
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function parseIni(content) {
  const result = {};
  let currentSection = 'global';
  result[currentSection] = {};

  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith(';')) continue;

    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      let sec = trimmed.slice(1, -1);
      if ((sec.startsWith('"') && sec.endsWith('"')) || (sec.startsWith("'") && sec.endsWith("'"))) {
        sec = sec.slice(1, -1);
      }
      currentSection = sec;
      result[currentSection] = result[currentSection] || {};
      continue;
    }

    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      result[currentSection][key] = val;
    }
  }
  return result;
}

export function getRealShares() {
  const userMount = findFile(['/host/mnt/user', '/mnt/user']);
  const sharesIniPath = findFile([
    '/host/emhttp/shares.ini',
    '/var/local/emhttp/shares.ini',
    '/host/var/local/emhttp/shares.ini',
  ]);

  let iniConfig = {};
  if (sharesIniPath) {
    try {
      iniConfig = parseIni(fs.readFileSync(sharesIniPath, 'utf8'));
    } catch {}
  }

  if (!userMount) {
    return null; // fallback to mock
  }

  try {
    const entries = fs.readdirSync(userMount, { withFileTypes: true });
    const shareFolders = entries.filter((e) => e.isDirectory() && !e.name.startsWith('.'));

    if (shareFolders.length === 0) return null;

    const shares = shareFolders.map((dir) => {
      const shareName = dir.name;
      const sharePath = path.join(userMount, shareName);
      const cfg = iniConfig[shareName] || {};

      let children = [];
      let itemCount = 0;
      let totalSize = 0;
      let modifiedDate = '2026-11-09 10:00';

      try {
        const stats = fs.statSync(sharePath);
        modifiedDate = stats.mtime.toISOString().replace('T', ' ').slice(0, 16);

        // Read up to 40 immediate items inside this share
        const subEntries = fs.readdirSync(sharePath, { withFileTypes: true });
        itemCount = subEntries.length;

        children = subEntries.slice(0, 40).map((sub) => {
          const subPath = path.join(sharePath, sub.name);
          let subSize = 1024 * 1024;
          let subMtime = modifiedDate;
          let ext = undefined;

          try {
            const subStat = fs.statSync(subPath);
            subSize = subStat.size;
            totalSize += subSize;
            subMtime = subStat.mtime.toISOString().replace('T', ' ').slice(0, 16);
          } catch {}

          if (sub.isFile()) {
            ext = path.extname(sub.name).slice(1).toLowerCase() || 'file';
          }

          return {
            id: `${shareName}-${sub.name}`,
            name: sub.name,
            path: `/mnt/user/${shareName}/${sub.name}`,
            type: sub.isDirectory() ? 'folder' : 'file',
            sizeBytes: subSize,
            modifiedDate: subMtime,
            storageTier: cfg.useCache === 'only' || cfg.useCache === 'prefer' ? 'cache' : 'array',
            protectionStatus: 'protected',
            accessLevel: 'private',
            fileExtension: ext,
            smbExported: true,
          };
        });
      } catch (err) {
        console.error(`[Shares] Error reading share ${shareName}:`, err.message);
      }

      const useCache = cfg.useCache || 'yes';
      const tier = useCache === 'only' || useCache === 'prefer' ? 'cache' : 'array';

      return {
        id: shareName.toLowerCase(),
        name: shareName,
        path: `/mnt/user/${shareName}`,
        type: 'folder',
        sizeBytes: totalSize || 1024 * 1024 * 1024,
        modifiedDate: modifiedDate,
        storageTier: tier,
        protectionStatus: tier === 'cache' ? 'cache' : 'protected',
        accessLevel: 'private',
        comment: cfg.comment || `Unraid User Share (${shareName})`,
        itemCount: itemCount,
        isStarred: ['photos', 'media', 'appdata'].includes(shareName.toLowerCase()),
        smbExported: true,
        moverEnabled: useCache === 'yes',
        children: children,
      };
    });

    return shares;
  } catch (err) {
    console.error('[Shares] Error scanning user shares:', err);
    return null;
  }
}
