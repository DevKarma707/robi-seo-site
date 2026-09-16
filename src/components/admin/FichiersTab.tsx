"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Upload, Trash2, RefreshCw, AlertTriangle, Download, FolderSync, FileText,
  Link2, FolderPlus, HardDriveDownload, Image as ImageIcon, X,
} from "lucide-react";
import {
  listSharedFiles, listSharedFolders, uploadSharedFile, uploadZip, deleteSharedFile, humanSize, isImage, safeFolder,
  PRESET_FOLDERS, ROOT_FOLDER, type SharedFile,
} from "@/lib/sharedFiles";
import {
  runnerAvailable, syncSharedFiles, listLocalFiles, fetchLocalFile, getToken, setToken,
  type LocalFile,
} from "@/lib/taskRunner";
import { ACCENT_INK, btn, btnGhost, btnPrimary, card, focusRing, sectionTitle } from "./ui";
import { toast } from "./toast";

const ALL = "__tous__";

/** Le jeton du runner, demandé une seule fois puis gardé dans le navigateur. */
const ensureToken = (): boolean => {
  if (getToken()) return true;
  const entered = window.prompt(
    "Jeton du runner local — affiché au démarrage de `npm run runner`. Il n'est demandé qu'une fois."
  );
  if (!entered?.trim()) return false;
  setToken(entered);
  return true;
};

