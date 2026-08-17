"use client";

import { useState } from "react";
import { GOAL_PERIODS, type Goal, type GoalPeriod } from "@/lib/types";
import { useGoals } from "@/lib/useGoals";
import { GoalItem } from "./GoalItem";

interface GoalSectionProps {
  period: GoalPeriod;
  goals: Goal[];
  addGoal: (period: GoalPeriod, title: string) => void;
  toggleGoal: (id: string) => void;
  deleteGoal: (id: string) => void;
  linkGoal: (id: string, linkedGoalId: string | null) => void;
  goalsById: Map<string, Goal>;
}

function GoalSection({
  period,
  goals,
  addGoal,
  toggleGoal,
  deleteGoal,
  linkGoal,
  goalsById,
}: GoalSectionProps) {
  const [draft, setDraft] = useState("");
  const meta = GOAL_PERIODS.find((p) => p.id === period)!;
  const periodGoals = goals.filter((g) => g.period === period);
  // Only weekly goals can be linked to a monthly goal — monthly is the "larger" unit.
  const isDropSection = period === "weekly";
  const isDragSection = period === "monthly";

  function submit() {
    addGoal(period, draft);
    setDraft("");
  }

  return (
    <div className="border-b border-black/[.06] pb-3 last:border-b-0">
      <h3 className="font-display px-3 pb-1.5 pt-3 text-[13px] font-bold uppercase tracking-wide text-black/50">
        {meta.title}
      </h3>
      {isDragSection && periodGoals.length > 0 && (
        <p className="font-ui px-3 pb-1.5 text-[11px] italic text-black/35">
          Drag a goal onto a weekly goal to link them
        </p>
      )}

      <label className="flex items-center gap-2 border-b border-black/[.06] px-3 py-2 text-sm text-black/45">
        <span
          className="flex size-4 shrink-0 items-center justify-center rounded-md border-[1.5px] border-dashed text-[10px] leading-none"
          style={{ borderColor: "#8a6d1f", color: "#8a6d1f" }}
          aria-hidden
        >
          +
        </span>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder={meta.placeholder}
          className="font-ui w-full bg-transparent text-xs placeholder:text-black/40 focus:outline-none"
        />
      </label>

      {periodGoals.length === 0 ? (
        <p className="font-ui px-3 py-4 text-center text-xs italic text-black/40">
          {meta.emptyLabel}
        </p>
      ) : (
        <ul>
          {periodGoals.map((goal) => (
            <GoalItem
              key={goal.id}
              goal={goal}
              onToggle={toggleGoal}
              onDelete={deleteGoal}
              draggable={isDragSection}
              isDropTarget={isDropSection}
              onDropGoal={
                isDropSection ? (draggedMonthlyId) => linkGoal(goal.id, draggedMonthlyId) : undefined
              }
              linkedGoal={goal.linkedGoalId ? goalsById.get(goal.linkedGoalId) : undefined}
              onUnlink={isDropSection ? () => linkGoal(goal.id, null) : undefined}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export function GoalsPanel() {
  const { goals, addGoal, toggleGoal, deleteGoal, linkGoal } = useGoals();
  const goalsById = new Map(goals.map((g) => [g.id, g]));

  return (
    <aside className="flex flex-col overflow-hidden rounded-lg border border-black/[.06] bg-white shadow-sm">
      {GOAL_PERIODS.map((meta) => (
        <GoalSection
          key={meta.id}
          period={meta.id}
          goals={goals}
          addGoal={addGoal}
          toggleGoal={toggleGoal}
          deleteGoal={deleteGoal}
          linkGoal={linkGoal}
          goalsById={goalsById}
        />
      ))}
    </aside>
  );
}
