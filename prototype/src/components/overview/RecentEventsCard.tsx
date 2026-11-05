import React from 'react';
import { useServer } from '../../context/ServerContext';
import {
  Activity,
  CheckCircle2,
  HardDrive,
  Shield,
  Clock,
  Sparkles,
  ChevronRight,
  BatteryCharging,
  Wifi,
} from 'lucide-react';

export const RecentEventsCard: React.FC = () => {
  const { state, openDrawer } = useServer();

  const events = [
    {
      id: '1',
      title: 'Mover Action Completed',
      desc: '14.2 GB moved from NVMe Cache to Array',
      time: '03:00',
      icon: HardDrive,
      color: 'var(--accent)',
    },
    {
      id: '2',
      title: 'Backup Snapshot Created',
      desc: 'Time Machine MacBook-Pro.sparsebundle sync',
      time: '02:15',
      icon: Shield,
      color: '#60a5fa',
    },
    {
      id: '3',
      title: 'Docker Library Indexed',
      desc: 'Plex scanned 12 new files in /Photos',
      time: '1h ago',
      icon: Sparkles,
      color: '#ffa066',
    },
    {
      id: '4',
      title: 'Parity Integrity Check',
      desc: '100% completed · 0 sync errors found',
      time: 'Yesterday',
      icon: CheckCircle2,
      color: 'var(--status-healthy)',
    },
  ];

  return (
    <div
      className="card recent-events-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '14px 16px',
        background: 'linear-gradient(165deg, rgba(96, 165, 250, 0.06) 0%, rgba(18, 20, 28, 0.90) 45%, rgba(18, 20, 28, 0.96) 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(96, 165, 250, 0.22)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(96, 165, 250, 0.06)',
        cursor: 'pointer',
      }}
      onClick={() => openDrawer({ type: 'resources' })}
      role="region"
      aria-label="Recent Events and Server Activity"
    >
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '8px',
                background: 'rgba(96, 165, 250, 0.14)',
                color: '#60a5fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Activity size={15} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                Recent Events
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                System Activity Log
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '10px',
              fontWeight: 600,
              padding: '2px 7px',
              borderRadius: 'var(--radius-pill)',
              background: 'rgba(34, 197, 94, 0.12)',
              color: 'var(--status-healthy)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--status-healthy)' }} />
            <span>Operational</span>
          </div>
        </div>

        {/* List of 4 recent events */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '4px 0 8px' }}>
          {events.map((ev) => {
            const Icon = ev.icon;
            return (
              <div
                key={ev.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '5px 8px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.025)',
                  transition: 'background 140ms ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <Icon size={12} color={ev.color} style={{ flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ev.title}
                    </div>
                    <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ev.desc}
                    </div>
                  </div>
                </div>

                <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-muted)', flexShrink: 0, marginLeft: '8px', fontFamily: 'var(--font-mono)' }}>
                  {ev.time}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Telemetry Pill Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '6px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '9.5px',
          color: 'var(--text-muted)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Shield size={10} color="var(--status-healthy)" />
          Parity Valid
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <BatteryCharging size={10} color="#60a5fa" />
          UPS 100% (45m)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Wifi size={10} color="#4ade80" />
          LAN 1 Gbps
        </span>
      </div>
    </div>
  );
};

