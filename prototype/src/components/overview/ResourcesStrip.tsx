import React from 'react';
import { useServer } from '../../context/ServerContext';
import { formatBytes } from '../../utils/formatters';
import { ProgressBar } from '../ui/ProgressBar';
import {
  Cpu,
  Database,
  ArrowUpDown,
  Tv,
  ChevronRight,
  Flame,
  Zap,
} from 'lucide-react';

export const ResourcesStrip: React.FC = () => {
  const { state, openDrawer } = useServer();
  const { resources } = state;

  const ramUsedPercent = Math.round(
    (resources.ramUsedBytes / resources.ramTotalBytes) * 100
  );

  return (
    <div
      className="card resource-strip"
      style={{
        padding: '8px 14px',
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'wrap',
      }}
      role="region"
      aria-label="Telemetry Summary"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          flex: 1,
          alignItems: 'center',
        }}
      >
        {/* 1. CPU Telemetry */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 'var(--radius-xs)',
              background: 'var(--bg-surface-raised)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)',
              flexShrink: 0,
            }}
          >
            <Cpu size={14} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>CPU</span>
              <span className="text-mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {resources.cpuUsagePercent}%
              </span>
            </div>
            <div style={{ marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ flex: 1 }}>
                <ProgressBar percent={resources.cpuUsagePercent} variant="accent" height={3} />
              </div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {resources.cpuTempC}°C · {resources.cpuPwrWatts}W
              </span>
            </div>
          </div>
        </div>

        {/* 2. RAM Telemetry */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 'var(--radius-xs)',
              background: 'var(--bg-surface-raised)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--status-info)',
              flexShrink: 0,
            }}
          >
            <Database size={14} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>RAM (16G)</span>
              <span className="text-mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {ramUsedPercent}%
              </span>
            </div>
            <div style={{ marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ flex: 1 }}>
                <ProgressBar percent={ramUsedPercent} variant="info" height={3} />
              </div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {formatBytes(resources.ramUsedBytes, 1)} / {formatBytes(resources.ramTotalBytes, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Network Throughput */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 'var(--radius-xs)',
              background: 'var(--bg-surface-raised)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--status-healthy)',
              flexShrink: 0,
            }}
          >
            <ArrowUpDown size={14} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Network</span>
              <span className="text-mono" style={{ fontSize: '10px', color: 'var(--status-healthy)', fontWeight: 600 }}>
                1 Gbps (bond0)
              </span>
            </div>
            <div style={{ marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                ↓ <strong style={{ color: 'var(--text-primary)' }}>{resources.network.inboundKbps}</strong> Kbps
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                ↑ <strong style={{ color: 'var(--text-primary)' }}>{resources.network.outboundKbps}</strong> Kbps
              </span>
            </div>
          </div>
        </div>

        {/* 4. GPU Telemetry */}
        {resources.gpu && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 'var(--radius-xs)',
                background: 'var(--bg-surface-raised)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                flexShrink: 0,
              }}
            >
              <Tv size={14} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>RTX 3060</span>
                <span className="text-mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {resources.gpu.loadPercent}%
                </span>
              </div>
              <div style={{ marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ flex: 1 }}>
                  <ProgressBar percent={resources.gpu.loadPercent} variant="accent" height={3} />
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {resources.gpu.tempC}°C · {resources.gpu.powerWatts}W
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Button to expand Level 2/3 hardware drawer */}
      <button
        onClick={() => openDrawer({ type: 'resources' })}
        className="btn btn-ghost btn-sm"
        style={{ padding: '4px 6px', fontSize: '11px', color: 'var(--text-muted)' }}
        title="View 16 CPU threads and detailed memory map"
        type="button"
      >
        <span className="hide-on-mobile">Details</span>
        <ChevronRight size={13} />
      </button>
    </div>
  );
};

