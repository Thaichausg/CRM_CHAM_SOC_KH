'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface DataState {
  customers: any[];
  groups: any[];
  tasks: any[];
  pipeline: any[];
  scripts: any[];
  profiles: any[];
  stats: any;
  loading: boolean;
  error: string | null;
}

interface DataContextType extends DataState {
  refresh: () => Promise<void>;
  updateTask: (id: number, updates: any) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  addTask: (task: any) => Promise<void>;
  updatePipeline: (id: number, updates: any) => Promise<void>;
  deletePipeline: (id: number) => Promise<void>;
  addPipeline: (item: any) => Promise<void>;
  updateScript: (id: number, updates: any) => Promise<void>;
  importData: (data: any) => Promise<boolean>;
  addProfile: (profile: any) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DataState>({
    customers: [], groups: [], tasks: [], pipeline: [], scripts: [], profiles: [],
    stats: null, loading: true, error: null,
  });

  const refresh = useCallback(async () => {
    try {
      setState(s => ({ ...s, loading: true, error: null }));
      const [customers, groups, tasks, pipeline, scripts, stats, profiles] = await Promise.all([
        fetch('/api/customers').then(r => r.json()),
        fetch('/api/groups').then(r => r.json()),
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/pipeline').then(r => r.json()),
        fetch('/api/scripts').then(r => r.json()),
        fetch('/api/stats').then(r => r.json()),
        fetch('/api/profiles').then(r => r.json()),
      ]);
      setState({ customers, groups, tasks, pipeline, scripts, profiles, stats, loading: false, error: null });
    } catch (e: any) {
      setState(s => ({ ...s, loading: false, error: e.message }));
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const updateTask = async (id: number, updates: any) => {
    await fetch('/api/tasks', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...updates }) });
    refresh();
  };

  const deleteTask = async (id: number) => {
    await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' });
    refresh();
  };

  const addTask = async (task: any) => {
    await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(task) });
    refresh();
  };

  const updatePipeline = async (id: number, updates: any) => {
    await fetch('/api/pipeline', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...updates }) });
    refresh();
  };

  const deletePipeline = async (id: number) => {
    await fetch(`/api/pipeline?id=${id}`, { method: 'DELETE' });
    refresh();
  };

  const addPipeline = async (item: any) => {
    await fetch('/api/pipeline', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) });
    refresh();
  };

  const updateScript = async (id: number, updates: any) => {
    await fetch('/api/scripts', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...updates }) });
    refresh();
  };

  const importData = async (data: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await refresh();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const addProfile = async (profile: any) => {
    await fetch('/api/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) });
    refresh();
  };

  return (
    <DataContext.Provider value={{ ...state, refresh, updateTask, deleteTask, addTask, updatePipeline, deletePipeline, addPipeline, updateScript, importData, addProfile }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be inside DataProvider');
  return ctx;
}
