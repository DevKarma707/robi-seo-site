"use client";

/**
 * Sélecteur de thème, repris des 6 thèmes de l'app (src/lib/themes.ts, copie
 * conforme de utils/themes.ts côté app). Aucune couleur n'est définie ici :
 * tout vient du thème choisi, posé en variables CSS par adminTheme.ts.
 * Le fond clair ou sombre, lui, relève de ModeToggle.
 */
import React, { useEffect, useState, useSyncExternalStore } from "react";
import { Palette, Check } from "lucide-react";
import { THEMES, type ThemeName } from "@/lib/themes";
import { applyTheme, selectTheme, getStoredTheme, getServerTheme, subscribeTheme } from "@/lib/adminTheme";
import { focusRing } from "./ui";

const ThemePicker: React.FC = () => {
  const [open, setOpen] = useState(false);
  // localStorage est hors de React : useSyncExternalStore le lit sans écart
  // d'hydratation et sans setState dans un effet.
  const theme = useSyncExternalStore(subscribeTheme, getStoredTheme, getServerTheme);

  // Poser les variables CSS est un effet de bord légitime, et n'écrit
  // aucun state.
  useEffect(() => { applyTheme(theme); }, [theme]);

  const pick = (name: ThemeName) => {
    selectTheme(name);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors text-slate-500 hover:text-slate-900 hover:bg-slate-900/[0.04] ${focusRing}`}
      >
        <Palette size={16} strokeWidth={1.75} />
        <span className="flex-1 text-left">Couleurs</span>
        {theme && (
          <span
            className="w-3.5 h-3.5 rounded-full ring-1 ring-slate-900/10 flex-shrink-0"
            style={{ backgroundColor: THEMES[theme].colors.accent }}
          />
        )}
      </button>

      {open && (
        <div className="a-card a-pop absolute bottom-full left-0 right-0 mb-2 p-1 z-50 overflow-hidden">
          {(Object.keys(THEMES) as ThemeName[]).map((name) => {
            const t = THEMES[name];
            return (
              <button
                key={name}
                onClick={() => pick(name)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left transition-colors hover:bg-slate-900/[0.05] ${focusRing}`}
              >
                <span className="flex gap-0.5 flex-shrink-0">
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: t.colors.primary }} />
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: t.colors.accent }} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[12px] font-semibold text-slate-900 truncate">{t.label}</span>
                  <span className="block text-[10.5px] text-slate-500 truncate">{t.description}</span>
                </span>
                {theme === name && <Check size={13} className="text-[var(--admin-ink)] flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThemePicker;
