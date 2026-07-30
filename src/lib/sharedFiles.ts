/**
 * Dossier de travail partagé entre Ralph et Claude.
 *
 * Les fichiers vivent dans Firebase Storage sous `partage/`, en lecture
 * réservée à l'admin (voir storage.rules — c'est la différence essentielle
 * avec `blog/`, qui est public).
 *
 * Claude Code tourne sur le Mac, pas dans le navigateur : il ne peut donc pas
 * lire le bucket. Le runner local descend les fichiers dans un dossier du
 * disque, où Claude les lit comme n'importe quel fichier de projet.
 */
import {
  ref as storageRef, uploadBytes, getDownloadURL, listAll, deleteObject, getMetadata,
} from "firebase/storage";
import { storage } from "./firebase";

const ROOT = "partage";

export interface SharedFile {
  name: string;
  path: string;
  url: string;
  size: number;
  updated: string;
  contentType: string;
}

/** Nom de fichier sûr : pas de séparateur, pas de nom caché. */
const safeName = (raw: string) =>
  raw.replace(/[/\\]/g, "-").replace(/^\.+/, "").trim() || `fichier-${Date.now()}`;

export const listSharedFiles = async (): Promise<SharedFile[]> => {
  if (!storage) throw new Error("Firebase Storage non configuré.");
  const { items } = await listAll(storageRef(storage, ROOT));
  const files = await Promise.all(
    items.map(async (item) => {
      const [url, meta] = await Promise.all([getDownloadURL(item), getMetadata(item)]);
      return {
        name: item.name,
        path: item.fullPath,
        url,
        size: meta.size ?? 0,
        updated: meta.updated ?? "",
        contentType: meta.contentType ?? "application/octet-stream",
      };
    })
  );
  return files.sort((a, b) => b.updated.localeCompare(a.updated));
};

export const uploadSharedFile = async (file: File): Promise<void> => {
  if (!storage) throw new Error("Firebase Storage non configuré.");
  const r = storageRef(storage, `${ROOT}/${safeName(file.name)}`);
  await uploadBytes(r, file, { contentType: file.type || "application/octet-stream" });
};

export const deleteSharedFile = (path: string) => {
  if (!storage) throw new Error("Firebase Storage non configuré.");
  return deleteObject(storageRef(storage, path));
};

export const humanSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};
