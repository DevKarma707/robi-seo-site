/**
 * Client du runner local (scripts/robi-task-runner.mjs).
 *
 * Le runner tourne sur la machine de Ralph et ouvre une fenêtre Terminal par
 * tâche. Il n'est donc joignable que depuis son Mac : partout ailleurs, la
 * sonde échoue et l'admin retombe sur le deep link ou la copie du brief.
 */
const BASE = "http://127.0.0.1:4599";
const TOKEN_KEY = "robi_runner_token";

/** Clé de dépôt — le chemin réel vit côté runner, jamais ici. */
export type RepoKey = "app" | "site";

export const getToken = (): string =>
  (typeof window === "undefined" ? "" : localStorage.getItem(TOKEN_KEY) || "");

export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t.trim());

/**
 * Le runner tourne-t-il ? Un échec réseau est le cas normal (Ralph sur son
 * téléphone, ou runner éteint), pas une anomalie : on renvoie false sans bruit.
 */
export const runnerAvailable = async (): Promise<boolean> => {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 1200);
    const r = await fetch(`${BASE}/health`, { signal: ctrl.signal });
    clearTimeout(timer);
    return r.ok;
  } catch {
    return false;
  }
};

export type RunMode = "vscode" | "terminal";

export const runTask = async (repo: RepoKey, prompt: string, mode: RunMode = "vscode"): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error("Jeton du runner absent — colle-le une fois dans l'admin.");

  const r = await fetch(`${BASE}/run`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-runner-token": token },
    body: JSON.stringify({ repo, prompt, mode }),
  });

  if (r.status === 401) throw new Error("Jeton refusé par le runner.");
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `Erreur ${r.status}`);
};
