import React, { useState } from 'react';
import { useServer } from '../../context/ServerContext';
import {
  Sliders,
  Shield,
  FolderSync,
  Power,
  RotateCw,
  AlertTriangle,
  X,
  Play,
  Square,
  HelpCircle,
} from 'lucide-react';

export const ParityActionModal: React.FC = () => {
  const {
    state,
    closeDrawer,
    triggerParityCheck,
    triggerMover,
    showToast,
  } = useServer();

  const [confirmStopArray, setConfirmStopArray] = useState(false);

  const handleSpinAll = (action: 'up' | 'down') => {
    showToast(
      `All array disks commanded to ${action === 'up' ? 'spin up' : 'spin down to standby'} (Simulated).`,
      'info'
    );
    closeDrawer();
  };

  const handleStopArray = () => {
    showToast('Array stopped cleanly (Simulated). Array is now offline.', 'warning');
    closeDrawer();
  };

  return (
    <div className="drawer-backdrop" onClick={closeDrawer} role="dialog" aria-modal="true" aria-labelledby="array-modal-title">
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)',
              }}
            >
              <Sliders size={18} />
            </div>
            <div>
              <h3 id="array-modal-title" style={{ fontSize: '15px', fontWeight: 700 }}>
                Array Operations & Maintenance
              </h3>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Protected Storage Management
              </div>
            </div>
          </div>

          <button onClick={closeDrawer} className="btn-ghost" style={{ padding: 6 }} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="drawer-body">
          {/* Parity Check Card */}
          <div
            style={{
              padding: '14px',
              background: 'var(--bg-surface-raised)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Shield size={18} color="var(--status-healthy)" style={{ marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>Parity Verification Check</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>
                    Reads all data disks and computes checksums against Parity 1.
                  </div>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Last completed check: {state.info.lastParityCheck.date} ({state.info.lastParityCheck.errors} sync errors)
            </div>

            <button
              onClick={() => {
                triggerParityCheck();
                closeDrawer();
              }}
              className="btn btn-primary btn-sm"
              style={{ alignSelf: 'flex-start', marginTop: 4 }}
              type="button"
            >
              <Play size={12} />
              <span>Start Parity Check</span>
            </button>
          </div>

          {/* Mover Card */}
          <div
            style={{
              padding: '14px',
              background: 'var(--bg-surface-raised)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', gap: '10px' }}>
              <FolderSync size={18} color="var(--accent)" style={{ marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px' }}>Invoke Cache Mover</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>
                  Transfers completed files from NVMe cache pool to long-term array storage according to share rules.
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                triggerMover();
                closeDrawer();
              }}
              className="btn btn-secondary btn-sm"
              style={{ alignSelf: 'flex-start', marginTop: 4 }}
              type="button"
            >
              <FolderSync size={12} />
              <span>Run Mover Now</span>
            </button>
          </div>

          {/* Disk Power Management */}
          <div
            style={{
              padding: '14px',
              background: 'var(--bg-surface-raised)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', gap: '10px' }}>
              <Power size={18} color="var(--text-secondary)" style={{ marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px' }}>Bulk Disk Power Controls</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>
                  Immediately spin up or spin down all mechanical array disks.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: 4 }}>
              <button
                onClick={() => handleSpinAll('up')}
                className="btn btn-secondary btn-sm"
                type="button"
              >
                <span>Spin Up All Disks</span>
              </button>
              <button
                onClick={() => handleSpinAll('down')}
                className="btn btn-secondary btn-sm"
                type="button"
              >
                <span>Spin Down All Disks</span>
              </button>
            </div>
          </div>

          {/* Dangerous Zone */}
          <div
            style={{
              padding: '14px',
              background: 'rgba(239, 68, 68, 0.05)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--status-danger-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', gap: '10px' }}>
              <AlertTriangle size={18} color="var(--status-danger)" style={{ marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--status-danger)' }}>
                  Array State Control
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>
                  Stopping the array unmounts all shares and stops all Docker containers.
                </div>
              </div>
            </div>

            {confirmStopArray ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 6 }}>
                <span style={{ fontSize: '12px', color: 'var(--status-danger)', fontWeight: 600 }}>
                  Are you sure? All shares and docker apps will go offline!
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleStopArray}
                    className="btn btn-danger btn-sm"
                    type="button"
                  >
                    Confirm Stop Array
                  </button>
                  <button
                    onClick={() => setConfirmStopArray(false)}
                    className="btn btn-secondary btn-sm"
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmStopArray(true)}
                className="btn btn-danger btn-sm"
                style={{ alignSelf: 'flex-start', marginTop: 4 }}
                type="button"
              >
                <Square size={12} />
                <span>Stop Array (Take Offline)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

