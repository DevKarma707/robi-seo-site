"use client";

/**
 * Toasts de l'admin.
 *
 * Chaque onglet recopiait son propre bandeau `flash` en bas à droite, avec
 * son timer et ses couleurs en dur : deux messages rapprochés s'écrasaient,
 * et un envoi d'emails réussi se confirmait par un aplat lime muet.
 *
 * Un seul store ici, hors de React : n'importe quel onglet appelle
 * `toast("ok", "…")` sans prop ni contexte, et `<Toaster />` (monté une
 * fois dans la coquille) les empile.
 */
import React, { useSyncExternalStore } from "react";
import { AlertTriangle, X } from "lucide-react";

export type ToastKind = "ok" | "err";

interface ToastItem {
  id: number;
  kind: ToastKind;
  text: string;
  ms: number;
  leaving: boolean;
}

let items: ToastItem[] = [];
let seq = 0;
const EMPTY: ToastItem[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((cb) => cb());

export function dismissToast(id: number) {
  if (!items.some((t) => t.id === id && !t.leaving)) return;
  items = items.map((t) => (t.id === id ? { ...t, leaving: true } : t));
  emit();
  // Laisse l'animation de sortie se jouer avant de retirer l'élément.
  window.setTimeout(() => {
    items = items.filter((t) => t.id !== id);
    emit();
  }, 200);
}

/**
 * Une erreur reste plus longtemps qu'une confirmation : c'est elle qu'on a
 * besoin de relire. Au-delà de quatre toasts, les plus anciens cèdent.
 */
export function toast(kind: ToastKind, text: string, ms = kind === "err" ? 12000 : 6000) {
  const id = ++seq;
  items = [...items.slice(-3), { id, kind, text, ms, leaving: false }];
  emit();
  window.setTimeout(() => dismissToast(id), ms);
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
};

export function Toaster() {
  const list = useSyncExternalStore(subscribe, () => items, () => EMPTY);

  return (
    <div className="a-toasts" aria-live="polite">
      {list.map((t) => (
        <div
          key={t.id}
          role={t.kind === "err" ? "alert" : "status"}
          data-kind={t.kind}
          className={`a-toast ${t.leaving ? "is-leaving" : ""}`}
          style={{ "--a-toast-ms": `${t.ms}ms` } as React.CSSProperties}
        >
          <span className="a-toast-icon" aria-hidden>
            {t.kind === "ok" ? (
              <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3.5 8.5l3 3L12.5 5" pathLength={1} />
              </svg>
            ) : (
              <AlertTriangle size={13} strokeWidth={2.4} />
            )}
          </span>
          <p>{t.text}</p>
          <button type="button" onClick={() => dismissToast(t.id)} aria-label="Fermer">
            <X size={14} />
          </button>
          <i className="a-toast-timer" aria-hidden />
        </div>
      ))}
    </div>
  );
}
