import React from 'react';
import { ArrowLeft, Compass, HardDrive, Boxes, Cpu, History, Settings } from 'lucide-react';

interface StubViewProps {
  tabId: string;
  onBackToOverview: () => void;
}

export const StubView: React.FC<StubViewProps> = ({ tabId, onBackToOverview }) => {
  const getTabDetails = () => {
    switch (tabId) {
      case 'storage':
        return {
          title: 'Storage Management',
          icon: HardDrive,
          description:
            'This dedicated section will host deep storage operations: Share permission matrices, ZFS dataset configurations, Mover scheduling rules, and Unassigned disk automounting.',
          note: 'In this v0.1 research prototype, all daily Array and Cache pool operations, spin states, and device diagnostics are fully accessible directly inside the Unified Overview.',
        };
      case 'apps':
        return {
          title: 'Apps & Service Catalog',
          icon: Boxes,
          description:
            'This section will house the full Community Applications app store, template repositories, and Docker network topology diagrams.',
          note: 'All installed containers, live start/stop controls, and stdout logs are active in the Unified Overview.',
        };
      case 'vms':
        return {
          title: 'Virtual Machines',
          icon: Cpu,
          description:
            'This section will provide VNC / NoVNC console windows, GPU/USB hardware pass-through selectors, and VM snapshot management.',
          note: 'Basic VM state and controls are exposed on the Unified Overview.',
        };
      case 'activity':
        return {
          title: 'Activity & Audit Logs',
          icon: History,
          description:
            'This section will offer full syslog filtering, notifications history, SMART test schedules, and Unraid OS update history.',
          note: 'High-signal recent events are visible in the Recent Activity card on Overview.',
        };
      case 'settings':
        return {
          title: 'Settings & System Tools',
          icon: Settings,
          description:
            'This section consolidates server identity, network bonds, users & authentication, flash drive backups, and plugin installations.',
          note: 'Server identity and network status are integrated in the top header and hardware drawer.',
        };
      default:
        return {
          title: 'Section Overview',
          icon: Compass,
          description: 'This area is mapped for subsequent implementation steps.',
          note: 'Return to the Unified Overview to interact with the core prototype.',
        };
    }
  };

  const details = getTabDetails();
  const Icon = details.icon;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
        maxWidth: '560px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-surface-raised)',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent)',
          marginBottom: '20px',
        }}
      >
        <Icon size={28} />
      </div>

      <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
        {details.title}
      </h2>

      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
        {details.description}
      </p>

      <div
        style={{
          background: 'var(--bg-surface-raised)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          fontSize: '12px',
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          marginBottom: '24px',
          textAlign: 'left',
        }}
      >
        <strong style={{ color: 'var(--accent)' }}>Prototype Scope: </strong>
        {details.note}
      </div>

      <button
        onClick={onBackToOverview}
        className="btn btn-primary"
        style={{ gap: '8px' }}
        type="button"
      >
        <ArrowLeft size={16} />
        <span>Return to Unified Overview</span>
      </button>
    </div>
  );
};

