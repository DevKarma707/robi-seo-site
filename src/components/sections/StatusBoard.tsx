"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, HelpCircle, RefreshCw, XCircle } from "lucide-react";
import type { ComponentState, PublicComponent, PublicStatus } from "@/lib/publicStatus";

export interface StatusDict {
  states: Record<ComponentState, { label: string; headline: string; blurb: string }>;
  components: Record<PublicComponent["key"], { label: string; description: string }>;
  historyTitle: string;
  historyOk: string;
  historyIncident: string;
  updatedAt: string;
  refresh: string;
  note: string;
}

const TONE: Record<ComponentState, { text: string; bg: string; border: string; dot: string }> = {
  operational: { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500" },
  degraded: { text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500" },
  down: { text: "text-red-700", bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500" },
  unknown: { text: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200", dot: "bg-gray-400" },
};

function StateIcon({ state, className }: { state: ComponentState; className?: string }) {
  const size = 20;
  if (state === "operational") return <CheckCircle2 size={size} className={className} />;
  if (state === "degraded") return <AlertTriangle size={size} className={className} />;
  if (state === "down") return <XCircle size={size} className={className} />;
  return <HelpCircle size={size} className={className} />;
}

/** Locale-aware, but rendered only after mount so server and client HTML
 *  can't disagree on the visitor's timezone. */
function useFormattedDate(iso: string, locale: string) {
  const [formatted, setFormatted] = useState("");
  useEffect(() => {
    setFormatted(new Date(iso).toLocaleString(locale, { dateStyle: "short", timeStyle: "short" }));
  }, [iso, locale]);
  return formatted;
}

export function StatusBoard({
  initial,
  dict,
  locale,
}: {
  initial: PublicStatus;
  dict: StatusDict;
  locale: string;
}) {
  const [status, setStatus] = useState(initial);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/status", { cache: "no-store" });
      if (res.ok) setStatus((await res.json()) as PublicStatus);
    } catch {
      // Keep showing the last snapshot — a failed refresh is not an outage.
    } finally {
      setLoading(false);
    }
  }, []);

  const overall = TONE[status.state];
  const copy = dict.states[status.state];
  const updated = useFormattedDate(status.updatedAt, locale);

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Verdict */}
        <div className={`rounded-2xl border ${overall.border} ${overall.bg} p-6 md:p-8`}>
          <div className="flex items-start gap-4">
            <StateIcon state={status.state} className={`${overall.text} mt-0.5 flex-shrink-0`} />
            <div className="min-w-0">
              <h2 className={`text-xl md:text-2xl font-bold ${overall.text}`}>{copy.headline}</h2>
              <p className="text-gray-600 mt-1 text-sm md:text-base">{copy.blurb}</p>
            </div>
          </div>
        </div>

        {/* Per-component */}
        <div className="mt-8 rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          {status.components.map((c) => {
            const tone = TONE[c.state];
            const label = dict.components[c.key];
            return (
              <div key={c.key} className="flex items-center gap-4 p-4 md:p-5">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900">{label.label}</p>
                  <p className="text-sm text-gray-500">{label.description}</p>
                </div>
                <div className={`flex items-center gap-2 flex-shrink-0 ${tone.text}`}>
                  <span className={`w-2 h-2 rounded-full ${tone.dot}`} aria-hidden />
                  <span className="text-sm font-semibold">{dict.states[c.state].label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 7-day strip */}
        {status.history.length > 0 && (
          <div className="mt-8 rounded-2xl border border-gray-200 p-5 md:p-6">
            <p className="font-semibold text-gray-900 mb-4">{dict.historyTitle}</p>
            <div className="flex items-end gap-1.5">
              {status.history.map((d) => (
                <div key={d.date} className="flex-1 group relative">
                  <div
                    className={`h-10 rounded ${d.incident ? "bg-amber-400" : "bg-emerald-400"}`}
                    title={`${d.date} — ${d.incident ? dict.historyIncident : dict.historyOk}`}
                  />
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-0.5 text-[11px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.date.slice(5)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden /> {dict.historyOk}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" aria-hidden /> {dict.historyIncident}
              </span>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            {updated ? `${dict.updatedAt} ${updated}` : " "}
          </p>
          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {dict.refresh}
          </button>
        </div>

        <p className="mt-6 text-sm text-gray-500">{dict.note}</p>
      </div>
    </section>
  );
}
