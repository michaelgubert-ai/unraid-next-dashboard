import { ServerState, DiskDevice, DockerApp } from '../types/server';
import { ScenarioType } from '../types/scenario';
import { BASE_SERVER_DATA } from './mockData';

export class MockServerAdapter {
  private currentState: ServerState;
  private listeners: ((state: ServerState) => void)[] = [];
  private opInterval: number | null = null;

  constructor() {
    this.currentState = JSON.parse(JSON.stringify(BASE_SERVER_DATA));
  }

  public getState(): ServerState {
    return this.currentState;
  }

  public subscribe(listener: (state: ServerState) => void): () => void {
    this.listeners.push(listener);
    listener(this.currentState);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.currentState = {
      ...this.currentState,
      lastUpdatedTimestamp: Date.now(),
    };
    this.listeners.forEach((listener) => listener(this.currentState));
  }

  public applyScenario(scenario: ScenarioType) {
    if (this.opInterval) {
      clearInterval(this.opInterval);
      this.opInterval = null;
    }

    // Deep clone baseline
    const state: ServerState = JSON.parse(JSON.stringify(BASE_SERVER_DATA));

    switch (scenario) {
      case 'healthy':
        state.alerts = [];
        state.connectionStatus = 'connected';
        break;

      case 'low_storage':
        // Array at 92%
        state.storage.array.usedBytes = Math.round(7.36 * 1024 * 1024 * 1024 * 1024);
        state.storage.array.freeBytes = Math.round(0.64 * 1024 * 1024 * 1024 * 1024);
        state.storage.array.status = 'warning';
        // Cache at 94%
        state.storage.cache.usedBytes = Math.round(962 * 1024 * 1024 * 1024);
        state.storage.cache.freeBytes = Math.round(62 * 1024 * 1024 * 1024);
        state.storage.cache.status = 'warning';
        state.alerts = [
          {
            id: 'alert-cache-full',
            level: 'warning',
            title: 'Cache Pool critically full (94%)',
            description: 'Fast NVMe cache is nearly filled. Write operations may bypass cache or slow down.',
            targetObject: { type: 'disk', id: 'nvme0n1' },
            actionLabel: 'Invoke Mover Now',
            actionId: 'run_mover',
            timestamp: '10 min ago',
          },
          {
            id: 'alert-array-low',
            level: 'warning',
            title: 'Protected Array capacity is low (92%)',
            description: 'Only 640 GB free space remaining in data shares.',
            targetObject: { type: 'array', id: 'array' },
            actionLabel: 'View Allocation',
            actionId: 'view_storage',
            timestamp: '25 min ago',
          },
        ];
        break;

      case 'disk_issue':
        // Disk 1 SMART degraded
        const disk1 = state.storage.array.devices.find((d) => d.id === 'disk1');
        if (disk1) {
          disk1.smartHealthy = false;
          disk1.status = 'warning';
          disk1.errorCount = 64;
          disk1.temperatureC = 49;
        }
        state.storage.array.status = 'warning';
        state.alerts = [
          {
            id: 'alert-disk1-smart',
            level: 'critical',
            title: 'Disk 1 SMART Warning: 64 Pending Sectors',
            description: 'Hardware degradation detected on ST6000VN0021 (/dev/sdc). Data is currently protected by Parity.',
            targetObject: { type: 'disk', id: 'disk1' },
            actionLabel: 'View SMART Diagnosis',
            actionId: 'view_disk_disk1',
            timestamp: '5 min ago',
          },
        ];
        break;

      case 'app_stopped':
        const plex = state.apps.find((a) => a.id === 'plex');
        if (plex) {
          plex.state = 'stopped';
          plex.cpuPercent = 0;
          plex.memBytes = 0;
          plex.uptime = undefined;
        }
        state.alerts = [
          {
            id: 'alert-plex-stopped',
            level: 'info',
            title: 'Plex Media Server is currently stopped',
            description: 'Container was cleanly paused by user. Media streaming is offline.',
            targetObject: { type: 'app', id: 'plex' },
            actionLabel: 'Start Container',
            actionId: 'start_app_plex',
            timestamp: '15 min ago',
          },
        ];
        break;

      case 'action_failed':
        const nc = state.apps.find((a) => a.id === 'nextcloud');
        if (nc) {
          nc.state = 'error';
          nc.cpuPercent = 0;
          nc.uptime = undefined;
          nc.logs.unshift(
            '[FATAL] Failed to bind to 0.0.0.0:8443: Address already in use',
            '[FATAL] Container initialization failed with exit code 128'
          );
        }
        state.alerts = [
          {
            id: 'alert-nc-crash',
            level: 'critical',
            title: 'Nextcloud failed to start (Port Conflict :8443)',
            description: 'Container exited with code 128. Port 8443 is currently bound by another service.',
            targetObject: { type: 'app', id: 'nextcloud' },
            actionLabel: 'View Crash Logs',
            actionId: 'view_app_nextcloud',
            timestamp: 'Just now',
          },
        ];
        break;

      case 'operation_progress':
        state.activeOperation = {
          id: 'parity-check-active',
          type: 'parity_check',
          title: 'Parity-Check In Progress',
          description: 'Validating array integrity across 8 TB parity boundaries.',
          progressPercent: 42,
          speedMbps: 194.2,
          estimatedRemaining: '3 hours 45 minutes',
          canCancel: true,
          canPause: true,
          isPaused: false,
        };
        state.storage.array.parityStatus = 'checking';
        state.storage.array.paritySyncProgress = 42;
        // Start live ticking simulation
        this.startOperationTicker();
        break;

      case 'connection_lost':
        state.connectionStatus = 'stale';
        state.lastUpdatedTimestamp = Date.now() - 1000 * 60 * 18; // 18 minutes ago
        state.alerts = [
          {
            id: 'alert-stale-data',
            level: 'warning',
            title: 'Connection interrupted — showing cached snapshot',
            description: 'Unable to reach NASA2 websocket. Data displayed is from 18 minutes ago.',
            actionLabel: 'Reconnect',
            actionId: 'reconnect',
            timestamp: '18 min ago',
          },
        ];
        break;
    }

    this.currentState = state;
    this.notify();
  }

