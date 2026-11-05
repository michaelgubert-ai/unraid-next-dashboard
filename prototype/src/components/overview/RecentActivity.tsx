import React from 'react';
import { useServer } from '../../context/ServerContext';
import { History, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export const RecentActivity: React.FC = () => {
  const { state } = useServer();
  const { activityLog } = state;

  return (
    <section className="card" aria-labelledby="activity-title">
      <div className="card-header">
        <div className="card-title-group">
          <History size={18} color="var(--accent)" />
          <div>
            <h2 id="activity-title" className="card-title">
              Recent System Activity
            </h2>
            <div className="card-subtitle">Validated background tasks & maintenance events</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {activityLog.slice(0, 4).map((item) => {
          let Icon = CheckCircle2;
          let color = 'var(--status-healthy)';
          if (item.status === 'warning') {
            Icon = AlertTriangle;
            color = 'var(--status-warning)';
          } else if (item.status === 'info') {
            Icon = Info;
            color = 'var(--status-info)';
          } else if (item.status === 'neutral') {
            Icon = CheckCircle2;
            color = 'var(--text-muted)';
          }

          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: 'var(--bg-surface-raised)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={16} color={color} style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{item.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.detail}</div>
                </div>
              </div>

              <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {item.timeAgo}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

