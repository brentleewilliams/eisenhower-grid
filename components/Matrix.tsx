"use client";

import { useRef } from "react";
import { QUADRANTS, type Task } from "@/lib/types";
import { useGoals } from "@/lib/useGoals";
import { useTasks } from "@/lib/useTasks";
import { GoalsPanel } from "./GoalsPanel";
import { InboxPanel } from "./InboxPanel";
import { QuadrantColumn } from "./QuadrantColumn";

export function Matrix() {
  const { tasks, hydrated, addTask, moveTask, toggleTask, deleteTask, updateTask } =
    useTasks();
  const { goals } = useGoals();
  const draggedId = useRef<string | null>(null);

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-black/40">
        Loading your matrix…
      </div>
    );
  }

  const goalsById = new Map(goals.map((g) => [g.id, g]));
  const linkedTasksByGoalId = new Map<string, Task[]>();
  for (const task of tasks) {
    if (!task.linkedGoalId) continue;
    const list = linkedTasksByGoalId.get(task.linkedGoalId) ?? [];
    list.push(task);
    linkedTasksByGoalId.set(task.linkedGoalId, list);
  }

  return (
    <div className="flex flex-1 flex-col gap-3 p-4 sm:flex-row sm:gap-[18px] sm:p-6">
      <div className="flex w-full shrink-0 flex-col gap-3 sm:w-64">
        <GoalsPanel
          onLinkTask={(taskId, goalId) => updateTask(taskId, { linkedGoalId: goalId })}
          linkedTasksByGoalId={linkedTasksByGoalId}
        />
        <InboxPanel
          tasks={tasks.filter((t) => t.quadrant === "inbox")}
          onAdd={(title) => addTask("inbox", title)}
          onToggle={toggleTask}
          onDelete={deleteTask}
          onUpdate={updateTask}
          goalsById={goalsById}
          onDragStart={(id) => {
            draggedId.current = id;
          }}
          onDrop={() => {
            if (draggedId.current) {
              moveTask(draggedId.current, "inbox");
              draggedId.current = null;
            }
          }}
        />
      </div>
      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-[18px]">
        {QUADRANTS.map((meta) => (
          <QuadrantColumn
            key={meta.id}
            meta={meta}
            tasks={tasks.filter((t) => t.quadrant === meta.id)}
            onAdd={(title) => addTask(meta.id, title)}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onUpdate={updateTask}
            goalsById={goalsById}
            onDragStart={(id) => {
              draggedId.current = id;
            }}
            onDrop={() => {
              if (draggedId.current) {
                moveTask(draggedId.current, meta.id);
                draggedId.current = null;
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
