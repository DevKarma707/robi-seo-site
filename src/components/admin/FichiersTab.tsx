"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Upload, Trash2, RefreshCw, AlertTriangle, Check, Download, FolderSync, FileText,
} from "lucide-react";
import {
  listSharedFiles, uploadSharedFile, deleteSharedFile, humanSize, type SharedFile,
} from "@/lib/sharedFiles";
import { runnerAvailable, syncSharedFiles, getToken, setToken } from "@/lib/taskRunner";
import { ACCENT, btn, btnGhost, btnPrimary, card, focusRing, sectionTitle } from "./ui";

const FichiersTab: React.FC = () => {
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [hasRunner, setHasRunner] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (flashTimer.current) clearTimeout(flashTimer.current); }, []);
  const say = useCallback((kind: "ok" | "err", text: string) => {
    setFlash({ kind, text });
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 5000);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setFiles(await listSharedFiles());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { runnerAvailable().then(setHasRunner); }, []);

  const upload = async (list: FileList | null) => {
    if (!list?.length) return;
    setBusy(true);
    try {
      for (const f of Array.from(list)) await uploadSharedFile(f);
      say("ok", `${list.length} fichier(s) déposé(s).`);
      await load();
    } catch (e) {
      say("err", (e as Error).message);
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const remove = async (f: SharedFile) => {
    if (!confirm(`Supprimer « ${f.name} » ? Le fichier déjà synchronisé sur ton disque reste en place.`)) return;
    setBusy(true);
    try {
      await deleteSharedFile(f.path);
      await load();
    } catch (e) {
      say("err", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const sync = async () => {
    if (!getToken()) {
      const entered = window.prompt(
        "Jeton du runner local — affiché au démarrage de `npm run runner`. Il n'est demandé qu'une fois."
      );
      if (!entered?.trim()) return;
      setToken(entered);
    }
    setBusy(true);
    try {
      const { written, dir } = await syncSharedFiles(files.map((f) => ({ name: f.name, url: f.url })));
      say("ok", `${written.length} fichier(s) dans ${dir}`);
    } catch (e) {
      say("err", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (loading && !files.length && !error) {
    return (
      <div className="flex items-center gap-2 text-white/40 text-sm py-10">
        <RefreshCw size={16} className="animate-spin" /> Chargement du dossier…
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
        className={`rounded-2xl border border-dashed p-8 text-center transition-colors ${
          dragging ? "border-[#BEF221]/50 bg-[#BEF221]/[0.04]" : "border-white/[0.12] bg-white/[0.02]"
        }`}
      >
        <Upload size={22} className="mx-auto mb-2 text-white/30" />
        <p className="text-sm text-white/60">
          Dépose tes fichiers ici, ou{" "}
          <button onClick={() => fileInput.current?.click()} className={`underline text-[#BEF221] ${focusRing}`}>
            choisis-les
          </button>
        </p>
        <p className="text-[11px] text-white/25 mt-1.5">
          Exports, captures, documents de marque… 50 Mo par fichier. Lecture réservée à ton compte admin.
        </p>
        <input
          ref={fileInput}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => upload(e.target.files)}
        />
      </div>

      {/* Synchro */}
      <div className={`${card} p-5`}>
        <div className="flex items-center gap-2 mb-2">
          <FolderSync size={15} style={{ color: ACCENT }} />
          <p className={sectionTitle}>Accès de Claude</p>
        </div>
        <p className="text-[12px] text-white/50 leading-relaxed">
          Claude Code tourne sur ton Mac, pas dans le navigateur : il ne voit pas ce bucket.
          La synchro descend le dossier dans <code className="text-[#BEF221]">~/Desktop/ROBI_PARTAGE</code>,
          où il le lit comme n&apos;importe quel fichier de projet.
        </p>
        <div className="flex items-center gap-2 mt-3">
          <button onClick={sync} disabled={busy || !files.length || !hasRunner} className={btnPrimary}>
            <span className="flex items-center gap-1.5">
              <FolderSync size={12} /> Synchroniser sur mon Mac
            </span>
          </button>
          {!hasRunner && (
            <span className="text-[11px] text-amber-300/70 flex items-center gap-1">
              <AlertTriangle size={11} /> Runner éteint — lance `npm run runner`
            </span>
          )}
        </div>
      </div>

      {/* Liste */}
      {error ? (
        <div className={`${card} p-5 space-y-2`}>
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle size={16} />
            <p className="font-black text-sm">Dossier illisible</p>
          </div>
          <p className="text-xs text-white/50">{error}</p>
          <button onClick={load} className={`${btn} mt-2`}>Réessayer</button>
        </div>
      ) : files.length === 0 ? (
        <p className="text-[12px] text-white/25 px-1 py-6 text-center">
          Aucun fichier pour l&apos;instant.
        </p>
      ) : (
        <div className={`${card} overflow-hidden`}>
          {files.map((f) => (
            <div
              key={f.path}
              className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.05] last:border-0 hover:bg-white/[0.03] transition-colors"
            >
              <FileText size={15} className="text-white/25 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white truncate">{f.name}</p>
                <p className="text-[10px] text-white/30">
                  {humanSize(f.size)}
                  {f.updated && ` · ${new Date(f.updated).toLocaleDateString("fr-FR")}`}
                </p>
              </div>
              <a href={f.url} target="_blank" rel="noreferrer" className={btnGhost} title="Télécharger">
                <Download size={11} />
              </a>
              <button
                onClick={() => remove(f)}
                disabled={busy}
                className={`${btnGhost} !bg-red-500/15 !text-red-400 hover:!bg-red-500/25`}
                title="Supprimer"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {flash && (
        <div
          className="fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-2xl text-[12px] font-bold z-50 flex items-center gap-2"
          style={{ backgroundColor: flash.kind === "ok" ? ACCENT : "#f87171", color: flash.kind === "ok" ? "#000" : "#fff" }}
        >
          {flash.kind === "ok" ? <Check size={13} /> : <AlertTriangle size={13} />}
          {flash.text}
        </div>
      )}
    </div>
  );
};

export default FichiersTab;
