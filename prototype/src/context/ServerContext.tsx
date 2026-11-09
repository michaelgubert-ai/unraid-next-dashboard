import React, { createContext, useContext, useEffect, useState } from 'react';
import { ServerState, DiskDevice, DockerApp } from '../types/server';
import { ScenarioType } from '../types/scenario';
import { mockAdapter } from '../mock/mockAdapter';

export type DrawerState =
  | { type: 'disk'; diskId: string }
  | { type: 'app'; appId: string }
  | { type: 'resources' }
  | { type: 'array_action' }
  | null;

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface ServerContextValue {
  state: ServerState;
  isLive: boolean;
  scenario: ScenarioType;
  setScenario: (scenario: ScenarioType) => void;
  activeDrawer: DrawerState;
  openDrawer: (drawer: DrawerState) => void;
  closeDrawer: () => void;
  toggleDiskSpin: (diskId: string) => void;
  startApp: (appId: string) => void;
  stopApp: (appId: string) => void;
  restartApp: (appId: string) => void;
  triggerParityCheck: () => void;
  pauseParityCheck: () => void;
  cancelParityCheck: () => void;
  triggerMover: () => void;
  resetDemo: () => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;
}

const ServerContext = createContext<ServerContextValue | undefined>(undefined);

export const ServerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ServerState>(mockAdapter.getState());
  const [isLive, setIsLive] = useState(false);
  const [scenario, setScenarioState] = useState<ScenarioType>('healthy');
  const [activeDrawer, setActiveDrawer] = useState<DrawerState>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    let timer: number | null = null;
    let isSubscribed = true;

    async function checkAndPollApi() {
      // If user is intentionally running a mock scenario other than healthy, keep mock
      if (scenario !== 'healthy') {
        setIsLive(false);
        const unsubscribe = mockAdapter.subscribe((updatedState) => {
          if (isSubscribed) setState(updatedState);
        });
        return unsubscribe;
      }

      try {
        const res = await fetch('/api/status');
        if (res.ok) {
          const data = await res.json();
          if (isSubscribed) {
            setState(data);
            setIsLive(Boolean(data._isLive !== false));
          }
          timer = window.setTimeout(checkAndPollApi, 3000);
          return;
        }
      } catch {
        // Fall back to mock
      }

      if (isSubscribed) {
        setIsLive(false);
        const unsubscribe = mockAdapter.subscribe((updatedState) => {
          if (isSubscribed) setState(updatedState);
        });
        return unsubscribe;
      }
    }

    checkAndPollApi();

    return () => {
      isSubscribed = false;
      if (timer) clearTimeout(timer);
    };
  }, [scenario]);

  const showToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setScenario = (newScenario: ScenarioType) => {
    setScenarioState(newScenario);
    mockAdapter.applyScenario(newScenario);
    showToast(`Scenario switched to: ${newScenario.replace('_', ' ')}`, 'info');
  };

  const toggleDiskSpin = (diskId: string) => {
    const disk = mockAdapter.toggleDiskSpin(diskId);
    if (disk) {
      showToast(
        `${disk.name} is now ${disk.spinState === 'active' ? 'spinning up' : 'spun down to standby'}`,
        'info'
      );
    }
  };

  const startApp = async (appId: string) => {
    if (isLive) {
      try {
        await fetch(`/api/docker/${appId}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'start' }),
        });
        showToast(`Started container`, 'success');
      } catch (err) {
        showToast(`Failed to start container`, 'error');
      }
    }
    const app = mockAdapter.setAppState(appId, 'running');
    if (app) {
      showToast(`Started container "${app.name}"`, 'success');
    }
  };

  const stopApp = async (appId: string) => {
    if (isLive) {
      try {
        await fetch(`/api/docker/${appId}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'stop' }),
        });
        showToast(`Stopped container`, 'info');
      } catch (err) {
        showToast(`Failed to stop container`, 'error');
      }
    }
    const app = mockAdapter.setAppState(appId, 'stopped');
    if (app) {
      showToast(`Stopped container "${app.name}"`, 'info');
    }
  };

  const restartApp = async (appId: string) => {
    if (isLive) {
      try {
        await fetch(`/api/docker/${appId}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'restart' }),
        });
        showToast(`Restarting container...`, 'info');
      } catch (err) {
        showToast(`Failed to restart container`, 'error');
      }
    }
    mockAdapter.setAppState(appId, 'restarting');
    showToast(`Restarting container...`, 'info');
  };

  const triggerParityCheck = () => {
    mockAdapter.triggerParityCheck();
    setScenarioState('operation_progress');
    showToast('Parity check started across array', 'info');
  };

  const pauseParityCheck = () => {
    mockAdapter.pauseParityCheck();
    showToast('Parity check paused/resumed', 'info');
  };

  const cancelParityCheck = () => {
    mockAdapter.cancelParityCheck();
    showToast('Parity check cancelled', 'warning');
  };

  const triggerMover = () => {
    showToast('Mover job started...', 'info');
    mockAdapter.triggerMover().then((msg) => {
      showToast(msg, 'success');
    });
  };

  const resetDemo = () => {
    mockAdapter.resetAll();
    setScenarioState('healthy');
    setActiveDrawer(null);
    showToast('Demo environment reset to baseline', 'success');
  };

  return (
    <ServerContext.Provider
      value={{
        state,
        isLive,
        scenario,
        setScenario,
        activeDrawer,
        openDrawer: setActiveDrawer,
        closeDrawer: () => setActiveDrawer(null),
        toggleDiskSpin,
        startApp,
        stopApp,
        restartApp,
        triggerParityCheck,
        pauseParityCheck,
        cancelParityCheck,
        triggerMover,
        resetDemo,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </ServerContext.Provider>
  );
};

export const useServer = () => {
  const context = useContext(ServerContext);
  if (!context) {
    throw new Error('useServer must be used within a ServerProvider');
  }
  return context;
};

