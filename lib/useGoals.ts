"use client";

import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useAuth } from "./AuthContext";
import { db } from "./firebase";
import type { Goal, GoalPeriod } from "./types";

const STORAGE_KEY = "eisenhower-grid.goals.v1";
const EMPTY_GOALS: Goal[] = [];

// ---- local (signed-out) store, backed by localStorage ----

let localCache: Goal[] = EMPTY_GOALS;
let localCacheLoaded = false;
const localListeners = new Set<() => void>();

function readLocalStorage(): Goal[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalStorage(goals: Goal[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

function getLocalSnapshot(): Goal[] {
  if (!localCacheLoaded) {
    localCache = readLocalStorage();
    localCacheLoaded = true;
  }
  return localCache;
}

function getServerSnapshot(): Goal[] {
  return EMPTY_GOALS;
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

function mutateLocal(updater: (prev: Goal[]) => Goal[]) {
  localCache = updater(getLocalSnapshot());
  localCacheLoaded = true;
  writeLocalStorage(localCache);
  localListeners.forEach((listener) => listener());
}

// ---- combined hook: Firestore when signed in, localStorage otherwise ----

export function useGoals() {
  const { user, loading: authLoading } = useAuth();
  const localGoals = useSyncExternalStore(subscribeLocal, getLocalSnapshot, getServerSnapshot);

  const [cloudGoals, setCloudGoals] = useState<Goal[] | null>(null);

  useEffect(() => {
    if (!user || !db) return;
    const ref = doc(db, "users", user.uid);

    getDoc(ref).then((snap) => {
      const data = snap.data();
      if (!snap.exists() || !Array.isArray(data?.goals)) {
        // First sign-in on this device (or a doc predating goals): seed from local.
        setDoc(ref, { goals: getLocalSnapshot() }, { merge: true });
      }
    });

    const unsubscribe = onSnapshot(ref, (snap) => {
      const data = snap.data();
      setCloudGoals(Array.isArray(data?.goals) ? (data.goals as Goal[]) : []);
    });

    return () => {
      unsubscribe();
      setCloudGoals(null);
    };
  }, [user]);

  const usingCloud = Boolean(user);
  const goals = usingCloud ? (cloudGoals ?? []) : localGoals;
  const hydrated = !authLoading && (usingCloud ? cloudGoals !== null : localGoals !== EMPTY_GOALS);

  const writeGoals = useCallback(
    (updater: (prev: Goal[]) => Goal[]) => {
      if (usingCloud && user && db) {
        setDoc(doc(db, "users", user.uid), { goals: updater(cloudGoals ?? []) }, { merge: true });
      } else {
        mutateLocal(updater);
      }
    },
    [usingCloud, user, cloudGoals]
  );

  const addGoal = useCallback(
    (period: GoalPeriod, title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      writeGoals((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          title: trimmed,
          period,
          completed: false,
          createdAt: Date.now(),
        },
      ]);
    },
    [writeGoals]
  );

  const toggleGoal = useCallback(
    (id: string) => {
      writeGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
      );
    },
    [writeGoals]
  );

  const deleteGoal = useCallback(
    (id: string) => {
      writeGoals((prev) => prev.filter((g) => g.id !== id));
    },
    [writeGoals]
  );

  const linkGoal = useCallback(
    (id: string, linkedGoalId: string | null) => {
      writeGoals((prev) => prev.map((g) => (g.id === id ? { ...g, linkedGoalId } : g)));
    },
    [writeGoals]
  );

  return { goals, hydrated, addGoal, toggleGoal, deleteGoal, linkGoal };
}
