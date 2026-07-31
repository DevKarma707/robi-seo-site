"use client";

/**
 * Sélecteur de thème, repris des 6 thèmes de l'app (src/lib/themes.ts, copie
 * conforme de utils/themes.ts côté app). Aucune couleur n'est définie ici :
 * tout vient du thème choisi, posé en variables CSS par adminTheme.ts.
 */
import React, { useEffect, useState, useSyncExternalStore } from "react";
import { Palette, Check } from "lucide-react";
import { THEMES, type ThemeName } from "@/lib/themes";
import { applyTheme, selectTheme, getStoredTheme, getServerTheme, subscribeTheme } from "@/lib/adminTheme";
import { focusRingDark } from "./ui";

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
        className={`a-display w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-semibold transition-all text-white/50 hover:text-white hover:bg-white/[0.06] ${focusRingDark}`}
      >
        <Palette size={17} />
        <span className="flex-1 text-left font-semibold tracking-[-0.01em]">Thème</span>
        {theme && (
          <span
            className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0"
            style={{ backgroundColor: THEMES[theme].colors.accent }}
          />
        )}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-white/10 bg-[#141033] shadow-2xl overflow-hidden z-50">
          {(Object.keys(THEMES) as ThemeName[]).map((name) => {
            const t = THEMES[name];
            return (
              <button
                key={name}
                onClick={() => pick(name)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.07] ${focusRingDark}`}
              >
                <span className="flex gap-0.5 flex-shrink-0">
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: t.colors.primary }} />
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: t.colors.accent }} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[12px] font-bold text-white truncate">{t.label}</span>
                  <span className="block text-[10px] text-white/35 truncate">{t.description}</span>
                </span>
                {theme === name && <Check size={13} className="text-white/60 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThemePicker;
