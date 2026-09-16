// Passation du lancement.
//
// Le kanban dit ce qui reste à faire ; il ne dit pas où on en est, ce qu'il
// ne faut pas toucher, ni ce qui a été appris en route. Ce document unique
// (launchMeta/passation) porte cette mémoire, pour Ralph dans l'onglet
// Tâches et pour tout agent qui débarque : `npx tsx scripts/kanban.ts`
// l'affiche avant le tableau, et `note` y signe une intervention.
import { doc, onSnapshot, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface PassationEntry {
  /** ISO 8601. */
  date: string;
  /** Qui a écrit : « ralph », « claude », « codex »… */
  agent: string;
  note: string;
}

export interface Passation {
  /** Où on en est, en trois lignes. */
  etat: string;
  /** Ce qu'aucun agent ne doit modifier sans demander. */
  nePasToucher: string;
  /** Pièges connus, faux amis, choses apprises à la dure. */
  attention: string;
  /** Journal des interventions, la plus récente en premier. */
  journal: PassationEntry[];
  updatedAt?: Timestamp;
  updatedBy?: string;
}

export const PASSATION_PATH = ["launchMeta", "passation"] as const;

export const EMPTY_PASSATION: Passation = {
  etat: "", nePasToucher: "", attention: "", journal: [],
};

const ref = () => doc(db, PASSATION_PATH[0], PASSATION_PATH[1]);

export const subscribeToPassation = (
  onData: (p: Passation) => void,
  onError: (e: Error) => void,
) =>
  onSnapshot(
    ref(),
    (snap) => onData(snap.exists() ? { ...EMPTY_PASSATION, ...(snap.data() as Partial<Passation>) } : EMPTY_PASSATION),
    onError,
  );

/** Enregistre les trois textes ; le journal n'est touché que par `addPassationNote`. */
export const savePassation = (
  patch: Pick<Passation, "etat" | "nePasToucher" | "attention">,
  by: string,
) => setDoc(ref(), { ...patch, updatedAt: serverTimestamp(), updatedBy: by }, { merge: true });

export const addPassationNote = (current: Passation, agent: string, note: string) =>
  setDoc(
    ref(),
    {
      journal: [{ date: new Date().toISOString(), agent, note }, ...current.journal].slice(0, 200),
      updatedAt: serverTimestamp(),
      updatedBy: agent,
    },
    { merge: true },
  );
