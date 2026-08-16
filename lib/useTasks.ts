"use client";

import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useAuth } from "./AuthContext";
import { db } from "./firebase";
import type { QuadrantId, Task } from "./types";

const STORAGE_KEY = "eisenhower-grid.tasks.v1";
const EMPTY_TASKS: Task[] = [];

// ---- local (signed-out) store, backed by localStorage ----

let localCache: Task[] = EMPTY_TASKS;
let localCacheLoaded = false;
const localListeners = new Set<() => void>();

function readLocalStorage(): Task[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalStorage(tasks: Task[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function getLocalSnapshot(): Task[] {
  if (!localCacheLoaded) {
    localCache = readLocalStorage();
    localCacheLoaded = true;
  }
  return localCache;
}

function getServerSnapshot(): Task[] {
  return EMPTY_TASKS;
}

function subscribeLocal(callback: () => void) {
  localListeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      localCacheLoaded = false;
      callback();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    localListeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function mutateLocal(updater: (prev: Task[]) => Task[]) {
  localCache = updater(getLocalSnapshot());
  localCacheLoaded = true;
  writeLocalStorage(localCache);
  localListeners.forEach((listener) => listener());
}

// ---- combined hook: Firestore when signed in, localStorage otherwise ----

export function useTasks() {
  const { user, loading: authLoading } = useAuth();
  const localTasks = useSyncExternalStore(subscribeLocal, getLocalSnapshot, getServerSnapshot);

  const [cloudTasks, setCloudTasks] = useState<Task[] | null>(null);

  useEffect(() => {
    if (!user || !db) return;
    const ref = doc(db, "users", user.uid);

    getDoc(ref).then((snap) => {
      if (!snap.exists()) {
        // First sign-in on this device: seed the cloud doc from whatever is local.
        setDoc(ref, { tasks: getLocalSnapshot() });
      }
    });

    const unsubscribe = onSnapshot(ref, (snap) => {
      const data = snap.data();
      setCloudTasks(Array.isArray(data?.tasks) ? (data.tasks as Task[]) : []);
    });

    return () => {
      unsubscribe();
      setCloudTasks(null);
    };
  }, [user]);

  const usingCloud = Boolean(user);
  const tasks = usingCloud ? (cloudTasks ?? []) : localTasks;
  const hydrated = !authLoading && (usingCloud ? cloudTasks !== null : localTasks !== EMPTY_TASKS);

  const writeTasks = useCallback(
    (updater: (prev: Task[]) => Task[]) => {
      if (usingCloud && user && db) {
        setDoc(doc(db, "users", user.uid), { tasks: updater(cloudTasks ?? []) }, { merge: true });
      } else {
        mutateLocal(updater);
      }
    },
    [usingCloud, user, cloudTasks]
  );

  const addTask = useCallback(
    (quadrant: QuadrantId, title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      writeTasks((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          title: trimmed,
          quadrant,
          completed: false,
          createdAt: Date.now(),
        },
      ]);
    },
    [writeTasks]
  );

  const moveTask = useCallback(
    (id: string, quadrant: QuadrantId) => {
      writeTasks((prev) => prev.map((t) => (t.id === id ? { ...t, quadrant } : t)));
    },
    [writeTasks]
  );

  const toggleTask = useCallback(
    (id: string) => {
      writeTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      );
    },
    [writeTasks]
  );

  const deleteTask = useCallback(
    (id: string) => {
      writeTasks((prev) => prev.filter((t) => t.id !== id));
    },
    [writeTasks]
  );

  return { tasks, hydrated, syncing: usingCloud, addTask, moveTask, toggleTask, deleteTask };
}
