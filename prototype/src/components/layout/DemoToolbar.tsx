import React from 'react';
import { useServer } from '../../context/ServerContext';
import { SCENARIO_LIST, ScenarioType } from '../../types/scenario';
import { RotateCcw, ShieldCheck, Database, AlertCircle, PlayCircle } from 'lucide-react';

export const DemoToolbar: React.FC = () => {
  const { scenario, setScenario, resetDemo } = useServer();

  return (
    <aside className="demo-toolbar" aria-label="Demo simulation toolbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <span
          style={{
            background: 'var(--accent)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '4px',
            letterSpacing: '0.05em',
          }}
        >
          DEMO
        </span>
        <span className="text-secondary" style={{ fontSize: '11px' }}>
          Simulated Sandbox · Zero real server connections
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', padding: '2px 0' }}>
        <span className="text-muted" style={{ fontSize: '11px', marginRight: '4px' }}>
          Scenarios:
        </span>
        {SCENARIO_LIST.map((sc) => (
          <button
            key={sc.id}
            onClick={() => setScenario(sc.id)}
            className={`demo-chip ${scenario === sc.id ? 'active' : ''}`}
            title={sc.description}
            type="button"
          >
            {sc.title}
          </button>
        ))}

        <button
          onClick={resetDemo}
          className="btn btn-sm btn-ghost"
          style={{ fontSize: '11px', gap: '4px', marginLeft: '6px', color: 'var(--text-secondary)' }}
          title="Reset local state to baseline"
          type="button"
        >
          <RotateCcw size={12} />
          Reset State
        </button>
      </div>
    </aside>
  );
};

