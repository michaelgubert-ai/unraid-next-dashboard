import React from 'react';
import { useServer } from '../../context/ServerContext';
import { formatBytes } from '../../utils/formatters';
import { ProgressBar } from '../ui/ProgressBar';
import {
  Activity,
  Cpu,
  Database,
  ArrowUpDown,
  Tv,
  ChevronRight,
  Flame,
  Zap,
} from 'lucide-react';

export const ResourcesSection: React.FC = () => {
  const { state, openDrawer } = useServer();
  const { resources } = state;

  const ramUsedPercent = Math.round(
    (resources.ramUsedBytes / resources.ramTotalBytes) * 100
  );

  return (
    <section className="card" style={{ marginBottom: 'var(--space-md)' }} aria-labelledby="resources-title">
      <div className="card-header">
        <div className="card-title-group">
          <Activity size={18} color="var(--accent)" />
          <div>
            <h2 id="resources-title" className="card-title">
              System Resources & Telemetry
            </h2>
            <div className="card-subtitle">
              {resources.cpuModel.split('@')[0]} · {resources.cpuThreadsTotal} Threads
            </div>
          </div>
        </div>

        <button
          onClick={() => openDrawer({ type: 'resources' })}
          className="btn btn-ghost btn-sm"
          type="button"
        >
          <span>Hardware Details</span>
          <ChevronRight size={14} />
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
        }}
      >
        {/* 1. CPU Widget */}
        <div
          style={{
            background: 'var(--bg-surface-raised)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <Cpu size={15} />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Processor</span>
            </div>
            <span className="text-mono" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {resources.cpuUsagePercent}%
            </span>
          </div>

          <ProgressBar
            percent={resources.cpuUsagePercent}
            variant="accent"
            height={4}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: 'var(--text-muted)',
              marginTop: '8px',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <Flame size={12} color="var(--accent)" />
              {resources.cpuTempC}°C
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <Zap size={12} />
              {resources.cpuPwrWatts} W
            </span>
          </div>
        </div>

        {/* 2. RAM Widget */}
        <div
          style={{
            background: 'var(--bg-surface-raised)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <Database size={15} />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Memory (DDR5)</span>
            </div>
            <span className="text-mono" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {ramUsedPercent}%
            </span>
          </div>

          <ProgressBar
            percent={ramUsedPercent}
            variant="accent"
            height={4}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: 'var(--text-muted)',
              marginTop: '8px',
            }}
          >
            <span>Docker: {formatBytes(resources.ramDockerBytes, 1)}</span>
            <span>Free: {formatBytes(resources.ramFreeBytes, 1)}</span>
          </div>
        </div>

        {/* 3. Network Widget */}
        <div
          style={{
            background: 'var(--bg-surface-raised)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <ArrowUpDown size={15} />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Network Throughput</span>
            </div>
            <span className="badge badge-healthy" style={{ fontSize: '9px', padding: '1px 5px' }}>
              1 Gbps
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '10px',
              fontSize: '12px',
            }}
          >
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>DOWN (RX)</div>
              <div className="text-mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {resources.network.inboundKbps} Kbps
              </div>
            </div>

            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>UP (TX)</div>
              <div className="text-mono" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {resources.network.outboundKbps} Kbps
              </div>
            </div>
          </div>
        </div>

        {/* 4. GPU Widget */}
        {resources.gpu && (
          <div
            style={{
              background: 'var(--bg-surface-raised)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                <Tv size={15} />
                <span style={{ fontSize: '12px', fontWeight: 600 }}>GeForce RTX 3060</span>
              </div>
              <span className="text-mono" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {resources.gpu.loadPercent}%
              </span>
            </div>

            <ProgressBar
              percent={resources.gpu.loadPercent}
              variant="accent"
              height={4}
            />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: 'var(--text-muted)',
                marginTop: '8px',
              }}
            >
              <span>{resources.gpu.tempC}°C</span>
              <span>{resources.gpu.powerWatts} W (P8 Idle)</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

