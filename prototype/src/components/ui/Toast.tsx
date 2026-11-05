import React from 'react';
import { useServer } from '../../context/ServerContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useServer();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => {
        let Icon = Info;
        let color = 'var(--status-info)';
        if (toast.type === 'success') {
          Icon = CheckCircle2;
          color = 'var(--status-healthy)';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          color = 'var(--status-warning)';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          color = 'var(--status-danger)';
        }

        return (
          <div key={toast.id} className="toast" role="alert">
            <Icon size={16} color={color} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, color: 'var(--text-primary)' }}>{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="btn-ghost"
              style={{ padding: 2, display: 'flex' }}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

