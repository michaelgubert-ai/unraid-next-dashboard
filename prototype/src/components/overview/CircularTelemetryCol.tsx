import React, { useState } from 'react';
import { useServer } from '../../context/ServerContext';
import { Cpu, Database, ArrowUpDown, Sparkles } from 'lucide-react';

interface MiniCircleWidgetProps {
  id: string;
  label: string;
  value: string;
  sublabel?: string;
  percent: number;
  color?: string;
  tooltipTitle: string;
  tooltipDetail: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

const MiniCircleWidget: React.FC<MiniCircleWidgetProps> = ({
  label,
  value,
  percent,
  color = '#ff6b35',
  tooltipTitle,
  tooltipDetail,
  onClick,
}) => {
  const [hovered, setHovered] = useState(false);

  const size = 52;
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;

  return (
    <div
      style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={onClick}
        type="button"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'rgba(18, 20, 28, 0.86)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: hovered ? '1px solid var(--accent)' : '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: hovered
            ? '0 6px 20px rgba(255, 107, 53, 0.35), 0 2px 6px rgba(0,0,0,0.4)'
            : '0 4px 16px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
          position: 'relative',
          transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
          transform: hovered ? 'scale(1.08)' : 'scale(1)',
        }}
        aria-label={`${label}: ${value}`}
      >
        {/* SVG Circular Progress Track & Filled Arc */}
        <svg
          width={size}
          height={size}
          style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)', overflow: 'visible' }}
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.10)"
            strokeWidth={strokeWidth}
          />
          {/* Active Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 300ms ease' }}
          />
        </svg>

        {/* Center Metric & Label */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {value}
          </span>
          <span
            style={{
              fontSize: '8px',
              fontWeight: 700,
              color: color,
              letterSpacing: '0.04em',
              marginTop: '2px',
              textTransform: 'uppercase',
            }}
          >
            {label}
          </span>
        </div>
      </button>

      {/* Floating Hover Tooltip (appears smoothly to the right or left) */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            right: 'calc(100% + 10px)',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(18, 20, 28, 0.96)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: '10px',
            padding: '7px 11px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.65)',
            zIndex: 90,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: color }}>●</span>
            {tooltipTitle}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
            {tooltipDetail}
          </div>
        </div>
      )}
    </div>
  );
};

export const CircularTelemetryCol: React.FC = () => {
  const { state, openDrawer } = useServer();
  const { resources } = state;

  const cpuLoad = resources.cpuUsagePercent || 3;
  const cpuTemp = resources.cpuTempC || 31;

  const ramUsedPercent = Math.round((resources.ramUsedBytes / resources.ramTotalBytes) * 100);
  const ramGB = (resources.ramUsedBytes / (1024 * 1024 * 1024)).toFixed(0);

  const netKbps = resources.network.outboundKbps || 108.6;
  const inKbps = resources.network.inboundKbps || 24.5;

  const gpuPercent = 32;
  const gpuUsedGB = '3.8';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
        height: '100%',
        minHeight: '220px',
      }}
      role="group"
      aria-label="Hardware telemetry circles"
    >
      {/* 1. CPU Circle */}
      <MiniCircleWidget
        id="cpu"
        label="CPU"
        value={`${cpuLoad}%`}
        percent={cpuLoad}
        color="#ff6b35"
        tooltipTitle={`CPU: ${cpuLoad}% Load · ${cpuTemp}°C`}
        tooltipDetail="Intel i5-12600K · 4.65 GHz · Fan 895 RPM"
        onClick={() => openDrawer({ type: 'resources' })}
      />

      {/* 2. RAM Circle */}
      <MiniCircleWidget
        id="ram"
        label="RAM"
        value={`${ramUsedPercent}%`}
        percent={ramUsedPercent}
        color="#ffa066"
        tooltipTitle={`RAM: ${ramGB} GB Used (${ramUsedPercent}%)`}
        tooltipDetail="DDR5 16.0 GB · System 3.6G · Docker 2.6G"
        onClick={() => openDrawer({ type: 'resources' })}
      />

      {/* 3. Network Circle */}
      <MiniCircleWidget
        id="net"
        label="NET"
        value={`${Math.round(netKbps)}K`}
        percent={Math.min(100, Math.round((netKbps / 1000) * 100))}
        color="#4ade80"
        tooltipTitle={`Network: ↓ ${inKbps}K · ↑ ${netKbps}K`}
        tooltipDetail="Interface eth0 · 1 Gbps Link Active"
        onClick={() => openDrawer({ type: 'resources' })}
      />

      {/* 4. GPU Circle */}
      <MiniCircleWidget
        id="gpu"
        label="GPU"
        value={`${gpuPercent}%`}
        percent={gpuPercent}
        color="#fb923c"
        tooltipTitle={`GPU: RTX 3060 (${gpuPercent}% VRAM)`}
        tooltipDetail={`${gpuUsedGB} / 12 GB · Plex NVENC 1080p · 44°C`}
        onClick={() => openDrawer({ type: 'resources' })}
      />
    </div>
  );
};

