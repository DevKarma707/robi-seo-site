"use client";

import React, { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { getMode, getServerMode, setMode, subscribeMode, type AdminMode } from "@/lib/adminMode";
import { focusRing } from "./ui";

const OPTIONS: { mode: AdminMode; label: string; icon: React.ReactNode }[] = [
  { mode: "light", label: "Clair", icon: <Sun size={13} strokeWidth={2} /> },
  { mode: "dark", label: "Sombre", icon: <Moon size={13} strokeWidth={2} /> },
];

/** Bascule clair / sombre, en pied de sidebar. */
const ModeToggle: React.FC = () => {
  const mode = useSyncExternalStore(subscribeMode, getMode, getServerMode);

  return (
    <div role="group" aria-label="Apparence" className="grid grid-cols-2 gap-1 p-1 mb-1 rounded-lg bg-slate-900/[0.05]">
      {OPTIONS.map((o) => {
        const on = mode === o.mode;
        return (
          <button
            key={o.mode}
            type="button"
            onClick={() => setMode(o.mode)}
            aria-pressed={on}
            className={`flex items-center justify-center gap-1.5 h-7 rounded-md text-[12px] font-semibold transition-colors ${focusRing} ${
              on ? "bg-[var(--a-surface)] text-slate-900 ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
};

export default ModeToggle;
