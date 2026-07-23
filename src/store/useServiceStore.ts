import { create } from 'zustand';
import type { Service, SystemResources, LogEntry } from '@/types';
import { api } from '@/utils/api';

interface ServiceStore {
  services: Service[];
  systemResources: SystemResources | null;
  logs: LogEntry[];
  loading: boolean;
  error: string | null;

  fetchServices: () => Promise<void>;
  fetchSystemResources: () => Promise<void>;
  restartService: (id: string) => Promise<void>;
  stopService: (id: string) => Promise<void>;
  startService: (id: string) => Promise<void>;
  fetchLogs: (id: string) => Promise<void>;
}

export const useServiceStore = create<ServiceStore>((set) => ({
  services: [],
  systemResources: null,
  logs: [],
  loading: false,
  error: null,

  fetchServices: async () => {
    try {
      set({ loading: true });
      const data = await api.getServices();
      set({ services: data, loading: false, error: null });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchSystemResources: async () => {
    try {
      const data = await api.getSystemResources();
      set({ systemResources: data });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  restartService: async (id: string) => {
    try {
      set((state) => ({
        services: state.services.map((s) =>
          s.id === id ? { ...s, status: 'loading' } : s
        ),
      }));
      await api.restartService(id);
      setTimeout(() => {
        set((state) => ({
          services: state.services.map((s) =>
            s.id === id ? { ...s, status: 'running', uptime: 0 } : s
          ),
        }));
      }, 2000);
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  stopService: async (id: string) => {
    try {
      await api.stopService(id);
      set((state) => ({
        services: state.services.map((s) =>
          s.id === id
            ? { ...s, status: 'stopped', cpuUsage: 0, memoryUsage: 0, uptime: 0 }
            : s
        ),
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  startService: async (id: string) => {
    try {
      set((state) => ({
        services: state.services.map((s) =>
          s.id === id ? { ...s, status: 'loading' } : s
        ),
      }));
      await api.startService(id);
      setTimeout(() => {
        set((state) => ({
          services: state.services.map((s) =>
            s.id === id
              ? {
                  ...s,
                  status: 'running',
                  cpuUsage: Math.random() * 30 + 5,
                  memoryUsage: Math.random() * 2000 + 500,
                }
              : s
          ),
        }));
      }, 1500);
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchLogs: async (id: string) => {
    try {
      const data = await api.getServiceLogs(id);
      set({ logs: data.logs });
    } catch (err: any) {
      set({ error: err.message });
    }
  },
}));
