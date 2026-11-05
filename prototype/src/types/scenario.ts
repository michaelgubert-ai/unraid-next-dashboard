export type ScenarioType =
  | 'healthy'
  | 'low_storage'
  | 'disk_issue'
  | 'app_stopped'
  | 'action_failed'
  | 'operation_progress'
  | 'connection_lost';

export interface ScenarioDefinition {
  id: ScenarioType;
  title: string;
  description: string;
  tag: string;
}

export const SCENARIO_LIST: ScenarioDefinition[] = [
  {
    id: 'healthy',
    title: 'Normal Operation',
    description: 'Array protected, all disks healthy, 4 apps running, low resource load.',
    tag: 'Normal',
  },
  {
    id: 'low_storage',
    title: 'Low Storage Warning',
    description: 'Array is 92% full, Cache NVMe is 94% full. Mover recommendation active.',
    tag: 'Warning',
  },
  {
    id: 'disk_issue',
    title: 'Disk SMART Issue',
    description: 'Disk 1 reports 64 pending sectors and temperature spike (49°C).',
    tag: 'Degraded',
  },
  {
    id: 'app_stopped',
    title: 'App Stopped Cleanly',
    description: 'Plex media server was stopped by user. Clearly distinguished from a crash.',
    tag: 'Standby',
  },
  {
    id: 'action_failed',
    title: 'Action Failed (Crash)',
    description: 'Nextcloud container failed to start due to port 8080 bind conflict.',
    tag: 'Error',
  },
  {
    id: 'operation_progress',
    title: 'Active Parity Check',
    description: 'Monthly parity verification in progress (42% completed, 194 MB/s).',
    tag: 'Progress',
  },
  {
    id: 'connection_lost',
    title: 'Connection Lost / Stale',
    description: 'Websocket disconnected. Showing last known state with clear stale banner.',
    tag: 'Offline',
  },
];

