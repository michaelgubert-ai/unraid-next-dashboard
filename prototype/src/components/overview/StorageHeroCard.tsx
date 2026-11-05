import React from 'react';
import { useServer } from '../../context/ServerContext';
import { formatBytes, formatPercent } from '../../utils/formatters';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import {
  HardDrive,
  Shield,
  Zap,
  Sliders,
  ChevronRight,
  AlertTriangle,
  Disc,
} from 'lucide-react';

// Helper functions for segmented donut ring with rounded caps (Reference style)
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngleDeg: number, endAngleDeg: number) {
  const start = polarToCartesian(cx, cy, r, startAngleDeg);
  const end = polarToCartesian(cx, cy, r, endAngleDeg);
  const arcSweep = endAngleDeg - startAngleDeg <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${arcSweep} 1 ${end.x} ${end.y}`;
}

export const StorageHeroCard: React.FC = () => {
  const { state, openDrawer } = useServer();
  const { array, cache } = state.storage;

  const arrayPercent = formatPercent(array.usedBytes, array.totalBytes);
  const cachePercent = formatPercent(cache.usedBytes, cache.totalBytes);

  // Breakdown of Data Array usage by process/share categories (like RAM)
  const mediaBytes = Math.round(array.usedBytes * 0.702);
  const backupBytes = Math.round(array.usedBytes * 0.191);
  const systemBytes = Math.max(0, array.usedBytes - mediaBytes - backupBytes);
  const freeBytes = array.freeBytes;

  const degradedDisk = array.devices.find((d) => !d.smartHealthy || d.errorCount > 0);

  let overallStatusVariant: 'healthy' | 'warning' | 'danger' = 'healthy';
  let overallStatusText = 'All drives healthy';

  if (array.status === 'warning' || cache.status === 'warning') {
    overallStatusVariant = 'warning';
    overallStatusText = arrayPercent >= 90 ? 'Capacity > 90%' : 'Attention required';
  }
  if (degradedDisk) {
    overallStatusVariant = 'danger';
    overallStatusText = `${degradedDisk.name} degraded`;
  }
  if (array.parityStatus === 'checking') {
    overallStatusVariant = 'warning';
    overallStatusText = 'Parity check active';
  }

  return (
    <div
      className="card storage-hero-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '14px 16px',
        background: 'linear-gradient(150deg, rgba(255, 107, 53, 0.28) 0%, rgba(217, 72, 20, 0.16) 45%, rgba(18, 20, 28, 0.94) 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 107, 53, 0.42)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 24px rgba(255, 107, 53, 0.14)',
        outline: 'none',
      }}
      role="region"
      aria-label="Storage Summary"
    >
      {/* 1. Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(255, 107, 53, 0.35)',
                flexShrink: 0,
              }}
            >
              <HardDrive size={16} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
                  Storage
                </span>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '1px 5px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--accent-subtle)',
                    color: 'var(--accent)',
                  }}
                >
                  Primary
                </span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Protected Array & NVMe Pool
              </div>
            </div>
          </div>

          <Badge variant={overallStatusVariant}>
            {overallStatusText}
          </Badge>
        </div>

        {/* 2. Data Array Donut Ring (Left) + Breakdown Allocation (Right) */}
        <div style={{ margin: '2px 0 10px' }}>
          {/* Section Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '6px', fontSize: '11px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={12} color="var(--status-healthy)" />
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Data Array</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>(Parity Protected)</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
              Total: <strong style={{ color: 'var(--text-primary)' }}>{formatBytes(array.totalBytes, 0)}</strong>
            </div>
          </div>

          {/* 2-Column Grid: Donut Ring on Left, Breakdown List on Right */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '130px 1fr',
              gap: '12px',
              alignItems: 'center',
            }}
          >
            {/* Left: Segmented Donut Ring with Rounded Caps and Guaranteed Visible Gaps */}
            <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg
                width="130"
                height="130"
                viewBox="0 0 160 160"
                style={{ overflow: 'visible' }}
                role="img"
                aria-label={`Data Array: ${formatBytes(array.freeBytes, 2)} free, ${arrayPercent}% used`}
              >
                {(() => {
                  const cx = 80;
                  const cy = 80;
                  const r = 62;
                  const strokeWidth = 10;
                  // Gap of 16 degrees ensures ~7.5px visible gap between tips of rounded caps
                  const gapDeg = 16;
                  const numGaps = 4;
                  const totalGapAngle = numGaps * gapDeg; // 64 deg
                  const availableAngle = 360 - totalGapAngle; // 296 deg

                  // Proportional angle spans with minimum visible size (12 deg)
                  const rawSpans = [
                    (mediaBytes / array.totalBytes) * availableAngle,
                    (backupBytes / array.totalBytes) * availableAngle,
                    (systemBytes / array.totalBytes) * availableAngle,
                    (freeBytes / array.totalBytes) * availableAngle,
                  ];

                  // Enforce minimum angle so smaller segments have room for rounded caps
                  const minAngle = 12;
                  const spans = rawSpans.map((s) => Math.max(minAngle, s));
                  const sumSpans = spans.reduce((a, b) => a + b, 0);
                  const normalizedSpans = spans.map((s) => (s / sumSpans) * availableAngle);

                  const categories = [
                    { name: 'Media', color: '#ff6b35', span: normalizedSpans[0] },
                    { name: 'Backups', color: '#ffa066', span: normalizedSpans[1] },
                    { name: 'System', color: '#ffd1b3', span: normalizedSpans[2] },
                    { name: 'Free', color: 'rgba(255, 255, 255, 0.12)', span: normalizedSpans[3] },
                  ];

                  let currentAngle = 0; // Starts at 12 o'clock
                  return categories.map((cat, idx) => {
                    const startAngle = currentAngle;
                    const endAngle = currentAngle + cat.span;
                    currentAngle += cat.span + gapDeg;

                    return (
                      <path
                        key={idx}
                        d={describeArc(cx, cy, r, startAngle, endAngle)}
                        fill="none"
                        stroke={cat.color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        style={{ transition: 'stroke 200ms ease' }}
                      />
                    );
                  });
                })()}
              </svg>

              {/* Center Content: Big Free Terabytes */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                <div
                  style={{
                    fontSize: '23px',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {formatBytes(array.freeBytes, 2).split(' ')[0]}{' '}
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {formatBytes(array.freeBytes, 2).split(' ')[1]}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '8.5px',
                    fontWeight: 700,
                    color: arrayPercent >= 90 ? 'var(--status-warning)' : 'var(--accent)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginTop: '3px',
                  }}
                >
                  Array Free
                </div>

                <div
                  style={{
                    fontSize: '9px',
                    color: 'var(--text-muted)',
                    marginTop: '2px',
                  }}
                >
                  {arrayPercent}% used
                </div>
              </div>
            </div>

            {/* Right: Detailed Breakdown List utilizing the full card width */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', justifyContent: 'center' }}>
              {/* Media */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff6b35', flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Media</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {(mediaBytes / (1024 * 1024 * 1024 * 1024)).toFixed(2)} TB
                  </span>
                  <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', marginLeft: '4px' }}>
                    ({Math.round((mediaBytes / array.usedBytes) * 100)}%)
                  </span>
                </div>
              </div>

              {/* Backups */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffa066', flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Backups</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {(backupBytes / (1024 * 1024 * 1024 * 1024)).toFixed(2)} TB
                  </span>
                  <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', marginLeft: '4px' }}>
                    ({Math.round((backupBytes / array.usedBytes) * 100)}%)
                  </span>
                </div>
              </div>

              {/* System */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffd1b3', flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>System</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {(systemBytes / (1024 * 1024 * 1024 * 1024)).toFixed(2)} TB
                  </span>
                  <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', marginLeft: '4px' }}>
                    ({Math.round((systemBytes / array.usedBytes) * 100)}%)
                  </span>
                </div>
              </div>

              <div style={{ width: '100%', height: '1px', background: 'var(--border-subtle)', margin: '1px 0' }} />

              {/* Free Space */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.20)', flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Free Array</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)' }}>
                    {(freeBytes / (1024 * 1024 * 1024 * 1024)).toFixed(2)} TB
                  </span>
                  <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', marginLeft: '4px' }}>
                    ({100 - arrayPercent}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. NVMe Cache Gauge (Remains as a horizontal segmented line) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={12} color="var(--accent)" />
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>NVMe Cache</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>(Fast Tier)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>
                Used <strong style={{ color: 'var(--text-primary)' }}>{formatBytes(cache.usedBytes, 1)}</strong> of {formatBytes(cache.totalBytes, 0)}
              </span>
              <span style={{ fontWeight: 700, fontSize: '11px', fontFamily: 'var(--font-mono)', color: cachePercent >= 90 ? 'var(--status-warning)' : 'var(--text-primary)' }}>
                {cachePercent}%
              </span>
            </div>
          </div>
          <ProgressBar
            percent={cachePercent}
            variant={cachePercent >= 90 ? 'warning' : 'accent'}
            mode="segmented"
            segmentCount={32}
            height={10}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: 'var(--text-muted)', marginTop: '1px' }}>
            <span>{cache.devices[0]?.model || 'Corsair MP600 PRO'}</span>
            <span><strong style={{ color: 'var(--accent)' }}>{formatBytes(cache.freeBytes, 0)}</strong> Cache Free</span>
          </div>
        </div>
      </div>

      {/* Warning highlight if a disk is degraded */}
      {degradedDisk && (
        <div
          onClick={() => openDrawer({ type: 'disk', diskId: degradedDisk.id })}
          style={{
            marginTop: '12px',
            background: 'var(--status-danger-subtle)',
            border: '1px solid var(--status-danger-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
          role="button"
          tabIndex={0}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--status-danger)' }}>
            <AlertTriangle size={14} />
            <span style={{ fontWeight: 600 }}>{degradedDisk.name}: {degradedDisk.errorCount} SMART Sectors Degraded</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-primary)', textDecoration: 'underline' }}>
            Diagnose →
          </span>
        </div>
      )}
    </div>
  );
};
