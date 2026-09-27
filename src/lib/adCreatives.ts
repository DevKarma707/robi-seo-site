// Bibliothèque des créas validées (onglet Ads).
//
// La source de vérité reste le dossier ~/Desktop/ROBI_DOC/VALIDÉ/ et son
// README : `scripts/syncCreas.ts` le lit, dépose vidéos et couvertures dans
// Storage et écrit un document par créa (id = nom du fichier). L'admin ne
// fait que lire — sauf `metaAdId`, posé à la main pour relier une créa à la
// pub Meta qui la diffuse, et que la synchro ne touche jamais.
import { collection, deleteField, doc, onSnapshot, updateDoc, type Timestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface AdCreative {
  /** Nom du fichier vidéo, ex. 2026-09-26_robi-reel-22h47_FR_9x16_15s.mp4. */
  id: string;
  fichier: string;
  /** Titre lisible tiré du nom (« 22h47 », « peintre courte »). */
  titre: string;
  /** « reel » | « pub » | autre préfixe du nom. */
  genre: string;
  /** AAAA-MM-JJ de validation (préfixe du nom). */
  date: string;
  langue: string;
  format: string;
  /** Durée en secondes, si le nom la donne. */
  duree: number | null;
  /** Colonne « Usage » du README découpée : Reel IG, Pub Meta, TikTok US… */
  usages: string[];
  statut: string;
  aSavoir: string;
  source: string;
  videoUrl: string | null;
  coverUrl: string | null;
  legende: string | null;
  /** Pub Meta (id d'ad) qui diffuse cette créa. */
  metaAdId?: string;
  syncedAt?: Timestamp;
}

export const subscribeToCreatives = (
  cb: (rows: AdCreative[]) => void,
  onError?: (e: unknown) => void
) =>
  onSnapshot(
    collection(db, "adCreatives"),
    (snap) =>
      cb(
        snap.docs
          .map((d) => ({ ...(d.data() as AdCreative), id: d.id }))
          // Les plus récentes d'abord, puis par nom : l'ordre du README.
          .sort((a, b) => b.date.localeCompare(a.date) || a.fichier.localeCompare(b.fichier))
      ),
    (e) => (onError ? onError(e) : console.error("[subscribeToCreatives]", e))
  );

export const linkCreativeToAd = (id: string, metaAdId: string | null) =>
  updateDoc(doc(db, "adCreatives", id), { metaAdId: metaAdId || deleteField() });
