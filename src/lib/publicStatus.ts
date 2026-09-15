// Public status: the admin "Santé" report, stripped down to what a visitor
// may see.
//
// The raw report (functions/src/health.ts on robi-ai-system) carries error
// messages, affected user counts and email volumes — none of that can leave
// the admin. This module keeps only a per-component verdict and a day-by-day
// "was there an incident" strip. It is server-only: it holds the shared
// secret, exactly like adminAuth.ts — never import it from a client component.

const FUNCTIONS_BASE =
  process.env.ROBI_FUNCTIONS_URL || "https://europe-west1-robi-ai-system.cloudfunctions.net";

/** Seconds the upstream report is reused. A status page is read far more
 *  often than it changes, and every miss costs a Firestore scan. */
const TTL_SECONDS = 60;

export type ComponentState = "operational" | "degraded" | "down" | "unknown";

export interface PublicComponent {
  /** Stable key — the label itself is translated in the dictionaries. */
  key: "app" | "ai" | "email" | "reminders" | "api";
  state: ComponentState;
}

export interface PublicStatus {
  state: ComponentState;
  components: PublicComponent[];
  /** Oldest first. `incident` is true when at least one event landed that day. */
  history: { date: string; incident: boolean }[];
  windowDays: number;
  updatedAt: string;
}

interface RawHealth {
  windowDays: number;
  emails: { failureRate: number | null };
  clientErrors: { total: number };
  aiFailures: { total: number };
  functionErrors: { total: number };
  cron: { staleHours: number | null };
  daily: { date: string; count: number }[];
  computedAt: string;
}

const RANK: Record<ComponentState, number> = { operational: 0, unknown: 1, degraded: 2, down: 3 };
const worst = (states: ComponentState[]): ComponentState =>
  states.reduce((a, b) => (RANK[b] > RANK[a] ? b : a), "operational" as ComponentState);

/** Errors mean "degraded" here, never "down": the visitor only cares whether
 *  the service works, and a handful of caught exceptions doesn't stop it. */
const fromCount = (total: number): ComponentState => (total > 0 ? "degraded" : "operational");

function toPublic(raw: RawHealth): PublicStatus {
  const rate = raw.emails?.failureRate ?? null;
  const stale = raw.cron?.staleHours ?? null;

  const components: PublicComponent[] = [
    { key: "app", state: fromCount(raw.clientErrors?.total ?? 0) },
    { key: "ai", state: fromCount(raw.aiFailures?.total ?? 0) },
    {
      key: "email",
      state: rate === null ? "unknown" : rate > 20 ? "down" : rate > 5 ? "degraded" : "operational",
    },
    {
      // No trace at all is a fresh project, not an outage — hence "unknown".
      key: "reminders",
      state: stale === null ? "unknown" : stale > 48 ? "down" : stale > 26 ? "degraded" : "operational",
    },
    { key: "api", state: fromCount(raw.functionErrors?.total ?? 0) },
  ];

  return {
    state: worst(components.map((c) => c.state)),
    components,
    history: (raw.daily || []).map((d) => ({ date: d.date, incident: d.count > 0 })),
    windowDays: raw.windowDays ?? 7,
    updatedAt: raw.computedAt || new Date().toISOString(),
  };
}

/** Shown when the report can't be reached. A status page that errors out is
 *  worse than one that admits it doesn't know. */
const unknownStatus = (): PublicStatus => ({
  state: "unknown",
  components: (["app", "ai", "email", "reminders", "api"] as const).map((key) => ({
    key,
    state: "unknown" as ComponentState,
  })),
  history: [],
  windowDays: 7,
  updatedAt: new Date().toISOString(),
});

let cache: { at: number; value: PublicStatus } | null = null;

export async function getPublicStatus(): Promise<PublicStatus> {
  if (cache && Date.now() - cache.at < TTL_SECONDS * 1000) return cache.value;

  const secret = process.env.ADMIN_STATS_SECRET;
  if (!secret) return unknownStatus();

  try {
    const res = await fetch(`${FUNCTIONS_BASE}/getHealthReport?days=7`, {
      headers: { Authorization: `Bearer ${secret}` },
      // Our own TTL above handles reuse; Next must not layer a second cache
      // on top with a different lifetime.
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return cache?.value ?? unknownStatus();

    const value = toPublic((await res.json()) as RawHealth);
    cache = { at: Date.now(), value };
    return value;
  } catch {
    // Serve the last good snapshot rather than a blank page during a blip.
    return cache?.value ?? unknownStatus();
  }
}