  private startOperationTicker() {
    this.opInterval = window.setInterval(() => {
      if (this.currentState.activeOperation && !this.currentState.activeOperation.isPaused) {
        let currentP = this.currentState.activeOperation.progressPercent;
        currentP += 1;
        if (currentP > 100) {
          this.currentState.activeOperation = null;
          this.currentState.storage.array.parityStatus = 'valid';
          this.currentState.storage.array.paritySyncProgress = undefined;
          this.currentState.activityLog.unshift({
            id: `act-${Date.now()}`,
            type: 'storage',
            title: 'Parity verification completed',
            detail: 'Parity verified with 0 errors found.',
            timeAgo: 'Just now',
            status: 'success',
          });
          if (this.opInterval) clearInterval(this.opInterval);
          this.opInterval = null;
        } else {
          this.currentState.activeOperation.progressPercent = currentP;
          this.currentState.storage.array.paritySyncProgress = currentP;
        }
        this.notify();
      }
    }, 1500);
  }

  public toggleDiskSpin(diskId: string): DiskDevice | null {
    const allDisks: DiskDevice[] = [
      ...this.currentState.storage.array.devices,
      ...this.currentState.storage.cache.devices,
    ];
    const target = allDisks.find((d) => d.id === diskId);
    if (!target) return null;

    if (target.spinState === 'active') {
      target.spinState = 'standby';
      target.status = 'standby';
      target.readRateBytes = 0;
      target.writeRateBytes = 0;
      target.temperatureC = null;
    } else {
      target.spinState = 'active';
      target.status = 'active';
      target.temperatureC = 37;
    }

    this.notify();
    return target;
  }

  public setAppState(appId: string, newState: 'running' | 'stopped' | 'restarting'): DockerApp | null {
    const app = this.currentState.apps.find((a) => a.id === appId);
    if (!app) return null;

    app.state = newState;
    if (newState === 'running') {
      app.cpuPercent = +(Math.random() * 2 + 0.5).toFixed(1);
      app.memBytes = Math.round((200 + Math.random() * 400) * 1024 * 1024);
      app.uptime = 'Just started';
      app.logs.unshift(`[INFO] Container ${app.name} started successfully.`);
    } else if (newState === 'stopped') {
      app.cpuPercent = 0;
      app.memBytes = 0;
      app.uptime = undefined;
      app.logs.unshift(`[INFO] Container ${app.name} stopped cleanly.`);
    } else if (newState === 'restarting') {
      setTimeout(() => {
        this.setAppState(appId, 'running');
      }, 1000);
    }

    this.notify();
    return app;
  }

  public triggerParityCheck() {
    this.applyScenario('operation_progress');
  }

  public pauseParityCheck() {
    if (this.currentState.activeOperation) {
      this.currentState.activeOperation.isPaused = !this.currentState.activeOperation.isPaused;
      this.notify();
    }
  }

  public cancelParityCheck() {
    if (this.opInterval) clearInterval(this.opInterval);
    this.opInterval = null;
    this.currentState.activeOperation = null;
    this.currentState.storage.array.parityStatus = 'valid';
    this.currentState.storage.array.paritySyncProgress = undefined;
    this.currentState.activityLog.unshift({
      id: `act-${Date.now()}`,
      type: 'storage',
      title: 'Parity check aborted by user',
      detail: 'Parity check was cancelled. Last completed valid check remains active.',
      timeAgo: 'Just now',
      status: 'warning',
    });
    this.notify();
  }

  public triggerMover(): Promise<string> {
    return new Promise((resolve) => {
      this.currentState.activeOperation = {
        id: 'mover-active',
        type: 'mover',
        title: 'Mover In Progress',
        description: 'Migrating eligible files from Cache pool to protected Array.',
        progressPercent: 15,
        speedMbps: 110.5,
        estimatedRemaining: '45 seconds',
        canCancel: true,
        canPause: false,
        isPaused: false,
      };
      this.notify();

      setTimeout(() => {
        if (this.currentState.activeOperation?.type === 'mover') {
          this.currentState.activeOperation = null;
          // Free some cache space
          this.currentState.storage.cache.usedBytes = Math.max(
            Math.round(150 * 1024 * 1024 * 1024),
            this.currentState.storage.cache.usedBytes - Math.round(200 * 1024 * 1024 * 1024)
          );
          this.currentState.storage.cache.freeBytes =
            this.currentState.storage.cache.totalBytes - this.currentState.storage.cache.usedBytes;
          this.currentState.storage.cache.status = 'healthy';
          // Clear any cache alert
          this.currentState.alerts = this.currentState.alerts.filter((a) => a.id !== 'alert-cache-full');
          this.currentState.activityLog.unshift({
            id: `act-${Date.now()}`,
            type: 'storage',
            title: 'Mover finished cache offload',
            detail: 'Moved 18.4 GB from NVMe cache to protected Array disks.',
            timeAgo: 'Just now',
            status: 'success',
          });
          this.notify();
          resolve('Mover completed successfully');
        }
      }, 3000);
    });
  }

  public resetAll() {
    if (this.opInterval) clearInterval(this.opInterval);
    this.opInterval = null;
    this.currentState = JSON.parse(JSON.stringify(BASE_SERVER_DATA));
    this.notify();
  }
}

export const mockAdapter = new MockServerAdapter();

