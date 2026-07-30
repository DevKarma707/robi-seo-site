"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, firebaseReady } from "@/lib/firebase";

/**
 * Public opt-out target for outreach emails.
 *
 * The link carries only an opaque token — never the email address, which has no
 * business being in a URL. The admin resolves tokens back to prospects; this
 * page just records the request, which is what makes the opt-out effective
 * (GDPR art. 21, art. L34-5 CPCE).
 */
export default function Desinscription() {
  const [state, setState] = useState<"working" | "done" | "error" | "missing">("working");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("t");
    if (!token) {
      setState("missing");
      return;
    }
    if (!firebaseReady) {
      setState("error");
      return;
    }
    addDoc(collection(db, "unsubscribes"), { token, at: serverTimestamp() })
      .then(() => setState("done"))
      .catch((e) => {
        console.error("[desinscription]", e);
        setState("error");
      });
  }, []);

  const MESSAGES = {
    working: { title: "Un instant…", body: "Nous enregistrons votre demande." },
    done: {
      title: "C'est fait",
      body: "Vous ne recevrez plus de message de notre part. Aucune action supplémentaire n'est nécessaire.",
    },
    missing: {
      title: "Lien incomplet",
      body: "Ce lien de désinscription est incomplet. Répondez simplement « stop » au message reçu et nous nous en chargeons.",
    },
    error: {
      title: "Nous n'avons pas pu enregistrer la demande",
      body: "Répondez « stop » au message reçu : nous traiterons votre demande manuellement.",
    },
  } as const;

  const m = MESSAGES[state];

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0A0425] px-6">
      <div className="max-w-md text-center space-y-3">
        <h1 className="font-black text-2xl text-white">{m.title}</h1>
        <p className="text-sm text-white/60 leading-relaxed">{m.body}</p>
        <a
          href="/"
          className="inline-block mt-4 text-xs font-black uppercase tracking-widest text-[#BEF221] hover:opacity-80"
        >
          Retour à Robi
        </a>
      </div>
    </main>
  );
}
