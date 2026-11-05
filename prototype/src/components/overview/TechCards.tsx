import React from 'react';
import { useServer } from '../../context/ServerContext';
import {
  Cpu,
  Database,
  ArrowUpDown,
  Sparkles,
  Flame,
} from 'lucide-react';

/* ─── Shared Compact Tech Icon Pill ─── */
const CompactTechIcon: React.FC<{ bg?: string; color?: string; children: React.ReactNode }> = ({
  bg = 'var(--accent-subtle)',
  color = 'var(--accent)',
  children,
}) => (
  <div
    style={{
      width: 24,
      height: 24,
      borderRadius: '7px',
      background: bg,
      color: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    {children}
  </div>
);

/* ─── Compact CPU Card ─── */
export const CpuCard: React.FC = () => {
  const { state, openDrawer } = useServer();
  const { resources } = state;
  const temp = resources.cpuTempC || 31;
  const loadPercent = resources.cpuUsagePercent || 3;
  const clockMhz = 4650;
  const fanRpm = 895;

  // 16-segment mini progress bar for load
  const totalSegments = 16;
  const activeSegments = Math.max(1, Math.round((loadPercent / 100) * totalSegments));

  return (
    <div
      className="card tech-metric-card"
      onClick={() => openDrawer({ type: 'resources' })}
      role="button"
      tabIndex={0}
      aria-label="CPU details"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') openDrawer({ type: 'resources' });
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '12px 14px',
        cursor: 'pointer',
        minHeight: '94px',
      }}
    >
      {/* Top: Icon + Title + Temp Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CompactTechIcon>
            <Cpu size={13} />
          </CompactTechIcon>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>CPU</span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>i5-12600K</span>
          </div>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            fontSize: '11px',
            fontWeight: 600,
            padding: '2px 7px',
            borderRadius: 'var(--radius-pill)',
            background: temp > 70 ? 'var(--status-warning-subtle)' : 'var(--bg-surface-raised)',
            color: temp > 70 ? 'var(--status-warning)' : 'var(--text-secondary)',
          }}
        >
          <Flame size={11} color="var(--accent)" />
          <span>{temp}°C</span>
        </div>
      </div>

      {/* Middle: Big Load % + 16-Segment mini bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0 2px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', flexShrink: 0 }}>
          <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
            {loadPercent}%
          </span>
          <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
            LOAD
          </span>
        </div>

        {/* 16-Segment mini bar */}
        <div style={{ display: 'flex', gap: '2px', flex: 1, height: '6px', alignItems: 'center' }}>
          {Array.from({ length: totalSegments }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: '100%',
                borderRadius: '1.5px',
                background: i < activeSegments ? '#ff6b35' : 'rgba(255, 255, 255, 0.10)',
                transition: 'background-color 200ms ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom: Subtle compact sub-stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: 'var(--text-muted)' }}>
        <span>Clock <strong style={{ color: 'var(--text-secondary)' }}>{(clockMhz / 1000).toFixed(2)} GHz</strong></span>
        <span>Fan <strong style={{ color: 'var(--text-secondary)' }}>{fanRpm} RPM</strong></span>
      </div>
    </div>
  );
};

/* ─── Compact RAM Card ─── */
export const RamCard: React.FC = () => {
  const { state, openDrawer } = useServer();
  const { resources } = state;
  const ramUsedPercent = Math.round((resources.ramUsedBytes / resources.ramTotalBytes) * 100);
  const systemGB = (resources.ramSystemBytes / (1024 * 1024 * 1024)).toFixed(1);
  const dockerGB = (resources.ramDockerBytes / (1024 * 1024 * 1024)).toFixed(1);
  const freeGB = ((resources.ramAvailableBytes || resources.ramFreeBytes) / (1024 * 1024 * 1024)).toFixed(1);

  // 16 segments: ~4 System (#ff6b35), ~3 Docker (#ffa066), 9 Free
  const totalSegments = 16;
  const sysSeg = 4;
  const dockSeg = 3;

  return (
    <div
      className="card tech-metric-card"
      onClick={() => openDrawer({ type: 'resources' })}
      role="button"
      tabIndex={0}
      aria-label="RAM details"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') openDrawer({ type: 'resources' });
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '12px 14px',
        cursor: 'pointer',
        minHeight: '94px',
      }}
    >
      {/* Top: Icon + Title + Percent Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CompactTechIcon>
            <Database size={13} />
          </CompactTechIcon>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>RAM</span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>16 GB DDR5</span>
          </div>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: '11px',
            fontWeight: 600,
            padding: '2px 7px',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--bg-surface-raised)',
            color: 'var(--accent)',
          }}
        >
          <span>{ramUsedPercent}% used</span>
        </div>
      </div>

      {/* Middle: Big Metric + 16-Segment mini bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0 2px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', flexShrink: 0 }}>
          <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
            16.0
          </span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
            GB
          </span>
        </div>

        {/* 16-Segment mini bar */}
        <div style={{ display: 'flex', gap: '2px', flex: 1, height: '6px', alignItems: 'center' }}>
          {Array.from({ length: totalSegments }).map((_, i) => {
            let color = 'rgba(255, 255, 255, 0.10)';
            if (i < sysSeg) color = '#ff6b35';
            else if (i < sysSeg + dockSeg) color = '#ffa066';
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: '100%',
                  borderRadius: '1.5px',
                  background: color,
                  transition: 'background-color 200ms ease',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom: Subtle breakdown text */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: 'var(--text-muted)' }}>
        <span>System <strong style={{ color: '#ff6b35' }}>{systemGB}G</strong></span>
        <span>Docker <strong style={{ color: '#ffa066' }}>{dockerGB}G</strong></span>
        <span>Free <strong style={{ color: 'var(--text-secondary)' }}>{freeGB}G</strong></span>
      </div>
    </div>
  );
};

/* ─── Compact Network Card ─── */
export const NetworkCard: React.FC = () => {
  const { state, openDrawer } = useServer();
  const { resources } = state;
  const inSpeed = resources.network.inboundKbps;
  const outSpeed = resources.network.outboundKbps;

  return (
    <div
      className="card tech-metric-card"
      onClick={() => openDrawer({ type: 'resources' })}
      role="button"
      tabIndex={0}
      aria-label="Network details"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') openDrawer({ type: 'resources' });
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '12px 14px',
        cursor: 'pointer',
        minHeight: '94px',
      }}
    >
      {/* Top: Icon + Title + Interface */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CompactTechIcon>
            <ArrowUpDown size={13} />
          </CompactTechIcon>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Network</span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>1 Gbps</span>
          </div>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: '10px',
            fontWeight: 600,
            padding: '2px 7px',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--bg-surface-raised)',
            color: 'var(--text-secondary)',
          }}
        >
          <span>eth0</span>
        </div>
      </div>

      {/* Middle: Clean Down & Up throughput */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', margin: '4px 0 2px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#ff6b35' }}>↓</span>
          <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {inSpeed}
          </span>
          <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Kbps</span>
        </div>

        <div style={{ width: 1, height: 18, background: 'var(--border-subtle)' }} />

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#ffa066' }}>↑</span>
          <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {outSpeed}
          </span>
          <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Kbps</span>
        </div>
      </div>

      {/* Bottom: Active process info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: 'var(--text-muted)' }}>
        <span>Active <strong style={{ color: 'var(--text-secondary)' }}>Plex Stream</strong></span>
        <span>Bond <strong style={{ color: 'var(--status-healthy)' }}>Healthy</strong></span>
      </div>
    </div>
  );
};

/* ─── Compact GPU Card ─── */
export const GpuCard: React.FC = () => {
  const { state, openDrawer } = useServer();
  const { resources } = state;
  const gpu = resources.gpu;
  if (!gpu) return null;

  const usedVram = '3.85';
  const totalVram = '12';
  const vramPercent = 32;

  // 16 segments: 3 NVENC (#ff6b35), 2 Immich (#ffa066), 11 Free
  const totalSegments = 16;
  const nvencSeg = 3;
  const immichSeg = 2;

  return (
    <div
      className="card tech-metric-card"
      onClick={() => openDrawer({ type: 'resources' })}
      role="button"
      tabIndex={0}
      aria-label="GPU details"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') openDrawer({ type: 'resources' });
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '12px 14px',
        cursor: 'pointer',
        minHeight: '94px',
      }}
    >
      {/* Top: Icon + Title + Percent Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CompactTechIcon>
            <Sparkles size={13} />
          </CompactTechIcon>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>GPU</span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>RTX 3060</span>
          </div>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: '11px',
            fontWeight: 600,
            padding: '2px 7px',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--bg-surface-raised)',
            color: 'var(--accent)',
          }}
        >
          <span>{vramPercent}% VRAM</span>
        </div>
      </div>

      {/* Middle: Big Metric + 16-Segment mini bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0 2px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', flexShrink: 0 }}>
          <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
            {usedVram}
          </span>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
            /{totalVram} GB
          </span>
        </div>

        {/* 16-Segment mini bar */}
        <div style={{ display: 'flex', gap: '2px', flex: 1, height: '6px', alignItems: 'center' }}>
          {Array.from({ length: totalSegments }).map((_, i) => {
            let color = 'rgba(255, 255, 255, 0.10)';
            if (i < nvencSeg) color = '#ff6b35';
            else if (i < nvencSeg + immichSeg) color = '#ffa066';
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: '100%',
                  borderRadius: '1.5px',
                  background: color,
                  transition: 'background-color 200ms ease',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom: Subtle status text */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: 'var(--text-muted)' }}>
        <span>Encode <strong style={{ color: '#ff6b35' }}>NVENC 1080p</strong></span>
        <span>Temp <strong style={{ color: 'var(--text-secondary)' }}>44°C</strong></span>
      </div>
    </div>
  );
};
