import React, { useState, useMemo } from 'react';
import {
  Folder,
  FolderPlus,
  HardDrive,
  Zap,
  Server,
  Trash2,
  ShieldCheck,
  Lock,
  Unlock,
  Search,
  Grid,
  List as ListIcon,
  Info,
  Upload,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  SlidersHorizontal,
  ExternalLink,
  Star,
  FileText,
  FileCode,
  FileVideo,
  FileImage,
  File as FileIcon,
  Disc,
  MoreVertical,
  X,
  ArrowUpRight,
  Database,
  Clock,
  Sparkles,
  Share2,
} from 'lucide-react';
import { ShareItem, StoragePoolInfo, StorageTier } from '../../types/storageShares';
import { mockRootShares, mockStoragePools } from '../../mock/sharesData';
import { formatBytes } from '../../utils/formatters';
import { useServer } from '../../context/ServerContext';

interface StorageSharesViewProps {
  onBackToOverview?: () => void;
}

export const StorageSharesView: React.FC<StorageSharesViewProps> = ({ onBackToOverview }) => {
  const { showToast } = useServer();

  // Navigation state: current folder path hierarchy
  const [navPath, setNavPath] = useState<ShareItem[]>([]);
  // Selected item inside current folder
  const [selectedItem, setSelectedItem] = useState<ShareItem | null>(mockRootShares[0]);
  // View mode: 'grid' (macOS Finder icons) or 'list' (Windows Explorer details)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  // Inspector drawer visibility
  const [showInspector, setShowInspector] = useState(true);
  // Search query
  const [searchQuery, setSearchQuery] = useState('');
  // Filter by pool
  const [activePoolFilter, setActivePoolFilter] = useState<string>('all');
  // New folder modal
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderTier, setNewFolderTier] = useState<StorageTier>('array');
  const [newFolderPrivate, setNewFolderPrivate] = useState(true);

  // Copied path notification
  const [copiedPath, setCopiedPath] = useState(false);

  // Current items in directory
  const currentItems = useMemo(() => {
    let items = navPath.length === 0 ? mockRootShares : navPath[navPath.length - 1].children || [];

    // Filter by pool if at root
    if (navPath.length === 0 && activePoolFilter !== 'all') {
      items = items.filter((item) => item.storageTier === activePoolFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (item) => item.name.toLowerCase().includes(q) || (item.comment && item.comment.toLowerCase().includes(q))
      );
    }

    return items;
  }, [navPath, activePoolFilter, searchQuery]);

  // Navigate into folder
  const handleOpenFolder = (folder: ShareItem) => {
    if (folder.type === 'folder') {
      setNavPath((prev) => [...prev, folder]);
      setSelectedItem(folder.children && folder.children.length > 0 ? folder.children[0] : folder);
    }
  };

  // Navigate back one level
  const handleNavigateBack = () => {
    if (navPath.length > 0) {
      setNavPath((prev) => prev.slice(0, prev.length - 1));
      setSelectedItem(navPath.length > 1 ? navPath[navPath.length - 2] : mockRootShares[0]);
    }
  };

  // Navigate to specific breadcrumb
  const handleNavigateToBreadcrumb = (index: number) => {
    if (index === -1) {
      setNavPath([]);
      setSelectedItem(mockRootShares[0]);
    } else {
      setNavPath((prev) => prev.slice(0, index + 1));
      setSelectedItem(navPath[index]);
    }
  };

  // Copy UNC Path
  const handleCopyPath = (path: string) => {
    const uncPath = `\\\\NASA2\\${path.replace('/mnt/user/', '').replace(/\//g, '\\')}`;
    navigator.clipboard?.writeText(uncPath);
    setCopiedPath(true);
    showToast(`Copied Windows network path: ${uncPath}`);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  // Render file icon based on extension
  const renderFileGlyph = (item: ShareItem) => {
    if (item.type === 'folder') {
      return (
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <svg width="68" height="56" viewBox="0 0 68 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3 10C3 6.68629 5.68629 4 9 4H26.5L34 11H59C62.3137 11 65 13.6863 65 17V46C65 49.3137 62.3137 52 59 52H9C5.68629 52 3 49.3137 3 46V10Z"
              fill="#d97706"
              fillOpacity="0.4"
            />
            <path
              d="M3 18C3 14.6863 5.68629 12 9 12H59C62.3137 12 65 14.6863 65 18V46C65 49.3137 62.3137 52 59 52H9C5.68629 52 3 49.3137 3 46V18Z"
              fill="url(#folder-gradient)"
            />
            <defs>
              <linearGradient id="folder-gradient" x1="34" y1="12" x2="34" y2="52" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f59e0b" />
                <stop offset="1" stopColor="#d97706" />
              </linearGradient>
            </defs>
          </svg>
          {/* Badge for Protection Status */}
          {item.protectionStatus === 'protected' && (
            <div
              style={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                backgroundColor: 'rgba(34, 197, 94, 0.25)',
                border: '1px solid rgba(34, 197, 94, 0.5)',
                borderRadius: '50%',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Parity Protected"
            >
              <ShieldCheck size={11} color="#22c55e" />
            </div>
          )}
          {item.storageTier === 'cache' && (
            <div
              style={{
                position: 'absolute',
                top: 8,
                right: 2,
                backgroundColor: 'rgba(255, 107, 53, 0.3)',
                border: '1px solid rgba(255, 107, 53, 0.6)',
                borderRadius: '50%',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Fast NVMe Cache Pool"
            >
              <Zap size={11} color="#ff6b35" />
            </div>
          )}
        </div>
      );
    }

    // Specialized file badges matching reference (ai, md, avi, cs, svg)
    const ext = item.fileExtension?.toLowerCase() || '';
    if (ext === 'ai' || ext === 'psd') {
      return (
        <div
          style={{
            width: 60,
            height: 52,
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #451a03 0%, #78350f 100%)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fbbf24',
            fontWeight: 800,
            fontSize: '14px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          }}
        >
          <span>Ai</span>
        </div>
      );
    }
    if (ext === 'avi' || ext === 'mp4' || ext === 'mkv') {
      return (
        <div
          style={{
            width: 60,
            height: 52,
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          }}
        >
          <FileVideo size={20} />
          <span style={{ fontSize: '9px', fontWeight: 700, marginTop: '2px', textTransform: 'uppercase' }}>{ext}</span>
        </div>
      );
    }
    if (ext === 'svg' || ext === 'png' || ext === 'jpg' || ext === 'cr3') {
      return (
        <div
          style={{
            width: 60,
            height: 52,
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #581c87 0%, #7c3aed 100%)',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          }}
        >
          <FileImage size={20} />
          <span style={{ fontSize: '9px', fontWeight: 700, marginTop: '2px', textTransform: 'uppercase' }}>{ext}</span>
        </div>
      );
    }
    if (ext === 'cs' || ext === 'ts' || ext === 'json' || ext === 'py') {
      return (
        <div
          style={{
            width: 60,
            height: 52,
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          }}
        >
          <FileCode size={20} />
          <span style={{ fontSize: '9px', fontWeight: 700, marginTop: '2px', textTransform: 'uppercase' }}>{ext}</span>
        </div>
      );
    }

    // Default document file
    return (
      <div
        style={{
          width: 60,
          height: 52,
          borderRadius: '8px',
          background: 'var(--bg-surface-raised)',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
        }}
      >
        <FileText size={20} />
        <span style={{ fontSize: '9px', fontWeight: 700, marginTop: '2px', textTransform: 'uppercase' }}>{ext || 'DOC'}</span>
      </div>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 120px)',
        minHeight: '680px',
        background: 'rgba(18, 20, 28, 0.94)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.65)',
        overflow: 'hidden',
        color: 'var(--text-primary)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* ─── Top Main Toolbar (Mac Finder / Windows Explorer Header) ─── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          background: 'var(--bg-surface-overlay)',
          borderBottom: '1px solid var(--border-subtle)',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        {/* Navigation History & Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Back & Forward Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={handleNavigateBack}
              disabled={navPath.length === 0}
              style={{
                background: 'transparent',
                border: 'none',
                color: navPath.length === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
                cursor: navPath.length === 0 ? 'not-allowed' : 'pointer',
                padding: '4px 6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Back"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              disabled
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'not-allowed',
                padding: '4px 6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Forward"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Interactive Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}>
            <span
              onClick={() => handleNavigateToBreadcrumb(-1)}
              style={{
                color: navPath.length === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Database size={15} color="var(--accent)" />
              Storage
            </span>

            {navPath.map((item, idx) => (
              <React.Fragment key={item.id}>
                <span style={{ color: 'var(--border-strong)' }}>/</span>
                <span
                  onClick={() => handleNavigateToBreadcrumb(idx)}
                  style={{
                    color: idx === navPath.length - 1 ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: idx === navPath.length - 1 ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {item.name}
                </span>
              </React.Fragment>
            ))}

            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--text-muted)',
                fontWeight: 500,
                marginLeft: '4px',
              }}
            >
              {currentItems.length} items
            </span>
          </div>
        </div>

        {/* Center Search Bar */}
        <div style={{ flex: 1, maxWidth: '340px', position: 'relative' }}>
          <Search
            size={14}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search files & folders (⌘K)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px 6px 32px',
              borderRadius: '8px',
              background: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              outline: 'none',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Right Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* New Folder Button */}
          <button
            onClick={() => setShowNewFolderModal(true)}
            style={{
              background: 'var(--bg-surface-raised)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 150ms ease',
            }}
            title="Create New Folder"
          >
            <FolderPlus size={15} color="var(--accent)" />
            <span>New Folder</span>
          </button>

          {/* Upload / Import Button */}
          <button
            onClick={() => showToast('Import file dialog (Drag & drop is active)')}
            style={{
              background: '#ff6b35',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(255, 107, 53, 0.35)',
            }}
            title="Import or Upload files"
          >
            <Upload size={14} />
            <span>Import</span>
          </button>

          {/* View Mode Toggle: Grid vs List */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-surface-raised)',
              borderRadius: '8px',
              padding: '2px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? 'var(--bg-surface-overlay)' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                padding: '5px 7px',
                color: viewMode === 'grid' ? 'var(--accent)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Grid View"
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                background: viewMode === 'list' ? 'var(--bg-surface-overlay)' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                padding: '5px 7px',
                color: viewMode === 'list' ? 'var(--accent)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="List View"
            >
              <ListIcon size={15} />
            </button>
          </div>

          {/* Inspector Panel Toggle */}
          <button
            onClick={() => setShowInspector(!showInspector)}
            style={{
              background: showInspector ? 'rgba(255, 107, 53, 0.15)' : 'var(--bg-surface-raised)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 8px',
              color: showInspector ? 'var(--accent)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Toggle Details Inspector"
          >
            <Info size={16} />
          </button>
        </div>
      </div>

      {/* ─── Main Content Layout (Sidebar + Explorer Grid/List + Inspector) ─── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Navigator Sidebar (Mac Finder / Windows Quick Access) */}
        <div
          style={{
            width: '230px',
            background: 'var(--bg-surface-raised)',
            borderRight: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '14px 10px',
            overflowY: 'auto',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Quick Access / Starred */}
            <div>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '0 8px 6px',
                }}
              >
                Starred
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {[
                  {
                    id: 'qa-p2025',
                    name: 'Projects 2025',
                    count: 14,
                    icon: 'folder',
                    onClick: () => {
                      const photosShare = mockRootShares.find((s) => s.id === 'photos');
                      const p2025 = photosShare?.children?.find((c) => c.name === 'Projects 2025');
                      if (photosShare && p2025) {
                        setNavPath([photosShare, p2025]);
                        setSelectedItem(p2025.children && p2025.children.length > 0 ? p2025.children[0] : p2025);
                      }
                    },
                    isActive: navPath.length > 0 && navPath[navPath.length - 1].name === 'Projects 2025',
                  },
                  {
                    id: 'qa-photos',
                    name: 'Photos',
                    count: 1420,
                    icon: 'folder',
                    onClick: () => {
                      const photosShare = mockRootShares.find((s) => s.id === 'photos');
                      if (photosShare) {
                        setNavPath([photosShare]);
                        setSelectedItem(photosShare);
                      }
                    },
                    isActive: navPath.length === 1 && navPath[0].id === 'photos',
                  },
                  {
                    id: 'qa-nasa2',
                    name: 'Documents',
                    count: 320,
                    icon: 'folder',
                    onClick: () => {
                      const nasa2Share = mockRootShares.find((s) => s.id === 'nasa2');
                      if (nasa2Share) {
                        setNavPath([nasa2Share]);
                        setSelectedItem(nasa2Share);
                      }
                    },
                    isActive: navPath.length === 1 && navPath[0].id === 'nasa2',
                  },
                  {
                    id: 'qa-backup',
                    name: 'Backup',
                    count: 48,
                    icon: 'folder',
                    onClick: () => {
                      const bkpShare = mockRootShares.find((s) => s.id === 'backup_synology');
                      if (bkpShare) {
                        setNavPath([bkpShare]);
                        setSelectedItem(bkpShare);
                      }
                    },
                    isActive: navPath.length === 1 && navPath[0].id === 'backup_synology',
                  },
                  {
                    id: 'qa-appdata',
                    name: 'appdata',
                    count: 16,
                    icon: 'folder',
                    onClick: () => {
                      const appdataShare = mockRootShares.find((s) => s.id === 'appdata');
                      if (appdataShare) {
                        setNavPath([appdataShare]);
                        setSelectedItem(appdataShare);
                      }
                    },
                    isActive: navPath.length === 1 && navPath[0].id === 'appdata',
                  },
                ].map((item) => {
                  return (
                    <div
                      key={item.id}
                      onClick={item.onClick}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        background: item.isActive ? 'rgba(255, 107, 53, 0.16)' : 'transparent',
                        color: item.isActive ? 'var(--accent)' : 'var(--text-secondary)',
                        border: item.isActive ? '1px solid var(--accent)' : '1px solid transparent',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: item.isActive ? 700 : 500,
                        transition: 'all 120ms ease',
                      }}
                    >
                      <Folder size={14} color={item.isActive ? '#ff6b35' : '#f59e0b'} />
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </span>
                      {item.count && (
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.count}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Storage Pools Section */}
            <div>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '0 8px 6px',
                }}
              >
                Storage Pools
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {mockStoragePools.map((pool) => {
                  const isSelected = activePoolFilter === pool.type && navPath.length === 0;
                  return (
                    <div
                      key={pool.id}
                      onClick={() => {
                        setNavPath([]);
                        setActivePoolFilter(activePoolFilter === pool.type ? 'all' : pool.type);
                      }}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: isSelected ? 'rgba(255, 107, 53, 0.14)' : 'rgba(255, 255, 255, 0.03)',
                        cursor: 'pointer',
                        fontSize: '11px',
                        transition: 'background 120ms ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                          {pool.type === 'array' && <HardDrive size={13} color="#ff6b35" />}
                          {pool.type === 'cache' && <Zap size={13} color="#ffa066" />}
                          {pool.type === 'remote' && <Server size={13} color="#ffd1b3" />}
                          <span>{pool.name}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Free: {formatBytes(pool.freeBytes, 1)}</span>
                        <span>{Math.round((pool.usedBytes / pool.totalBytes) * 100)}%</span>
                      </div>
                    </div>
                  );
                })}

                {/* Recycle Bin / Trash */}
                <div
                  onClick={() => showToast('Trash: 24.8 GB recyclable items')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '11px',
                    marginTop: '2px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Trash2 size={13} />
                    <span>Recycle Bin</span>
                  </div>
                  <span style={{ fontSize: '10px' }}>24.8 GB</span>
                </div>
              </div>
            </div>

            {/* Network Shares & Protocols */}
            <div>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '0 8px 6px',
                }}
              >
                Network Sharing
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Share2 size={13} color="#22c55e" />
                    <span>SMB Windows</span>
                  </div>
                  <span style={{ fontSize: '9px', color: '#22c55e', fontWeight: 600 }}>Active</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={13} color="#ffa066" />
                    <span>Time Machine</span>
                  </div>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Back to Overview Pill */}
          {onBackToOverview && (
            <button
              onClick={onBackToOverview}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 10px',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '12px',
              }}
            >
              <ChevronLeft size={14} />
              <span>Back to Overview</span>
            </button>
          )}
        </div>

        {/* Center Explorer Content (Grid or List View) */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            padding: '18px 24px',
            background: 'var(--bg-canvas)',
          }}
        >
          {/* Active Path Description / Subtitle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
                {navPath.length === 0 ? 'All Shares & Storage' : navPath[navPath.length - 1].name}
              </h2>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {navPath.length === 0
                  ? 'High-level managed user shares and storage pools on NASA2'
                  : navPath[navPath.length - 1].comment || navPath[navPath.length - 1].path}
              </div>
            </div>

            {/* Filter Pill if pool is selected */}
            {activePoolFilter !== 'all' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 107, 53, 0.15)',
                  color: 'var(--accent)',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                <span>Filter: {activePoolFilter.toUpperCase()}</span>
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => setActivePoolFilter('all')} />
              </div>
            )}
          </div>

          {/* Empty state */}
          {currentItems.length === 0 && (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                gap: '12px',
                padding: '60px 0',
              }}
            >
              <Folder size={48} strokeWidth={1} />
              <div style={{ fontSize: '14px', fontWeight: 600 }}>This folder is empty</div>
              <button
                onClick={() => setShowNewFolderModal(true)}
                style={{
                  background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                + Create item
              </button>
            </div>
          )}

          {/* ─── Grid View (macOS Finder style as in reference image) ─── */}
          {viewMode === 'grid' && currentItems.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))',
                gap: '18px 16px',
                alignItems: 'start',
              }}
            >
              {currentItems.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    onDoubleClick={() => handleOpenFolder(item)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      padding: '12px 8px 10px',
                      borderRadius: '12px',
                      background: isSelected ? 'rgba(255, 107, 53, 0.16)' : 'transparent',
                      boxShadow: isSelected ? '0 0 0 1px var(--accent)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 120ms ease',
                      userSelect: 'none',
                    }}
                  >
                    {/* Icon Graphic */}
                    <div style={{ marginBottom: '8px' }}>{renderFileGlyph(item)}</div>

                    {/* Name */}
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? 'var(--text-primary)' : 'var(--text-primary)',
                        maxWidth: '120px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.3,
                      }}
                      title={item.name}
                    >
                      {item.name}
                    </span>

                    {/* Subtitle: Date or item count */}
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {item.type === 'folder'
                        ? `${item.itemCount ?? 0} items`
                        : formatBytes(item.sizeBytes, 1)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* ─── List View (Windows Explorer Details Table) ─── */}
          {viewMode === 'list' && currentItems.length > 0 && (
            <div
              style={{
                background: 'var(--bg-surface-raised)',
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr
                    style={{
                      background: 'var(--bg-surface-overlay)',
                      borderBottom: '1px solid var(--border-subtle)',
                      color: 'var(--text-muted)',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      textAlign: 'left',
                    }}
                  >
                    <th style={{ padding: '10px 14px' }}>Name</th>
                    <th style={{ padding: '10px 14px' }}>Storage Tier</th>
                    <th style={{ padding: '10px 14px' }}>Protection</th>
                    <th style={{ padding: '10px 14px' }}>Access</th>
                    <th style={{ padding: '10px 14px' }}>Size</th>
                    <th style={{ padding: '10px 14px' }}>Modified</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item) => {
                    const isSelected = selectedItem?.id === item.id;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        onDoubleClick={() => handleOpenFolder(item)}
                        style={{
                          background: isSelected ? 'rgba(255, 107, 53, 0.12)' : 'transparent',
                          borderBottom: '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          transition: 'background 100ms ease',
                        }}
                      >
                        {/* Name + Icon */}
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {item.type === 'folder' ? (
                              <Folder size={16} color="#f59e0b" />
                            ) : (
                              <FileText size={16} color="var(--text-secondary)" />
                            )}
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</span>
                          </div>
                        </td>

                        {/* Storage Tier */}
                        <td style={{ padding: '10px 14px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '10px',
                              fontWeight: 600,
                              background:
                                item.storageTier === 'cache'
                                  ? 'rgba(255, 107, 53, 0.15)'
                                  : 'rgba(255, 255, 255, 0.06)',
                              color: item.storageTier === 'cache' ? '#ff6b35' : 'var(--text-secondary)',
                            }}
                          >
                            {item.storageTier === 'cache' ? <Zap size={10} /> : <HardDrive size={10} />}
                            {item.storageTier === 'cache' ? 'NVMe Cache' : 'Data Array'}
                          </span>
                        </td>

                        {/* Protection */}
                        <td style={{ padding: '10px 14px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              color: item.protectionStatus === 'protected' ? '#22c55e' : '#ffa066',
                            }}
                          >
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: item.protectionStatus === 'protected' ? '#22c55e' : '#ffa066',
                              }}
                            />
                            {item.protectionStatus === 'protected' ? 'Protected' : 'Cache / Ingest'}
                          </span>
                        </td>

                        {/* Access */}
                        <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {item.accessLevel === 'private' ? <Lock size={12} /> : <Unlock size={12} />}
                            <span>{item.accessLevel === 'private' ? 'Private' : 'Public'}</span>
                          </div>
                        </td>

                        {/* Size */}
                        <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                          {formatBytes(item.sizeBytes, 1)}
                        </td>

                        {/* Modified */}
                        <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{item.modifiedDate}</td>

                        {/* Actions */}
                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyPath(item.path);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: '4px',
                            }}
                            title="Copy Network Path"
                          >
                            <Copy size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ─── Right Inspector Panel (macOS Finder Details Pane) ─── */}
        {showInspector && (
          <div
            style={{
              width: '280px',
              background: 'var(--bg-surface-raised)',
              borderLeft: '1px solid var(--border-subtle)',
              padding: '18px 16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflowY: 'auto',
              flexShrink: 0,
            }}
          >
            {selectedItem ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Header Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ marginBottom: '10px' }}>{renderFileGlyph(selectedItem)}</div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, wordBreak: 'break-all' }}>
                    {selectedItem.name}
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {selectedItem.type === 'folder' ? 'Folder Share' : 'Document File'} ·{' '}
                    {formatBytes(selectedItem.sizeBytes, 1)}
                  </span>
                </div>

                {/* Quick Network Share URL */}
                <div
                  style={{
                    background: 'var(--bg-surface-overlay)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Windows Network Share (SMB)
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent)',
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      \\NASA2\{selectedItem.name}
                    </span>
                    <button
                      onClick={() => handleCopyPath(selectedItem.path)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: copiedPath ? '#22c55e' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '2px',
                      }}
                      title="Copy SMB Path"
                    >
                      {copiedPath ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* Technical Properties in Human Language */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Storage Location</span>
                    <span style={{ fontWeight: 600 }}>
                      {selectedItem.storageTier === 'cache' ? 'NVMe Cache (Btrfs)' : 'Data Array (XFS)'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Parity Redundancy</span>
                    <span style={{ color: selectedItem.protectionStatus === 'protected' ? '#22c55e' : '#ffa066', fontWeight: 600 }}>
                      {selectedItem.protectionStatus === 'protected' ? 'Protected by Parity' : 'Staged on Cache'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Access Security</span>
                    <span style={{ fontWeight: 600 }}>
                      {selectedItem.accessLevel === 'private' ? 'Private (User: michael)' : 'Public (Local LAN)'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Filesystem Path</span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                        maxWidth: '150px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={selectedItem.path}
                    >
                      {selectedItem.path}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Last Modified</span>
                    <span>{selectedItem.modifiedDate}</span>
                  </div>
                </div>

                {/* Human Mover Explanation */}
                {selectedItem.storageTier === 'array' && (
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.4,
                    }}
                  >
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Unraid Mover:</span> Writes are accelerated by NVMe cache, then automatically moved to parity-protected disk storage every night at 03:00.
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', marginTop: '40px' }}>
                Select an item to view details
              </div>
            )}

            {/* Action Buttons at bottom of Inspector */}
            {selectedItem && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                <button
                  onClick={() => handleCopyPath(selectedItem.path)}
                  style={{
                    background: 'var(--bg-surface-overlay)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    padding: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <ExternalLink size={14} />
                  <span>Open in Explorer / Finder</span>
                </button>

                <button
                  onClick={() => showToast(`Share settings opened for ${selectedItem.name}`)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '8px',
                    color: 'var(--text-secondary)',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <SlidersHorizontal size={14} />
                  <span>Configure Share Settings</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Bottom Status Bar (matching reference bottom bar) ─── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 18px',
          background: 'var(--bg-surface-raised)',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '11px',
          color: 'var(--text-muted)',
        }}
      >
        {/* Full Path */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Database size={12} color="var(--accent)" />
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
            {navPath.length === 0 ? '/mnt/user' : navPath[navPath.length - 1].path}
          </span>
        </div>

        {/* Available Capacity Segmented Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: '5px',
                  height: '10px',
                  borderRadius: '1px',
                  backgroundColor: i < 3 ? '#ff6b35' : 'rgba(255, 255, 255, 0.15)',
                }}
              />
            ))}
          </div>
          <span>
            <strong style={{ color: 'var(--text-primary)' }}>5.65 TB Available</strong> / 8.0 TB Array
          </span>
        </div>
      </div>

      {/* ─── Create New Folder / Share Modal ─── */}
      {showNewFolderModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowNewFolderModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-surface)',
              borderRadius: '16px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              width: '420px',
              padding: '24px',
              color: 'var(--text-primary)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderPlus size={20} color="var(--accent)" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>New Folder Share</h3>
              </div>
              <button
                onClick={() => setShowNewFolderModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Folder Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Creative_Projects_2026"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-surface-raised)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Storage Pool Target
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setNewFolderTier('array')}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: newFolderTier === 'array' ? '1px solid #ff6b35' : '1px solid var(--border-subtle)',
                      background: newFolderTier === 'array' ? 'rgba(255, 107, 53, 0.12)' : 'var(--bg-surface-raised)',
                      color: newFolderTier === 'array' ? '#ff6b35' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '12px' }}>Protected Array</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>5.65 TB Free · Long term</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewFolderTier('cache')}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: newFolderTier === 'cache' ? '1px solid #ffa066' : '1px solid var(--border-subtle)',
                      background: newFolderTier === 'cache' ? 'rgba(255, 160, 102, 0.12)' : 'var(--bg-surface-raised)',
                      color: newFolderTier === 'cache' ? '#ffa066' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '12px' }}>Fast NVMe Cache</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>642 GB Free · High speed</div>
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Network Access (SMB)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface-raised)', padding: '10px 12px', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>Require Password (Private)</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Only authenticated user &apos;michael&apos; can access</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={newFolderPrivate}
                    onChange={(e) => setNewFolderPrivate(e.target.checked)}
                    style={{ accentColor: '#ff6b35', width: 16, height: 16 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    color: 'var(--text-secondary)',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (newFolderName.trim()) {
                      showToast(`Created folder share: ${newFolderName}`);
                      setShowNewFolderModal(false);
                      setNewFolderName('');
                    }
                  }}
                  style={{
                    background: '#ff6b35',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 18px',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Create Folder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
