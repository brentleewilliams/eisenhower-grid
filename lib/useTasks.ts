"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { QuadrantId, Task } from "./types";

const STORAGE_KEY = "eisenhower-grid.tasks.v1";
const EMPTY_TASKS: Task[] = [];

let cache: Task[] = EMPTY_TASKS;
let cacheLoaded = false;
const listeners = new Set<() => void>();

function readFromStorage(): Task[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeToStorage(tasks: Task[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function getSnapshot(): Task[] {
  if (!cacheLoaded) {
    cache = readFromStorage();
    cacheLoaded = true;
  }
  return cache;
}

function getServerSnapshot(): Task[] {
  return EMPTY_TASKS;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cacheLoaded = false;
      callback();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function mutate(updater: (prev: Task[]) => Task[]) {
  cache = updater(getSnapshot());
  cacheLoaded = true;
  writeToStorage(cache);
  listeners.forEach((listener) => listener());
}

export function useTasks() {
  const tasks = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = tasks !== EMPTY_TASKS;

  const addTask = useCallback((quadrant: QuadrantId, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    mutate((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: trimmed,
        quadrant,
        completed: false,
        createdAt: Date.now(),
      },
    ]);
  }, []);

  const moveTask = useCallback((id: string, quadrant: QuadrantId) => {
    mutate((prev) => prev.map((t) => (t.id === id ? { ...t, quadrant } : t)));
  }, []);

  const toggleTask = useCallback((id: string) => {
    mutate((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    mutate((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { tasks, hydrated, addTask, moveTask, toggleTask, deleteTask };
}
