import { QUADRANTS } from "@/lib/types";
import { AuthButton } from "./AuthButton";

const NAV_ITEMS = [
  { label: "Goals", active: false, locked: true },
  { label: "Matrix", active: true, locked: false },
  { label: "Board", active: false, locked: true },
  { label: "Calendar", active: false, locked: true },
];

const TOOLBAR_ITEMS = ["Search", "Filter", "Settings"];

function LockIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="10"
      height="10"
      fill="none"
      className="ml-1 opacity-50"
    >
      <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function Header() {
  return (
    <div style={{ backgroundColor: "#f1ede3" }} className="border-b border-black/[.08]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <h1 className="font-display text-lg font-bold tracking-tight text-black">
          EISENHOWER
        </h1>

        <nav className="flex items-center gap-1 rounded-full bg-black/[.04] p-1 text-sm">
          {NAV_ITEMS.map((item) => (
            <span
              key={item.label}
              title={item.locked ? `${item.label} — not part of this build` : undefined}
              className={
                "font-ui flex items-center rounded-full px-3.5 py-1.5 font-medium transition-colors " +
                (item.active
                  ? "bg-white text-black/85 shadow-sm"
                  : "cursor-not-allowed text-black/45")
              }
            >
              {item.label}
              {item.locked && <LockIcon />}
            </span>
          ))}
        </nav>

        <div className="font-ui flex items-center gap-2 text-sm">
          {TOOLBAR_ITEMS.map((label) => (
            <span
              key={label}
              title={`${label} — not part of this build`}
              className="flex cursor-not-allowed items-center rounded-md border border-black/10 px-3 py-1.5 font-medium text-black/45"
            >
              {label}
              <LockIcon />
            </span>
          ))}
          <AuthButton />
        </div>
      </div>
      <div
        className="h-[2px] w-full"
        style={{
          background: `linear-gradient(to right, ${QUADRANTS[0].accent} 0 25%, ${QUADRANTS[1].accent} 25% 50%, ${QUADRANTS[2].accent} 50% 75%, ${QUADRANTS[3].accent} 75% 100%)`,
        }}
      />
    </div>
  );
}
