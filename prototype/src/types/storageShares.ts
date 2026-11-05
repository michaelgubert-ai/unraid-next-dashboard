export type StorageTier = 'array' | 'cache' | 'remote';
export type ProtectionStatus = 'protected' | 'unprotected' | 'cache';
export type AccessLevel = 'private' | 'public' | 'secure';

export interface ShareItem {
  id: string;
  name: string;
  path: string; // e.g. "/mnt/user/Photos"
  type: 'folder' | 'file';
  sizeBytes: number;
  modifiedDate: string; // "2026-10-28 15:30"
  storageTier: StorageTier; // 'array' | 'cache' | 'remote'
  protectionStatus: ProtectionStatus;
  accessLevel: AccessLevel;
  comment?: string;
  fileExtension?: string; // e.g. "jpg", "mp4", "pdf", "iso", "md"
  itemCount?: number; // for folders
  isStarred?: boolean;
  smbExported?: boolean;
  moverEnabled?: boolean;
  children?: ShareItem[];
}

export interface StoragePoolInfo {
  id: string;
  name: string;
  type: StorageTier;
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  status: 'healthy' | 'warning' | 'degraded';
  icon: string;
}

