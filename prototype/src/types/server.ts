export type DiskStatus = 'active' | 'standby' | 'warning' | 'error';
export type ParityStatus = 'valid' | 'checking' | 'degraded' | 'invalid' | 'disabled';
export type AppState = 'running' | 'stopped' | 'restarting' | 'error';
export type ArrayState = 'started' | 'stopped' | 'checking';

export interface DiskDevice {
  id: string; // e.g. "parity2", "disk1", "disk2", "cache"
  role: 'parity' | 'data' | 'cache' | 'boot' | 'unassigned';
  name: string; // "Parity 1", "Disk 1", "Cache (NVMe)"
  devicePath: string; // "/dev/sdb", "/dev/nvme0n1"
  model: string; // "ST6000VN0021-1Z811C"
  serial: string; // "ZA14FZ00" (anonymized)
  sizeBytes: number;
  usedBytes: number;
  temperatureC: number | null; // null if standby
  status: DiskStatus;
  spinState: 'active' | 'standby';
  smartHealthy: boolean;
  errorCount: number;
  readRateBytes: number;
  writeRateBytes: number;
  totalReads: number;
  totalWrites: number;
  fileSystem?: string; // "xfs", "btrfs", "vfat"
  mountPoint?: string; // "/mnt/disk1", "/mnt/cache"
}

export interface StoragePool {
  id: string; // "array", "cache", "remotes"
  name: string;
  type: 'array' | 'pool' | 'remote';
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  parityStatus?: ParityStatus;
  paritySyncProgress?: number; // 0 - 100
  devices: DiskDevice[];
}

export interface DockerApp {
  id: string;
  name: string;
  icon: string; // icon identifier or glyph
  category: 'media' | 'storage' | 'productivity' | 'network' | 'utility';
  state: AppState;
  uptime?: string;
  cpuPercent: number;
  memBytes: number;
  webUiPort?: number;
  hasWebUi: boolean;
  version: string;
  updateAvailable?: boolean;
  logs: string[];
}

export interface VirtualMachine {
  id: string;
  name: string;
  osType: 'linux' | 'windows';
  state: 'running' | 'stopped' | 'paused';
  vCpuCount: number;
  allocatedRamGiB: number;
  uptime?: string;
}

export interface SystemResources {
  cpuUsagePercent: number;
  cpuModel: string;
  cpuCoresTotal: number;
  cpuThreadsTotal: number;
  cpuPwrWatts: number;
  cpuTempC: number;
  cores: { id: number; type: 'P-Core' | 'E-Core'; usagePercent: number }[];
  ramTotalBytes: number;
  ramUsedBytes: number;
  ramFreeBytes: number;
  ramAvailableBytes: number;
  ramDockerBytes: number;
  ramSystemBytes: number;
  gpu?: {
    model: string;
    loadPercent: number;
    tempC: number;
    powerWatts: number;
    driverVersion: string;
    vramTotalBytes: number;
    vramUsedBytes: number;
    vramFreeBytes: number;
    activeProcesses?: { name: string; vramUsageMB: number }[];
  };
  network: {
    interfaceName: string;
    speedMbps: number;
    inboundKbps: number;
    outboundKbps: number;
    loadPercent?: number;
    ipAddress: string;
    isUp: boolean;
    activeProcesses?: { name: string; rxKbps: number; txKbps: number }[];
  };
}

export interface ServerAlert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  targetObject?: { type: 'disk' | 'app' | 'array' | 'system'; id: string };
  actionLabel?: string;
  actionId?: string;
  timestamp: string;
}

export interface ActiveOperation {
  id: string;
  type: 'parity_check' | 'mover' | 'disk_clear' | 'backup';
  title: string;
  description: string;
  progressPercent: number;
  speedMbps?: number;
  estimatedRemaining?: string;
  canCancel: boolean;
  canPause: boolean;
  isPaused: boolean;
}

export interface ActivityEvent {
  id: string;
  type: 'system' | 'storage' | 'app' | 'security';
  title: string;
  detail: string;
  timeAgo: string;
  status: 'success' | 'warning' | 'info' | 'neutral';
}

export interface ServerState {
  info: {
    hostname: string;
    role: string;
    unraidVersion: string;
    uptime: string;
    arrayStatus: ArrayState;
    lastParityCheck: {
      date: string;
      status: 'valid' | 'aborted' | 'errors_found';
      duration?: string;
      errors: number;
    };
  };
  storage: {
    array: StoragePool;
    cache: StoragePool;
    bootDevice: DiskDevice;
    unassignedShares: {
      name: string;
      source: string;
      mountPoint: string;
      totalBytes: number;
      usedBytes: number;
      isOnline: boolean;
    }[];
  };
  apps: DockerApp[];
  vms: VirtualMachine[];
  resources: SystemResources;
  alerts: ServerAlert[];
  activeOperation: ActiveOperation | null;
  activityLog: ActivityEvent[];
  connectionStatus: 'connected' | 'reconnecting' | 'stale';
  lastUpdatedTimestamp: number;
}

