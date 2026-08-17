"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type OpenAI from "openai";
import { useTasks } from "./useTasks";
import { useGoals } from "./useGoals";
import type { TaskLocation, GoalPeriod } from "./types";

type InputItem = OpenAI.Responses.ResponseInputItem;
type OutputItem = OpenAI.Responses.ResponseOutputItem;

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const QUADRANT_IDS: TaskLocation[] = ["do-first", "schedule", "delegate", "dont-do", "inbox"];
const GOAL_PERIOD_IDS: GoalPeriod[] = ["weekly", "monthly"];

function extractText(item: OutputItem): string | null {
  if (item.type !== "message") return null;
  const parts = item.content
    .filter((c): c is Extract<typeof c, { type: "output_text" }> => c.type === "output_text")
    .map((c) => c.text);
  return parts.length ? parts.join("") : null;
}

export function useChat() {
  const { tasks, addTask, moveTask, toggleTask, deleteTask, updateTask } = useTasks();
  const { goals, addGoal, toggleGoal, deleteGoal } = useGoals();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Full Responses-API item history, kept outside React state so the loop
  // below always sees the latest value without waiting on a re-render.
  const historyRef = useRef<InputItem[]>([]);
  // Mirror of task/goal state for the tool executor, refreshed each send.
  const stateRef = useRef({
    tasks,
    addTask,
    moveTask,
    toggleTask,
    deleteTask,
    updateTask,
    goals,
    addGoal,
    toggleGoal,
    deleteGoal,
  });
  useEffect(() => {
    stateRef.current = {
      tasks,
      addTask,
      moveTask,
      toggleTask,
      deleteTask,
      updateTask,
      goals,
      addGoal,
      toggleGoal,
      deleteGoal,
    };
  });

  const runTool = useCallback((name: string, rawArgs: string): unknown => {
    const s = stateRef.current;
    let args: Record<string, unknown>;
    try {
      args = JSON.parse(rawArgs);
    } catch {
      return { error: "Could not parse arguments" };
    }

    switch (name) {
      case "add_task": {
        const quadrant = args.quadrant as TaskLocation;
        const title = String(args.title ?? "");
        if (!QUADRANT_IDS.includes(quadrant)) return { error: "Unknown quadrant" };
        if (!title.trim()) return { error: "Title is required" };
        const id = s.addTask(quadrant, title);
        return { ok: true, id };
      }
      case "move_task": {
        const id = String(args.id ?? "");
        const quadrant = args.quadrant as TaskLocation;
        if (!s.tasks.some((t) => t.id === id)) return { error: "No task with that id" };
        if (!QUADRANT_IDS.includes(quadrant)) return { error: "Unknown quadrant" };
        s.moveTask(id, quadrant);
        return { ok: true };
      }
      case "toggle_task": {
        const id = String(args.id ?? "");
        if (!s.tasks.some((t) => t.id === id)) return { error: "No task with that id" };
        s.toggleTask(id);
        return { ok: true };
      }
      case "delete_task": {
        const id = String(args.id ?? "");
        if (!s.tasks.some((t) => t.id === id)) return { error: "No task with that id" };
        s.deleteTask(id);
        return { ok: true };
      }
      case "update_task": {
        const id = String(args.id ?? "");
        if (!s.tasks.some((t) => t.id === id)) return { error: "No task with that id" };
        const dueDate = args.dueDate === null || args.dueDate === undefined ? null : String(args.dueDate);
        // Firestore's setDoc rejects `undefined` field values — use "" (falsy,
        // same as "no details" everywhere else) instead of undefined to clear.
        const details = args.details === null || args.details === undefined ? "" : String(args.details);
        s.updateTask(id, { dueDate, details });
        return { ok: true };
      }
      case "add_goal": {
        const period = args.period as GoalPeriod;
        const title = String(args.title ?? "");
        if (!GOAL_PERIOD_IDS.includes(period)) return { error: "Unknown period" };
        if (!title.trim()) return { error: "Title is required" };
        s.addGoal(period, title);
        return { ok: true };
      }
      case "toggle_goal": {
        const id = String(args.id ?? "");
        if (!s.goals.some((g) => g.id === id)) return { error: "No goal with that id" };
        s.toggleGoal(id);
        return { ok: true };
      }
      case "delete_goal": {
        const id = String(args.id ?? "");
        if (!s.goals.some((g) => g.id === id)) return { error: "No goal with that id" };
        s.deleteGoal(id);
        return { ok: true };
      }
      default:
        return { error: `Unknown tool: ${name}` };
    }
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending) return;

      setError(null);
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text: trimmed }]);
      historyRef.current.push({ role: "user", content: trimmed });
      setSending(true);

      try {
        // Loop: send -> execute any tool calls -> send results back -> repeat
        // until the model responds with no further tool calls.
        for (let iteration = 0; iteration < 8; iteration++) {
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              input: historyRef.current,
              state: { tasks: stateRef.current.tasks, goals: stateRef.current.goals },
            }),
          });

          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || `Request failed (${res.status})`);
          }

          const { output } = (await res.json()) as { output: OutputItem[] };
          historyRef.current.push(...(output as unknown as InputItem[]));

          const functionCalls = output.filter(
            (item): item is Extract<OutputItem, { type: "function_call" }> => item.type === "function_call"
          );

          for (const item of output) {
            const text = extractText(item);
            if (text) {
              setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", text }]);
            }
          }

          if (functionCalls.length === 0) break;

          for (const call of functionCalls) {
            const result = runTool(call.name, call.arguments);
            historyRef.current.push({
              type: "function_call_output",
              call_id: call.call_id,
              output: JSON.stringify(result),
            });
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setSending(false);
      }
    },
    [sending, runTool]
  );

  return { messages, sendMessage, sending, error };
}