const FichiersTab: React.FC = () => {
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasRunner, setHasRunner] = useState(false);
  const [dragging, setDragging] = useState(false);
  // Aucun dossier au départ : on attend de savoir lesquels existent pour en
  // ouvrir un. Charger « Tous » d'emblée est précisément ce qui faisait
  // attendre l'onglet plusieurs minutes.
  const [folder, setFolder] = useState<string>("");
  const [allFolders, setAllFolders] = useState<string[]>([]);
  const [uploadFolder, setUploadFolder] = useState<string>(PRESET_FOLDERS[1]);
  const [preview, setPreview] = useState<SharedFile | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // Import depuis le Mac
  const [local, setLocal] = useState<{ files: LocalFile[]; dir: string } | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [localFolder, setLocalFolder] = useState<string>(ALL);

  const say = toast;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Les lots partiels s'affichent au fur et à mesure : dès les premiers
      // fichiers, l'écran se remplit au lieu d'attendre la médiathèque
      // entière. `setLoading(false)` dès le premier lot pour que la grille
      // remplace le message de chargement sans attendre la fin.
      setFiles(await listSharedFiles((partiel) => {
        setFiles(partiel);
        setLoading(false);
      }, folder === ALL ? undefined : folder));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [folder]);

  // 1) Les dossiers d'abord — une requête, l'onglet s'affiche aussitôt.
  useEffect(() => {
    listSharedFolders()
      .then((noms) => {
        setAllFolders(noms);
        // Ouvrir le dossier de travail habituel s'il existe, sinon le premier.
        setFolder(noms.includes(PRESET_FOLDERS[1]) ? PRESET_FOLDERS[1] : noms[0] || ROOT_FOLDER);
      })
      .catch((e) => { setError((e as Error).message); setLoading(false); });
  }, []);

  // 2) Puis les fichiers du dossier ouvert, et de lui seul.
  useEffect(() => { if (folder) load(); }, [folder, load]);
  useEffect(() => { runnerAvailable().then(setHasRunner); }, []);

  /** Dossiers existants + dossiers proposés, sans doublon, racine en dernier. */
  const folders = useMemo(() => {
    const seen = new Set<string>([...PRESET_FOLDERS, ...allFolders]);
    seen.delete(ROOT_FOLDER);
    const list = Array.from(seen).sort();
    if (allFolders.includes(ROOT_FOLDER)) list.push(ROOT_FOLDER);
    return list;
  }, [allFolders]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    files.forEach((f) => { c[f.folder] = (c[f.folder] || 0) + 1; });
    return c;
  }, [files]);

  const visible = folder === ALL ? files : files.filter((f) => f.folder === folder);

  const estZip = (f: File) =>
    f.name.toLowerCase().endsWith(".zip") || f.type === "application/zip";

  const upload = async (list: FileList | null) => {
    if (!list?.length) return;
    setBusy(true);
    setProgress(null);
    try {
      let simples = 0;
      const comptes = { deposes: 0, ignores: 0 };

      for (const f of Array.from(list)) {
        // Une archive est étalée plutôt que déposée telle quelle : un zip dans
        // la médiathèque ne sert à rien, on ne peut ni le prévisualiser ni
        // l'attacher à un post.
        if (estZip(f)) {
          const r = await uploadZip(f, uploadFolder, (fait, total) => setProgress(`${f.name} — ${fait}/${total}`));
          comptes.deposes += r.deposes.length;
          comptes.ignores += r.ignores.length;
          if (r.ignores.length) console.warn("[zip] ignorés :", r.ignores);
        } else {
          await uploadSharedFile(f, f.name, uploadFolder);
          simples++;
        }
      }

      const parts: string[] = [];
      if (simples) parts.push(`${simples} fichier(s)`);
      if (comptes.deposes) parts.push(`${comptes.deposes} extrait(s) d'archive`);
      const suffixe = comptes.ignores ? ` · ${comptes.ignores} ignoré(s), voir la console` : "";
      say("ok", `${parts.join(" · ") || "Rien"} déposé(s) dans ${uploadFolder}${suffixe}.`);
      await load();
    } catch (e) {
      say("err", (e as Error).message);
    } finally {
      setBusy(false);
      setProgress(null);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const remove = async (f: SharedFile) => {
    if (!confirm(`Supprimer « ${f.name} » ? Le fichier déjà synchronisé sur ton disque reste en place.`)) return;
    setBusy(true);
    try {
      await deleteSharedFile(f.path);
      if (preview?.path === f.path) setPreview(null);
      await load();
    } catch (e) {
      say("err", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async (f: SharedFile) => {
    try {
      await navigator.clipboard.writeText(f.url);
      say("ok", "Lien copié.");
    } catch {
      say("err", "Impossible de copier le lien.");
    }
  };

  const newFolder = () => {
    const raw = window.prompt("Nom du nouveau dossier (ex. campagne-octobre)");
    const clean = raw ? safeFolder(raw) : "";
    if (!clean) return;
    setUploadFolder(clean);
    setFolder(uploadFolder);
    say("ok", `Dossier « ${clean} » prêt : il apparaîtra au premier fichier déposé.`);
  };

  const sync = async () => {
    if (!ensureToken()) return;
    setBusy(true);
    try {
      const { written, dir } = await syncSharedFiles(
        visible.map((f) => ({ name: f.name, url: f.url, folder: f.sub ? `${f.folder}/${f.sub}` : f.folder }))
      );
      say("ok", `${written.length} fichier(s) dans ${dir}`);
    } catch (e) {
      say("err", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const openLocal = async () => {
    if (!ensureToken()) return;
    setLocalLoading(true);
    try {
      const res = await listLocalFiles();
      // Ce qui est déjà en ligne (même dossier, même nom) n'est pas reproposé.
      const online = new Set(files.map((f) => [f.folder, f.sub, f.name].filter(Boolean).join("/")));
      res.files = res.files.filter((f) => !online.has(f.folder === ROOT_FOLDER ? `${ROOT_FOLDER}/${f.name}` : f.path));
      setLocal(res);
      setPicked(new Set());
      setLocalFolder(ALL);
    } catch (e) {
      say("err", (e as Error).message);
    } finally {
      setLocalLoading(false);
    }
  };

  const localFolders = useMemo(() => {
    const s = new Set<string>();
    local?.files.forEach((f) => s.add(f.folder));
    return Array.from(s).sort();
  }, [local]);

  const localVisible = useMemo(
    () => (local?.files || []).filter((f) => localFolder === ALL || f.folder === localFolder),
    [local, localFolder]
  );

  const togglePick = (p: string) =>
    setPicked((prev) => {
      const n = new Set(prev);
      if (n.has(p)) n.delete(p); else n.add(p);
      return n;
    });

  const pickAllVisible = () =>
    setPicked((prev) => {
      const n = new Set(prev);
      const allIn = localVisible.every((f) => n.has(f.path));
      localVisible.forEach((f) => (allIn ? n.delete(f.path) : n.add(f.path)));
      return n;
    });

  const importPicked = async () => {
    if (!local || !picked.size) return;
    const targets = local.files.filter((f) => picked.has(f.path));
    setBusy(true);
    let done = 0;
    try {
      for (const f of targets) {
        setProgress(`${done + 1}/${targets.length} · ${f.name}`);
        const blob = await fetchLocalFile(f.path);
        // Sous-chemin conservé sous le dossier : app-store-screens/v3/png/01.png
        const rel = f.folder === ROOT_FOLDER ? f.name : f.path.slice(f.folder.length + 1);
        await uploadSharedFile(blob, rel, f.folder);
        done += 1;
      }
      say("ok", `${done} fichier(s) importé(s) dans la médiathèque.`);
      setLocal(null);
      await load();
    } catch (e) {
      say("err", `${(e as Error).message}${done ? ` (${done} déjà importé(s))` : ""}`);
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  if (loading && !files.length && !error) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm py-10">
        <RefreshCw size={16} className="animate-spin" /> Chargement de la médiathèque…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Dépôt */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); upload(e.dataTransfer.files); }}
        className={`rounded-2xl border border-dashed p-6 text-center transition-colors ${
          dragging ? "border-[var(--color-accent)]/50 bg-[var(--color-accent)]/[0.04]" : "border-slate-300 bg-slate-50"
        }`}
      >
        <Upload size={22} className="mx-auto mb-2 text-slate-400" />
        <p className="text-sm text-slate-600">
          Dépose tes fichiers <b>ou un .zip</b> ici, ou{" "}
          <button onClick={() => fileInput.current?.click()} className={`underline text-[var(--admin-ink)] ${focusRing}`}>
            choisis-les
          </button>
          {" "}— dans le dossier{" "}
          <select
            value={uploadFolder}
            onChange={(e) => setUploadFolder(e.target.value)}
            className={`inline-block rounded-lg border border-slate-200 bg-white px-2 py-1 text-[12px] font-semibold text-slate-900 ${focusRing}`}
          >
            {folders.filter((f) => f !== ROOT_FOLDER).concat(folders.includes(uploadFolder) ? [] : [uploadFolder]).map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <button onClick={newFolder} className={`${btnGhost} ml-2 align-middle`} title="Nouveau dossier">
            <FolderPlus size={11} />
          </button>
        </p>
        <p className="text-[11px] text-slate-400 mt-2">
          Une archive est ouverte ici même et ses images déposées une à une — le zip
          lui-même n&apos;est pas conservé : il ne se prévisualise pas et ne s&apos;attache
          pas à un post.
        </p>
        <p className="text-[11px] text-slate-400 mt-1.5">
          Visuels, exports, documents de marque… 50 Mo par fichier. Lecture réservée à ton compte admin.
        </p>
        <input ref={fileInput} type="file" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
      </div>

      {/* Pont avec le Mac */}
      <div className={`${card} p-5`}>
        <div className="flex items-center gap-2 mb-2">
          <FolderSync size={15} style={{ color: ACCENT_INK }} />
          <p className={sectionTitle}>Pont avec le Mac</p>
        </div>
        <p className="text-[12px] text-slate-600 leading-relaxed">
          Claude Code tourne sur ton Mac, pas dans le navigateur. Dans un sens, la synchro descend la
          médiathèque dans <code className="text-[var(--admin-ink)]">~/Desktop/ROBI_PARTAGE</code> (dossiers
          conservés). Dans l&apos;autre, l&apos;import remonte ce que Claude y a produit — écrans App Store,
          visuels de posts — sans passer par le Finder.
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <button onClick={openLocal} disabled={busy || localLoading || !hasRunner} className={btnPrimary}>
            <span className="flex items-center gap-1.5">
              {localLoading ? <RefreshCw size={12} className="animate-spin" /> : <HardDriveDownload size={12} />}
              Importer depuis le Mac
            </span>
          </button>
          <button onClick={sync} disabled={busy || !visible.length || !hasRunner} className={btn}>
            <span className="flex items-center gap-1.5">
              <FolderSync size={12} /> Synchroniser {folder === ALL ? "tout" : `« ${folder} »`} sur mon Mac
            </span>
          </button>
          {!hasRunner && (
            <span className="text-[11px] text-amber-600/70 flex items-center gap-1">
              <AlertTriangle size={11} /> Runner éteint — lance `npm run runner`
            </span>
          )}
        </div>
      </div>

      {/* Sélecteur d'import */}
      {local && (
        <div className={`${card} p-5 space-y-3`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className={sectionTitle}>Sur le Mac · {local.files.length} nouveau(x)</p>
              <p className="text-[11px] text-slate-400 truncate">{local.dir}</p>
            </div>
            <button onClick={() => setLocal(null)} className={btnGhost} title="Fermer"><X size={11} /></button>
          </div>
          {local.files.length === 0 ? (
            <p className="text-[12px] text-slate-400 py-4 text-center">Rien de nouveau : tout est déjà dans la médiathèque.</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-1.5">
                <Chip active={localFolder === ALL} onClick={() => setLocalFolder(ALL)}>Tous</Chip>
                {localFolders.map((f) => (
                  <Chip key={f} active={localFolder === f} onClick={() => setLocalFolder(f)}>{f}</Chip>
                ))}
              </div>
              <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
                {localVisible.map((f) => (
                  <label key={f.path} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer">
                    <input type="checkbox" checked={picked.has(f.path)} onChange={() => togglePick(f.path)} className="accent-[var(--admin-ink)]" />
                    {f.contentType.startsWith("image/") ? <ImageIcon size={14} className="text-slate-400" /> : <FileText size={14} className="text-slate-400" />}
                    <span className="flex-1 min-w-0 text-[12px] text-slate-900 truncate">{f.path}</span>
                    <span className="text-[10px] text-slate-400">{humanSize(f.size)}</span>
                  </label>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={pickAllVisible} className={btnGhost}>
                  {localVisible.every((f) => picked.has(f.path)) ? "Tout décocher" : "Tout cocher"}
                </button>
                <button onClick={importPicked} disabled={busy || !picked.size} className={btnPrimary}>
                  <span className="flex items-center gap-1.5">
                    <Upload size={12} /> Importer {picked.size ? `(${picked.size})` : ""}
                  </span>
                </button>
                {progress && <span className="text-[11px] text-slate-500">{progress}</span>}
              </div>
            </>
          )}
        </div>
      )}

      {/* Dossiers */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <Chip active={folder === ALL} onClick={() => setFolder(ALL)}>Tous</Chip>
          {folders.filter((f) => counts[f]).map((f) => (
            <Chip key={f} active={folder === f} onClick={() => setFolder(f)}>{f}{counts[f] ? ` · ${counts[f]}` : ""}</Chip>
          ))}
        </div>
      )}

      {/* Grille */}
      {error ? (
        <div className={`${card} p-5 space-y-2`}>
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={16} />
            <p className="font-black text-sm">Médiathèque illisible</p>
          </div>
          <p className="text-xs text-slate-600">{error}</p>
          <button onClick={load} className={`${btn} mt-2`}>Réessayer</button>
        </div>
      ) : visible.length === 0 ? (
        <p className="text-[12px] text-slate-400 px-1 py-6 text-center">Aucun fichier pour l&apos;instant.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {visible.map((f) => (
            <div key={f.path} className={`${card} overflow-hidden group`}>
              <button
                onClick={() => (isImage(f) ? setPreview(f) : window.open(f.url, "_blank"))}
                className={`block w-full aspect-square bg-slate-100 overflow-hidden ${focusRing}`}
                title={isImage(f) ? "Aperçu" : "Ouvrir"}
              >
                {isImage(f) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.url} alt={f.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <FileText size={28} />
                  </div>
                )}
              </button>
              <div className="p-2.5">
                <p className="text-[12px] font-semibold text-slate-900 truncate" title={f.name}>{f.name}</p>
                <p className="text-[10px] text-slate-400 truncate" title={f.sub}>
                  {f.sub ? `${f.folder}/${f.sub}` : f.folder} · {humanSize(f.size)}
                  {f.updated && ` · ${new Date(f.updated).toLocaleDateString("fr-FR")}`}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <button onClick={() => copyLink(f)} className={btnGhost} title="Copier le lien"><Link2 size={11} /></button>
                  <a href={f.url} target="_blank" rel="noreferrer" download className={btnGhost} title="Télécharger"><Download size={11} /></a>
                  <button
                    onClick={() => remove(f)}
                    disabled={busy}
                    className={`${btnGhost} ml-auto !bg-red-500/15 !text-red-600 hover:!bg-red-500/25`}
                    title="Supprimer"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Aperçu plein écran */}
      {preview && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-6"
          onClick={() => setPreview(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview.url} alt={preview.name} className="max-w-full max-h-full rounded-xl shadow-2xl" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <span className="text-[12px] font-semibold text-slate-900 max-w-[40vw] truncate">{preview.name}</span>
            <button onClick={() => copyLink(preview)} className={btnGhost} title="Copier le lien"><Link2 size={11} /></button>
            <a href={preview.url} target="_blank" rel="noreferrer" download className={btnGhost} title="Télécharger"><Download size={11} /></a>
            <button onClick={() => setPreview(null)} className={btnGhost} title="Fermer"><X size={11} /></button>
          </div>
        </div>
      )}
    </div>
  );
};

const Chip: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${focusRing} ${
      active ? "bg-[var(--color-accent)] text-[var(--a-on-accent)]" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
    }`}
  >
    {children}
  </button>
);

export default FichiersTab;
