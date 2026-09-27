import type { HealthReport } from "./adminApi";

/**
 * Diagnostic de l'IA de l'app, en clair.
 *
 * Le rapport santé comptait les échecs (« 4 échec(s) de génération IA ») sans
 * dire pourquoi ni quoi faire. Le 25/09, une nouvelle inscrite a pris « Le
 * quota d'IA est épuisé » cinq minutes après son inscription et rien, dans
 * l'admin, ne le disait en ces termes. Ici, chaque signature d'échec est
 * rangée par cause, avec le geste qui va avec. Partagé par Cockpit et Santé.
 */

export type AiCauseKind = "quota" | "access" | "model" | "overload" | "other";
export type AiStatus = "ok" | "degraded" | "down";

export interface AiCause {
  kind: AiCauseKind;
  /** Ce qui s'est passé, pour un humain. */
  label: string;
  /** Ce qu'il faut faire. */
  action: string;
  count: number;
  lastSeen: string | null;
  /** Cause qui coupe l'IA pour tout le monde (quota, accès, modèle). */
  blocking: boolean;
}

export interface AiDiagnosis {
  status: AiStatus;
  causes: AiCause[];
  calls: number | null;
  failureRate: number | null;
  latencyP50Ms: number | null;
  latencyWorstMs: number | null;
}

// Ordre = priorité du rangement : « This model is currently experiencing high
// demand » est une surcharge, pas un modèle retiré — la surcharge passe avant.
const CAUSES: { kind: AiCauseKind; test: RegExp; label: string; action: string; blocking: boolean }[] = [
  {
    kind: "quota",
    test: /quota|429|too many requests|resource.?exhausted/i,
    label: "Quota Gemini épuisé : l'IA a refusé les demandes des utilisateurs.",
    action: "Google Cloud › projet robi-ai-system › Facturation, puis les quotas de l'API Generative Language. Si le projet est encore au palier gratuit, passer au palier payant.",
    blocking: true,
  },
  {
    kind: "access",
    test: /denied access|permission|403|clé|api key/i,
    label: "Google refuse l'accès à Gemini (clé ou projet bloqué).",
    action: "Google Cloud › projet robi-ai-system : vérifier la facturation, que l'API Generative Language est activée et que la clé n'a pas de restriction. Si tout est vert, c'est le support Google.",
    blocking: true,
  },
  {
    kind: "overload",
    test: /indisponible|surcharg|503|high demand|unavailable|overloaded/i,
    label: "Gemini surchargé côté Google : l'IA a été momentanément indisponible.",
    action: "Rien à faire si c'est ponctuel. Si ça se répète, prévoir un modèle de repli (GEMINI_MODEL).",
    blocking: false,
  },
  {
    kind: "model",
    test: /mod[eè]le|model|not found|404|retired|deprecated/i,
    label: "Le modèle Gemini utilisé n'est plus disponible.",
    action: "Changer la variable GEMINI_MODEL sur Vercel (projet robi-ai) pour un modèle en service, puis redéployer.",
    blocking: true,
  },
];

const later = (a: string | null, b: string | null) =>
  !a ? b : !b ? a : Date.parse(a) > Date.parse(b) ? a : b;

export function diagnoseAi(report: HealthReport | null): AiDiagnosis | null {
  if (!report) return null;

  const byKind = new Map<AiCauseKind, AiCause>();
  for (const sig of report.aiFailures.top) {
    const text = `${sig.signature} ${sig.sample ?? ""}`;
    const def = CAUSES.find((c) => c.test.test(text));
    const kind: AiCauseKind = def?.kind ?? "other";
    const prev = byKind.get(kind);
    byKind.set(kind, {
      kind,
      label: def?.label ?? `Échec de l'IA : ${sig.signature}`,
      action: def?.action ?? "Ouvrir la signature dans Santé et la rapprocher des journaux Vercel (/api/ai/chat).",
      blocking: def?.blocking ?? false,
      count: (prev?.count ?? 0) + sig.count,
      lastSeen: later(prev?.lastSeen ?? null, sig.lastSeen ?? null),
    });
  }
  const causes = [...byKind.values()].sort(
    (a, b) => Number(b.blocking) - Number(a.blocking) || b.count - a.count,
  );

  const perf = report.aiPerformance;
  const failureRate = perf?.failureRate ?? null;
  const status: AiStatus = causes.some((c) => c.blocking)
    ? "down"
    : causes.length > 0 || (failureRate !== null && failureRate >= 20)
      ? "degraded"
      : "ok";

  return {
    status,
    causes,
    calls: perf?.calls ?? null,
    failureRate,
    latencyP50Ms: perf?.latencyP50ApproxMs ?? null,
    latencyWorstMs: perf?.latencyP95WorstMs ?? null,
  };
}

/** Les lignes du rapport santé que le diagnostic IA remplace (même sujet, en moins clair). */
export const isAiProblem = (problem: string) => /\bIA\b/.test(problem);
