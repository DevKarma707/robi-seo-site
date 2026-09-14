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

/**
 * Descend la médiathèque sur le disque, là où Claude Code peut la lire, en
 * conservant les dossiers (ROBI_PARTAGE/reseaux/post.png). On n'envoie que
 * des URL : le runner télécharge lui-même, ce qui évite de faire transiter
 * des mégaoctets en base64 dans une requête JSON.
 */
export const syncSharedFiles = async (
  files: { name: string; url: string; folder?: string }[]
): Promise<{ written: string[]; dir: string }> => {
  const body = await call("/sync", { method: "POST", body: JSON.stringify({ files }) });
  return { written: (body.written as string[]) ?? [], dir: (body.dir as string) ?? "" };
};

/** Un fichier de ~/Desktop/ROBI_PARTAGE tel que le runner le décrit. */
export interface LocalFile {
  /** Chemin relatif au dossier partagé, ex. app-store-screens/v3/01.png */
  path: string;
  name: string;
  folder: string;
  size: number;
  mtime: string;
  contentType: string;
}

/** Ce que Claude a déposé sur le Mac, pour l'importer dans la médiathèque. */
export const listLocalFiles = async (): Promise<{ files: LocalFile[]; dir: string }> => {
  const body = await call("/shared");
  return { files: (body.files as LocalFile[]) ?? [], dir: (body.dir as string) ?? "" };
};

/** Les octets d'un fichier local, prêts à monter dans Storage depuis le navigateur. */
export const fetchLocalFile = async (path: string): Promise<Blob> => {
  const token = getToken();
  if (!token) throw new Error("Jeton du runner absent — colle-le une fois dans l'admin.");
  const r = await fetch(`${BASE}/shared/file?path=${encodeURIComponent(path)}`, {
    headers: { "x-runner-token": token },
  });
  if (r.status === 401) throw new Error("Jeton refusé par le runner.");
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `Erreur ${r.status}`);
  return r.blob();
};

const call = async (route: string, init: RequestInit = {}): Promise<Record<string, unknown>> => {
  const token = getToken();
  if (!token) throw new Error("Jeton du runner absent — colle-le une fois dans l'admin.");
  const r = await fetch(`${BASE}${route}`, {
    ...init,
    headers: { "content-type": "application/json", "x-runner-token": token, ...(init.headers || {}) },
  });
  if (r.status === 401) throw new Error("Jeton refusé par le runner.");
  const body = (await r.json().catch(() => ({}))) as Record<string, unknown>;
  if (!r.ok) throw new Error((body.error as string) || `Erreur ${r.status}`);
  return body;
};
