"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft, ChevronRight, FileJson, RefreshCw, AlertTriangle, Check, Trash2,
  Pencil, X, Copy, Sparkles, ClipboardCopy, ImagePlus, Loader2, Send, ShieldCheck,
  CalendarDays, List, CircleAlert,
} from "lucide-react";
import { listSharedFiles, isImage, type SharedFile } from "@/lib/sharedFiles";
import {
  subscribeToPosts, addPost, updatePost, updatePostText, deletePost, importPostsFromJson,
  monthGrid, MONTH_NAMES, CHANNEL_META, TYPE_META, STATUS_META, STATUTS_MANUELS, CHANNELS, TYPES,
  type SocialPost, type PostChannel, type PostStatus,
} from "@/lib/socialPosts";
import { verifierAvantProgrammation, estProgrammable, type Verdict } from "@/lib/publicationCheck";
import {
  diagnostiquer, proposerCases, libellePersona, libellePilier, libelleAngle,
  PERSONAS, PILIERS, ANGLES, ECART_PERSONA, ECART_ANGLE,
} from "@/lib/editorialGrid";
import { auth } from "@/lib/firebase";
import { ACCENT, btnGhost, btnPill, btnPrimary, card, focusRing, input, select, sectionTitle } from "./ui";

/**
 * Brief à coller dans Claude Code pour fabriquer un mois de posts.
 *
 * Il embarque l'historique des posts existants (publiés, prêts, brouillons)
 * pour qu'une session Claude Code — qui démarre toujours vide — sache ce qui
 * a déjà été dit et attaque des angles neufs. La ligne éditoriale, elle,
 * vit dans le dépôt de l'app (branding/EDITORIAL_LINE.md) : c'est le skill
 * qui la lit, le brief se contente de la rappeler.
 */
const skillBrief = (year: number, month: number, history: SocialPost[]) => {
  const passe = history.filter(
    (p) => p.status !== "draft" || p.date < `${year}-${String(month + 1).padStart(2, "0")}`
  );

  // L'accroche seule ne suffit pas à éviter la redondance : deux posts très
  // différents à la lecture peuvent viser le même métier sur le même levier.
  // La case se lit d'un coup d'œil, l'accroche demande de tout relire.
  const digest = passe.slice(-60).map((p) => {
    const hook = p.caption.split("\n").find((l) => l.trim()) ?? "";
    const boite = [p.pilier, p.persona, p.angle].filter(Boolean).join("/") || "case non renseignée";
    return `- ${p.date} · ${p.channel} · ${p.type} · ${boite} — « ${hook.slice(0, 80)} »`;
  });

  const diag = diagnostiquer(passe);
  const cases = proposerCases(passe, 12);

  return [
    `/robi-social-media ${MONTH_NAMES[month]} ${year}`,
    "",
    `Génère le calendrier éditorial de ${MONTH_NAMES[month]} ${year} pour Robi.`,
    "Lis d'abord branding/EDITORIAL_LINE.md (ligne éditoriale) et branding/BRAND_KIT.md dans ~/Desktop/ROBI_V1_READY.",
    "Sors un tableau JSON prêt à importer dans l'onglet Réseaux de l'admin.",
    "",
    "Champs OBLIGATOIRES par post : externalId, date (AAAA-MM-JJ),",
    "channel (instagram|linkedin|tiktok),",
    "type (bold|feature|stats|testimonial|carrousel|mockup), caption.",
    "Facultatifs : hashtags, visual, imageUrl (en https:// uniquement).",
    "",
    "externalId est l'identité du post : lettres, chiffres, tiret et souligné,",
    "120 caractères maximum. Il doit rester IDENTIQUE si tu réémets le même",
    "post plus tard — c'est lui qui permet d'y rattacher le visuel une fois",
    "produit, au lieu d'en créer un second. Convention : AAAA-MM-sujet-reseau,",
    "par exemple 2026-09-facturx-obligatoire-ig.",
    "",
    "N'émets pas de statut : un import crée toujours un brouillon, le passage",
    "en « prêt » se fait après relecture dans l'admin.",
    "",
    "── LA GRILLE ÉDITORIALE ──",
    "",
    "Chaque post occupe une CASE à trois axes, et la porte dans son JSON :",
    "  pilier  : " + PILIERS.map((x) => x.id).join(" | "),
    "  persona : " + PERSONAS.map((x) => x.id).join(" | "),
    "  angle   : " + ANGLES.map((x) => x.id).join(" | "),
    "",
    "Ce n'est pas de la paperasse : c'est ce qui permet au mois SUIVANT de",
    "savoir ce que tu as déjà dit. Un post sans case est un post que la",
    "prochaine génération refera sans le savoir. Un identifiant inconnu fait",
    "rejeter le lot — prends-les dans les listes ci-dessus.",
    "",
    `Espacement : jamais deux fois le même persona à moins de ${ECART_PERSONA} posts,`,
    `ni le même angle à moins de ${ECART_ANGLE}.`,
    "",
    diag.piliersEnRetard.length
      ? "Piliers sous leur part cible, à rattraper en priorité : " +
        diag.piliersEnRetard
          .map((x) => `${x.id} (${Math.round(x.observe * 100)} % vs ${Math.round(x.cible * 100)} % visés)`)
          .join(", ")
      : "Le mélange des piliers est conforme à la cible.",
    "",
    diag.interdits.personas.length || diag.interdits.angles.length
      ? "TROP RÉCENTS, ne pas reprendre maintenant : " +
        [...diag.interdits.personas, ...diag.interdits.angles].join(", ")
      : "Aucune case n'est trop récente.",
    "",
    "Cases libres proposées, dans l'ordre — écarte-t'en si tu as mieux, mais",
    "dis pourquoi :",
    ...cases.map(
      (c, i) =>
        `  ${i + 1}. ${libellePilier(c.pilier)} · ${libellePersona(c.persona)} · ${libelleAngle(c.angle)}` +
        `   → "pilier":"${c.pilier}"${c.persona ? `, "persona":"${c.persona}"` : ""}, "angle":"${c.angle}"`
    ),
    "",
    digest.length
      ? `Déjà écrit (${digest.length} posts) — ni ces accroches, ni ces cases :`
      : "Aucun post existant : c'est le premier mois.",
    ...digest,
  ].join("\n");
};

const ReseauxTab: React.FC = () => {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [rows, setRows] = useState<SocialPost[]>([]);
  const [ready, setReady] = useState(false);
  const [channel, setChannel] = useState<PostChannel | "all">("all");
  /**
   * Le calendrier montre la répartition ; il est mauvais pour traiter douze
   * brouillons à la suite, éparpillés dans douze cases. La liste est faite
   * pour le travail, le calendrier pour le coup d'œil — d'où la bascule.
   */
  const [vue, setVue] = useState<"calendrier" | "liste">("calendrier");
  /**
   * « à-traiter » n'est pas un statut mais une question : qu'est-ce qui
   * m'empêche de programmer ? C'est la seule que Ralph se pose vraiment.
   */
  const [filtre, setFiltre] = useState<"tous" | "a-traiter" | PostStatus>("tous");
  const [openId, setOpenId] = useState<string | null>(null);
  const [edit, setEdit] = useState<{ id: string; caption: string; hashtags: string; visual: string; imageUrl: string; date: string } | null>(null);
  // Le sélecteur s'ouvre pour un post donné : la médiathèque n'est chargée
  // qu'à ce moment-là, jamais à l'affichage du calendrier.
  const [picker, setPicker] = useState<boolean>(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  /**
   * Posts soumis à vérification avant de passer « prêt ».
   *
   * Passer un post en « prêt » ouvre la porte de la publication automatique :
   * plus personne ne le relira avant qu'il ne soit dans le feed. Le clic
   * n'écrit donc plus directement — il ouvre cet écran.
   */
  const [aVerifier, setAVerifier] = useState<SocialPost[] | null>(null);
  /**
   * Posé par l'import, consommé une fois que l'abonnement Firestore a livré
   * les nouveaux posts. L'import ne peut pas rapatrier lui-même : il écrit,
   * et les documents ne reviennent qu'au tour suivant.
   */
  const [rapatriementDemande, setRapatriementDemande] = useState(false);
  /** Post en cours de déplacement, et jour survolé. */
  const [glisse, setGlisse] = useState<{ id: string; depuis: string } | null>(null);
  const [survol, setSurvol] = useState<string | null>(null);

  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (flashTimer.current) clearTimeout(flashTimer.current); }, []);
  const say = useCallback((kind: "ok" | "err", text: string) => {
    setFlash({ kind, text });
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 5000);
  }, []);

  useEffect(() => {
    const unsub = subscribeToPosts(
      (r) => { setRows(r); setReady(true); },
      (e) => { say("err", String(e)); setReady(true); }
    );
    return () => unsub();
  }, [say]);

  const cells = useMemo(() => monthGrid(year, month), [year, month]);

  const retenu = useCallback(
    (p: SocialPost) => {
      if (channel !== "all" && p.channel !== channel) return false;
      if (filtre === "tous") return true;
      // À traiter : tout ce qui demande une main humaine — un brouillon, ou
      // un envoi qui a échoué. Un post prêt ou publié n'attend personne.
      if (filtre === "a-traiter") return p.status === "draft" || !!p.publishError;
      return p.status === filtre;
    },
    [channel, filtre]
  );

  const byDate = useMemo(() => {
    const m = new Map<string, SocialPost[]>();
    for (const p of rows) {
      if (!retenu(p)) continue;
      const list = m.get(p.date) || [];
      list.push(p);
      m.set(p.date, list);
    }
    return m;
  }, [rows, retenu]);

  const monthPosts = useMemo(
    () => cells.filter(Boolean).flatMap((d) => byDate.get(d as string) || []),
    [cells, byDate]
  );

  const jourDuJour = useMemo(() => new Date().toISOString().slice(0, 10), []);

  /**
   * Ce que la liste affiche.
   *
   * « À traiter » sort du mois courant, volontairement : c'est une file de
   * travail, pas une vue de calendrier. Un échec de la semaine dernière
   * compterait dans le badge et n'apparaîtrait nulle part si on restait sur
   * le mois affiché — le compteur dirait « 1 » et l'écran serait vide.
   */
  const listeDuMois = useMemo(() => {
    const base = filtre === "a-traiter" ? rows.filter(retenu) : monthPosts;
    return [...base].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  }, [filtre, rows, retenu, monthPosts]);

  /**
   * Combien de posts demandent une main, tous mois confondus.
   *
   * Sur le mois courant seulement, un échec du mois dernier resterait
   * invisible — et un post en échec ne se répare pas tout seul.
   */
  const aTraiter = useMemo(
    () => rows.filter((p) => p.status === "draft" || !!p.publishError).length,
    [rows]
  );

  /** Les brouillons du mois affiché, dans l'ordre du calendrier. */
  const brouillonsDuMois = useMemo(
    () => monthPosts.filter((p) => p.status === "draft"),
    [monthPosts]
  );

  /**
   * Bascule en « prêt » les posts validés à l'écran de vérification.
   *
   * L'écriture est séquentielle et tolère l'échec unitaire : si un post
   * échoue, les autres passent quand même, et le compte rendu dit lesquels.
   * Tout annuler sur une erreur réseau ferait perdre une relecture entière.
   */
  /**
   * Envoie un post à Blotato, qui le publiera à la date prévue (10h Paris).
   * La clé Blotato reste côté serveur : on présente notre jeton Firebase,
   * la route vérifie qu'il appartient à un admin.
   */
  const envoyerABlotato = async (post: SocialPost): Promise<string> => {
    const user = auth?.currentUser;
    if (!user) throw new Error("Session expirée — reconnecte-toi.");
    const token = await user.getIdToken();
    const r = await fetch("/api/social/schedule", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: post.id }),
    });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) {
      const motifs: Record<string, string> = {
        not_configured: "Blotato n'est pas configuré sur le serveur (clé API ou compte de service).",
        visuel_manquant: "Pas de visuel attaché.",
        deja_publie: "Déjà publié.",
        blotato_accounts: "Blotato ne répond pas sur la liste des comptes.",
        blotato_publish: "Blotato a refusé le post.",
      };
      const err = String(body.error || r.status);
      throw new Error(`${motifs[err] || err}${body.detail ? ` — ${body.detail}` : ""}`);
    }
    return String(body.scheduledFor || "");
  };

  const programmer = async (posts: SocialPost[]) => {
    setBusy(true);
    let faits = 0;
    const echecs: string[] = [];
    for (const post of posts) {
      try {
        await updatePost(post.id!, { status: "ready", publishError: null, publishAttempts: 0 });
        await envoyerABlotato(post);
        faits++;
      } catch (e) {
        echecs.push(`${post.date} · ${CHANNEL_META[post.channel].label} : ${(e as Error).message}`);
      }
    }
    setBusy(false);
    setAVerifier(null);
    if (echecs.length) say("err", `${faits} programmé(s) chez Blotato, ${echecs.length} en échec — ${echecs[0]}`);
    else say("ok", faits === 1 ? "Post programmé chez Blotato." : `${faits} posts programmés chez Blotato.`);
  };

  /** Un post déjà programmé mais modifié depuis : on le renvoie tel quel. */
  const renvoyer = async (post: SocialPost) => {
    setBusy(true);
    try {
      const quand = await envoyerABlotato(post);
      say("ok", `Renvoyé à Blotato pour le ${quand.slice(0, 10)} à ${quand.slice(11, 16)}.`);
    } catch (e) {
      say("err", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const shift = (delta: number) => {
    const d = new Date(Date.UTC(year, month + delta, 1));
    setYear(d.getUTCFullYear());
    setMonth(d.getUTCMonth());
    setOpenId(null);
  };

  /**
   * Recopie une image externe dans la médiathèque et renvoie son adresse
   * stable.
   *
   * Ce n'est pas du confort : les URL rendues par un générateur d'images
   * expirent. Un post programmé dans trois semaines partirait avec un lien
   * mort, et l'échec se produirait à la publication — loin de l'import, sans
   * rapport visible avec lui.
   *
   * La copie passe par le serveur, qui seul détient la clé du compte de
   * service. On présente le jeton Firebase de la session ouverte : aucun
   * secret partagé n'est nécessaire.
   */
  const rapatrier = async (url: string, nom: string): Promise<string> => {
    const user = auth?.currentUser;
    if (!user) throw new Error("Session expirée — reconnecte-toi.");
    const token = await user.getIdToken();
    const r = await fetch("/api/social/media", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ url, nom, dossier: "reseaux" }),
    });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(String(body.detail || body.error || r.status));
    return String(body.url);
  };

  /** Une image déjà dans notre Storage n'a rien à y être recopiée. */
  const dejaChezNous = (url: string) => url.includes("firebasestorage.googleapis.com");

  /**
   * Rapatrie les visuels des posts importés, puis réécrit leurs adresses.
   *
   * Un échec unitaire ne fait pas échouer l'import : le post garde son URL
   * d'origine, qui marchera un temps, et le compte rendu dit combien sont
   * restés dehors. Tout annuler ferait perdre des textes valides pour une
   * image.
   */
  const rapatrierVisuels = async (posts: SocialPost[]) => {
    let copies = 0;
    let echecs = 0;
    for (const post of posts) {
      const patch: { imageUrl?: string; imagePropositions?: string[] } = {};

      if (post.imageUrl && !dejaChezNous(post.imageUrl)) {
        try {
          patch.imageUrl = await rapatrier(post.imageUrl, `${post.externalId || post.id}.jpg`);
          copies++;
        } catch { echecs++; }
      }

      if (post.imagePropositions?.length) {
        const rapatriees: string[] = [];
        for (const [i, u] of post.imagePropositions.entries()) {
          if (dejaChezNous(u)) { rapatriees.push(u); continue; }
          try {
            rapatriees.push(await rapatrier(u, `${post.externalId || post.id}-${i + 1}.jpg`));
            copies++;
          } catch { rapatriees.push(u); echecs++; }
        }
        if (rapatriees.join("\n") !== post.imagePropositions.join("\n")) {
          patch.imagePropositions = rapatriees;
          // Le visuel retenu doit suivre sa proposition, sinon il pointerait
          // encore vers l'URL expirable pendant que la vignette, elle, est à
          // jour — et personne ne verrait la différence avant la publication.
          const i = post.imagePropositions.indexOf(post.imageUrl ?? "");
          if (i >= 0) patch.imageUrl = rapatriees[i];
        }
      }

      if (Object.keys(patch).length) await updatePost(post.id!, patch);
    }
    return { copies, echecs };
  };

  /** Les posts dont au moins un visuel vit encore hors de notre médiathèque. */
  const visuelsDehors = useMemo(
    () =>
      rows.filter(
        (p) =>
          (p.imageUrl && !p.imageUrl.includes("firebasestorage.googleapis.com")) ||
          p.imagePropositions?.some((u) => !u.includes("firebasestorage.googleapis.com"))
      ),
    [rows]
  );

  const lancerRapatriement = useCallback(
    async (posts: SocialPost[]) => {
      if (!posts.length) return;
      setBusy(true);
      try {
        const { copies, echecs } = await rapatrierVisuels(posts);
        if (copies || echecs) {
          say(
            echecs && !copies ? "err" : "ok",
            `${copies} visuel(s) rapatrié(s) dans la médiathèque` +
              (echecs ? ` · ${echecs} resté(s) dehors` : "")
          );
        }
      } catch (e) {
        say("err", (e as Error).message);
      } finally {
        setBusy(false);
      }
    },
    // rapatrierVisuels ne dépend que de fonctions stables du module.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [say]
  );

  // L'import a écrit ; les posts arrivent au tour suivant. On rapatrie dès
  // qu'ils sont là, une seule fois.
  useEffect(() => {
    if (!rapatriementDemande || busy || !visuelsDehors.length) return;
    setRapatriementDemande(false);
    void lancerRapatriement(visuelsDehors);
  }, [rapatriementDemande, busy, visuelsDehors, lancerRapatriement]);

  /**
   * Déplace un post sur une autre date.
   *
   * Décaler d'un jour demandait jusqu'ici d'ouvrir le post, passer en
   * édition, changer la date, enregistrer — quatre gestes pour ce que la
   * souris fait en un.
   *
   * Un post déjà publié ne bouge pas : sa date dit quand il est parti, la
   * changer réécrirait l'histoire. Un envoi en cours non plus — la file le
   * tient.
   */
  const deplacer = async (id: string, vers: string) => {
    const post = rows.find((r) => r.id === id);
    if (!post || post.date === vers) return;
    if (post.status === "published" || post.status === "publishing") {
      say("err", `Impossible : ce post est ${STATUS_META[post.status].label.toLowerCase()}.`);
      return;
    }
    try {
      await updatePost(id, { date: vers });
      // Un post « prêt » déplacé reste prêt : c'est bien ce qu'on veut, il
      // partira à la nouvelle date. On le dit, parce que c'est une
      // publication qu'on vient de reprogrammer d'un geste.
      say("ok", post.status === "ready" ? `Reprogrammé au ${vers}.` : `Déplacé au ${vers}.`);
    } catch (e) {
      say("err", (e as Error).message);
    }
  };

  const runImport = async () => {
    setBusy(true);
    try {
      const { imported, updated, skipped, errors } = await importPostsFromJson(importText);
      const parts = [`${imported} post(s) importé(s)`];
      if (updated) parts.push(`${updated} complété(s)`);
      if (skipped) parts.push(`${skipped} inchangé(s)`);
      if (errors.length) parts.push(`${errors.length} rejeté(s)`);
      say(errors.length && !imported ? "err" : "ok", parts.join(" · "));
      if (errors.length) console.warn("[import réseaux]", errors);
      if (imported || updated) {
        setImportText("");
        setImportOpen(false);
        setRapatriementDemande(true);
      }
    } catch (e) {
      say("err", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async () => {
    if (!edit) return;
    setBusy(true);
    try {
      await updatePostText(edit.id, edit);
      setEdit(null);
    } catch (e) {
      say("err", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const duplicate = async (p: SocialPost) => {
    try {
      // Champs optionnels recopiés seulement s'ils portent une valeur :
      // un `hashtags: undefined` ferait lever addDoc, le SDK n'étant pas
      // initialisé avec ignoreUndefinedProperties.
      const copy: Omit<SocialPost, "id"> = {
        date: p.date, channel: p.channel, type: p.type, caption: p.caption, status: "draft",
      };
      if (p.hashtags) copy.hashtags = p.hashtags;
      if (p.visual) copy.visual = p.visual;
      if (p.imageUrl) copy.imageUrl = p.imageUrl;
      await addPost(copy);
    } catch (e) {
      say("err", (e as Error).message);
    }
  };

  const copyText = async (p: SocialPost) => {
    try {
      await navigator.clipboard.writeText([p.caption, p.hashtags].filter(Boolean).join("\n\n"));
      say("ok", "Texte copié.");
    } catch {
      say("err", "Copie refusée par le navigateur.");
    }
  };

  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(skillBrief(year, month, rows));
      say("ok", "Brief copié — colle-le dans Claude Code.");
    } catch {
      say("err", "Copie refusée par le navigateur.");
    }
  };

  if (!ready) {
    return (
      <div className="flex items-center gap-2 text-white/50 text-sm py-10">
        <RefreshCw size={16} className="animate-spin" /> Chargement du calendrier…
      </div>
    );
  }

  const counts = {
    total: monthPosts.length,
    ready: monthPosts.filter((p) => p.status === "ready").length,
    published: monthPosts.filter((p) => p.status === "published").length,
    enCours: monthPosts.filter((p) => p.status === "publishing").length,
    enErreur: monthPosts.filter((p) => !!p.publishError).length,
  };

  return (
    <div className={`space-y-5 transition-[padding] ${openId ? "xl:pr-[424px]" : ""}`}>
      {/* Barre de mois */}
      <div className={`${card} p-4 flex flex-wrap items-center gap-3`}>
        <div className="flex items-center gap-1">
          <button onClick={() => shift(-1)} className={`${btnGhost} !px-2`} aria-label="Mois précédent">
            <ChevronLeft size={14} />
          </button>
          <p className="font-black text-slate-900 text-sm min-w-[150px] text-center capitalize">
            {MONTH_NAMES[month]} {year}
          </p>
          <button onClick={() => shift(1)} className={`${btnGhost} !px-2`} aria-label="Mois suivant">
            <ChevronRight size={14} />
          </button>
        </div>

        <span className="text-[11px] text-slate-500">
          {counts.total} post{counts.total > 1 ? "s" : ""}
          {counts.ready > 0 && ` · ${counts.ready} prêt${counts.ready > 1 ? "s" : ""}`}
          {counts.published > 0 && ` · ${counts.published} publié${counts.published > 1 ? "s" : ""}`}
          {counts.enCours > 0 && ` · ${counts.enCours} en cours d'envoi`}
        </span>

        {counts.enErreur > 0 && (
          <span
            className="text-[11px] font-bold flex items-center gap-1"
            style={{ color: "#f87171" }}
          >
            <AlertTriangle size={12} />
            {counts.enErreur} en échec
          </span>
        )}

        {visuelsDehors.length > 0 && (
          <button
            onClick={() => lancerRapatriement(visuelsDehors)}
            disabled={busy}
            className={btnGhost}
            title="Copier les visuels externes dans la médiathèque, pour qu'ils ne périment pas"
          >
            <span className="flex items-center gap-1">
              {busy ? <Loader2 size={11} className="animate-spin" /> : <ImagePlus size={11} />}
              Rapatrier {visuelsDehors.length} visuel{visuelsDehors.length > 1 ? "s" : ""}
            </span>
          </button>
        )}

        {brouillonsDuMois.length > 0 && (
          <button
            onClick={() => setAVerifier(brouillonsDuMois)}
            className={btnPrimary}
            title="Vérifier puis programmer tous les brouillons du mois"
          >
            <span className="flex items-center gap-1">
              <ShieldCheck size={12} /> Vérifier {brouillonsDuMois.length} brouillon
              {brouillonsDuMois.length > 1 ? "s" : ""}
            </span>
          </button>
        )}

        <select className={select} value={channel} onChange={(e) => setChannel(e.target.value as PostChannel | "all")}>
          <option value="all">Tous les réseaux</option>
          {CHANNELS.map((c) => <option key={c} value={c}>{CHANNEL_META[c].label}</option>)}
        </select>

        {/* Calendrier pour voir, liste pour faire. */}
        <div className="flex rounded-xl border border-slate-200 overflow-hidden">
          {([
            ["calendrier", CalendarDays, "Calendrier"],
            ["liste", List, "Liste"],
          ] as const).map(([v, Icone, label]) => (
            <button
              key={v}
              onClick={() => setVue(v)}
              aria-pressed={vue === v}
              className={`px-2.5 py-1.5 text-[11px] font-bold transition-colors ${focusRing} ${
                vue === v ? "bg-[var(--color-primary)] text-[var(--color-accent)]" : "bg-white text-slate-500 hover:bg-slate-50"
              }`}
              title={label}
            >
              <span className="flex items-center gap-1"><Icone size={12} /> {label}</span>
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={copyBrief} className={btnGhost} title="Copier le brief du skill robi-social-media">
            <span className="flex items-center gap-1.5"><Sparkles size={12} /> Brief du mois</span>
          </button>
          <button onClick={() => setImportOpen((v) => !v)} className={btnPrimary}>
            <span className="flex items-center gap-1.5"><FileJson size={12} /> Importer du JSON</span>
          </button>
        </div>
      </div>

      {/* Filtres de statut. Séparés de la barre de mois : ce sont deux gestes
          différents — l'un navigue dans le temps, l'autre restreint ce qu'on
          regarde. Mélangés, on cherche le bon bouton à chaque fois. */}
      <div className="flex flex-wrap items-center gap-1.5 -mt-2">
        {([
          ["tous", `Tous (${monthPosts.length})`],
          ["a-traiter", aTraiter ? `À traiter (${aTraiter})` : "À traiter"],
          ["draft", "Brouillons"],
          ["ready", "Prêts"],
          ["published", "Publiés"],
        ] as const).map(([f, label]) => {
          const actif = filtre === f;
          const urgent = f === "a-traiter" && aTraiter > 0;
          return (
            <button
              key={f}
              onClick={() => {
                setFiltre(f);
                // Le calendrier est borné au mois affiché ; « à traiter » ne
                // l'est pas. Rester en calendrier cacherait ce qu'on vient
                // de demander à voir.
                if (f === "a-traiter") setVue("liste");
              }}
              className={`${btnPill} ${
                actif
                  ? "bg-[var(--color-primary)] text-[var(--color-accent)]"
                  : urgent
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-slate-100 text-slate-600"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Import */}
      {importOpen && (
        <div className={`${card} p-5 space-y-3`}>
          <p className={sectionTitle}>Import JSON</p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Colle la sortie du skill <code className="text-[var(--admin-ink)]">robi-social-media</code>. Les posts déjà
            présents (même date, même réseau, même début de texte) sont ignorés — relancer le skill
            sur un mois déjà importé ne duplique rien.
          </p>
          <textarea
            className={`${input} min-h-[160px] font-mono text-[11px] leading-relaxed resize-y`}
            placeholder='[{"date":"2026-08-03","channel":"instagram","type":"bold","caption":"…"}]'
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={runImport} disabled={busy || !importText.trim()} className={btnPrimary}>
              <span className="flex items-center gap-1"><Check size={11} /> Importer</span>
            </button>
            <button onClick={() => { setImportOpen(false); setImportText(""); }} className={btnGhost}>
              <span className="flex items-center gap-1"><X size={11} /> Annuler</span>
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      {vue === "liste" && (
        <div className={`${card} p-3`}>
          {filtre === "a-traiter" && (
            <p className="text-[11px] text-slate-500 px-1 pb-2">
              Tous mois confondus — un échec ne se répare pas en changeant de page.
            </p>
          )}
          {listeDuMois.length === 0 ? (
            <p className="text-[13px] text-slate-500 py-8 text-center">
              Aucun post ne correspond. Change de filtre, ou importe un lot.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {listeDuMois.map((p) => (
                <LignePost
                  key={p.id}
                  post={p}
                  ouvert={openId === p.id}
                  onOuvrir={() => setOpenId(openId === p.id ? null : p.id!)}
                  onProgrammer={() => setAVerifier([p])}
                />
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Calendrier */}
      <div className={`${card} p-3`} hidden={vue !== "calendrier"}>
        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
            <p key={d} className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center py-1">{d}</p>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((date, i) => {
            if (!date) return <div key={`x${i}`} className="min-h-[92px] rounded-xl bg-slate-50" />;
            const posts = byDate.get(date) || [];
            const isToday = date === new Date().toISOString().slice(0, 10);
            return (
              <div
                key={date}
                onDragOver={(e) => {
                  // Sans preventDefault le navigateur refuse le dépôt, en
                  // silence : la cellule paraît inerte sans qu'on sache pourquoi.
                  if (!glisse) return;
                  e.preventDefault();
                  if (survol !== date) setSurvol(date);
                }}
                onDragLeave={() => setSurvol((d) => (d === date ? null : d))}
                onDrop={(e) => {
                  e.preventDefault();
                  setSurvol(null);
                  const id = e.dataTransfer.getData("text/plain") || glisse?.id;
                  if (id) void deplacer(id, date);
                  setGlisse(null);
                }}
                className={`min-h-[92px] rounded-xl border p-1.5 transition-colors ${
                  survol === date && glisse?.depuis !== date
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/[0.14] ring-2 ring-[var(--color-accent)]/40"
                    : isToday
                      ? "border-[var(--color-accent)]/40 bg-[var(--color-accent)]/[0.06] shadow-[inset_0_1px_0_rgba(190,242,33,0.18)]"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                }`}
              >
                <p className={`text-[10px] font-bold mb-1 px-0.5 ${isToday ? "text-[var(--admin-ink)]" : "text-slate-400"}`}>
                  {date.slice(8)}
                </p>
                <div className="space-y-1">
                  {posts.map((p) => {
                    // Le liseré à gauche porte le statut : c'est la seule
                    // information qu'on cherche en balayant un mois du regard,
                    // et elle manquait complètement. Le fond garde le type.
                    const liseré = p.publishError
                      ? "#ef4444"
                      : p.status === "draft"
                        ? "transparent"
                        : STATUS_META[p.status].color;
                    return (
                      <button
                        key={p.id}
                        draggable={p.status !== "published" && p.status !== "publishing"}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", p.id!);
                          e.dataTransfer.effectAllowed = "move";
                          setGlisse({ id: p.id!, depuis: p.date });
                        }}
                        onDragEnd={() => { setGlisse(null); setSurvol(null); }}
                        onClick={() => setOpenId(openId === p.id ? null : p.id!)}
                        className={`w-full text-left rounded-lg pl-1 pr-1.5 py-1 transition-all hover:bg-slate-50 border-l-[3px] ${focusRing} ${
                          glisse?.id === p.id ? "opacity-40" : ""
                        } ${p.status !== "published" && p.status !== "publishing" ? "cursor-grab active:cursor-grabbing" : ""}`}
                        style={{ backgroundColor: `${TYPE_META[p.type].color}1a`, borderLeftColor: liseré }}
                        title={`${STATUS_META[p.status].label}${p.publishError ? " · dernier envoi en échec" : ""}\n\n${p.caption}`}
                      >
                        <span className="flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: CHANNEL_META[p.channel].color }} />
                          {/* Un visuel manquant bloque la programmation : le
                              signaler ici évite de le découvrir à la
                              vérification, une fois le mois entier relu. */}
                          {!p.imageUrl && <ImagePlus size={8} className="flex-shrink-0 text-amber-500" />}
                          <span className="text-[9px] font-bold truncate text-slate-700">{p.caption}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Détail */}
      {openId && (() => {
        const p = rows.find((r) => r.id === openId);
        if (!p) return null;
        // Capture en const : `edit` est un state, TypeScript perd sa narration
        // a l'interieur des callbacks onChange ci-dessous.
        const ed = edit && edit.id === p.id ? edit : null;
        return (
          /* Panneau latéral sur grand écran, bloc en dessous sur petit.
             Avant, le détail poussait tout vers le bas : sur un mois plein il
             fallait scroller pour le lire, et on perdait de vue la grille
             qu'on était en train de relire. `sticky` le garde à hauteur
             d'œil pendant qu'on passe d'un post à l'autre. */
          <div
            className={`${card} p-5 space-y-3 xl:fixed xl:right-6 xl:top-24 xl:bottom-6 xl:w-[400px] xl:overflow-y-auto xl:z-40 xl:shadow-2xl`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                  style={{ backgroundColor: `${CHANNEL_META[p.channel].color}2a`, color: CHANNEL_META[p.channel].color }}>
                  {CHANNEL_META[p.channel].label}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                  style={{ backgroundColor: `${TYPE_META[p.type].color}2a`, color: TYPE_META[p.type].color }}>
                  {TYPE_META[p.type].label}
                </span>
                <span className="text-[11px] text-slate-500">{p.date}</span>
              </div>
              <button onClick={() => setOpenId(null)} className={`${btnGhost} !px-2`} aria-label="Fermer">
                <X size={12} />
              </button>
            </div>

            {ed ? (
              <div className="space-y-2">
                <textarea
                  className={`${input} min-h-[110px] resize-y leading-relaxed`}
                  value={ed.caption}
                  autoFocus
                  onChange={(e) => setEdit({ ...ed, caption: e.target.value })}
                  onKeyDown={(e) => { if (e.key === "Escape") setEdit(null); }}
                />
                <input
                  className={input}
                  placeholder="#hashtags"
                  value={ed.hashtags}
                  onChange={(e) => setEdit({ ...ed, hashtags: e.target.value })}
                />
                <input
                  className={input}
                  placeholder="Consigne visuelle (sert au prompt Higgsfield)"
                  value={ed.visual}
                  onChange={(e) => setEdit({ ...ed, visual: e.target.value })}
                />
                {/* Le visuel attaché. Sans ce bloc, imageUrl ne pouvait être
                    rempli par personne : le champ existait, s'affichait, mais
                    aucun écran ne permettait de le poser. Les images déposées
                    dans Fichiers restaient donc inutilisables pour un post. */}
                {/* La date : seul champ qu'aucun écran ne permettait de
                    changer. Décaler un post demandait de le supprimer et de
                    le refaire — en lui faisant perdre son identifiant. */}
                <label className="flex items-center gap-2 text-[11px] text-slate-500">
                  Publier le
                  <input
                    type="date"
                    className={`${select} !py-1`}
                    value={ed.date}
                    onChange={(e) => setEdit({ ...ed, date: e.target.value })}
                  />
                </label>

                {/* Les propositions de visuels. Recomposer une même photo dans
                    un autre habillage ne coûte rien : le choix est presque
                    gratuit à produire, il manquait juste un geste pour
                    retenir l'une d'elles. */}
                {!!p.imagePropositions?.length && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {p.imagePropositions.length} proposition{p.imagePropositions.length > 1 ? "s" : ""}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {p.imagePropositions.map((url) => {
                        const retenu = ed.imageUrl === url;
                        return (
                          <button
                            key={url}
                            onClick={() => setEdit({ ...ed, imageUrl: retenu ? "" : url })}
                            aria-pressed={retenu}
                            className={`relative h-24 w-[74px] rounded-lg overflow-hidden border-2 transition-all ${focusRing} ${
                              retenu ? "border-[var(--color-accent)] scale-[1.03]" : "border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100"
                            }`}
                            title={retenu ? "Retenu — clique pour retirer" : "Retenir ce visuel"}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt="" className="h-full w-full object-cover" />
                            {retenu && (
                              <span className="absolute inset-x-0 bottom-0 bg-[var(--color-accent)] text-black text-[9px] font-black py-0.5 text-center">
                                RETENU
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {ed.imageUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ed.imageUrl} alt="" className="h-14 w-14 rounded-lg object-cover border border-slate-200" />
                      <button onClick={() => setPicker(true)} className={btnGhost}>Changer</button>
                      <button onClick={() => setEdit({ ...ed, imageUrl: "" })} className={btnGhost}>Retirer</button>
                    </>
                  ) : (
                    <button onClick={() => setPicker(true)} className={btnGhost}>
                      <span className="flex items-center gap-1"><ImagePlus size={11} /> Choisir dans la médiathèque</span>
                    </button>
                  )}
                </div>

                <div className="flex gap-1.5">
                  <button onClick={saveEdit} disabled={busy || !ed.caption.trim()} className={btnPrimary}>
                    <span className="flex items-center gap-1"><Check size={11} /> Enregistrer</span>
                  </button>
                  <button onClick={() => setEdit(null)} className={btnGhost}>
                    <span className="flex items-center gap-1"><X size={11} /> Annuler</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-[13px] text-slate-700 whitespace-pre-wrap leading-relaxed">{p.caption}</p>
                {p.hashtags && <p className="text-[12px] text-[var(--admin-ink)]/70">{p.hashtags}</p>}
                {p.visual && (
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    <span className="uppercase tracking-widest text-slate-400">Visuel · </span>{p.visual}
                  </p>
                )}
                {p.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt="" className="rounded-xl max-h-64 border border-slate-200" />
                )}
                <SuiviPublication post={p} onRenvoyer={renvoyer} busy={busy} />
              </>
            )}

            <div className="flex flex-wrap gap-1.5 pt-1">
              {/* « Envoi en cours » n'est pas proposé : seule la file le pose. */}
              {STATUTS_MANUELS.map((s) => (
                <button
                  key={s}
                  disabled={p.status === "publishing"}
                  onClick={() =>
                    // « Prêt » passe par l'écran de vérification : c'est le
                    // dernier moment où quelqu'un regarde avant le feed.
                    s === "ready" ? setAVerifier([p]) : updatePost(p.id!, { status: s })
                  }
                  className={`${btnPill} ${p.status === s ? "text-black" : "bg-slate-100 text-slate-600"}`}
                  style={p.status === s ? { backgroundColor: STATUS_META[s].color } : undefined}
                  title={p.status === "publishing" ? "Envoi en cours — impossible de changer le statut" : undefined}
                >
                  {s === "ready" ? "Programmer…" : STATUS_META[s].label}
                </button>
              ))}
              {!ed && (
                <button
                  onClick={() => setEdit({ id: p.id!, caption: p.caption, hashtags: p.hashtags || "", visual: p.visual || "", imageUrl: p.imageUrl || "", date: p.date })}
                  className={btnGhost}
                >
                  <span className="flex items-center gap-1"><Pencil size={11} /> Éditer</span>
                </button>
              )}
              <button onClick={() => copyText(p)} className={btnGhost}>
                <span className="flex items-center gap-1"><ClipboardCopy size={11} /> Copier</span>
              </button>
              <button onClick={() => duplicate(p)} className={btnGhost}>
                <span className="flex items-center gap-1"><Copy size={11} /> Dupliquer</span>
              </button>
              <button
                onClick={async () => {
                  if (!confirm("Supprimer ce post ?")) return;
                  await deletePost(p.id!);
                  setOpenId(null);
                }}
                className={`${btnPill} bg-red-500/15 text-red-600 hover:bg-red-500/25`}
              >
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        );
      })()}

      {/* Légende des types */}
      <div className="flex flex-wrap items-center gap-3 px-1">
        {TYPES.map((t) => (
          <span key={t} className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: TYPE_META[t].color }} />
            {TYPE_META[t].label}
          </span>
        ))}
      </div>

      {flash && (
        <div
          className="fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-2xl text-[12px] font-bold z-50 flex items-center gap-2"
          style={{ backgroundColor: flash.kind === "ok" ? ACCENT : "#f87171", color: flash.kind === "ok" ? "#000" : "#fff" }}
        >
          {flash.kind === "ok" ? <Check size={13} /> : <AlertTriangle size={13} />}
          {flash.text}
        </div>
      )}
      {aVerifier && (
        <EcranVerification
          posts={aVerifier}
          voisins={rows}
          jourDuJour={jourDuJour}
          busy={busy}
          onClose={() => setAVerifier(null)}
          onConfirm={programmer}
        />
      )}
      {picker && edit && (
        <Mediatheque
          onClose={() => setPicker(false)}
          onPick={(url) => { setEdit({ ...edit, imageUrl: url }); setPicker(false); }}
        />
      )}

    </div>
  );
};

/**
 * Une ligne de la vue liste.
 *
 * Elle répond d'un coup d'œil aux trois questions qu'on se pose vraiment :
 * qu'est-ce que ça dit, est-ce que le visuel est là, est-ce que ça peut
 * partir. Le calendrier, lui, ne montrait qu'un début de phrase tronqué à
 * neuf pixels — tous les posts s'y ressemblaient.
 */
const LignePost = ({
  post, ouvert, onOuvrir, onProgrammer,
}: {
  post: SocialPost;
  ouvert: boolean;
  onOuvrir: () => void;
  onProgrammer: () => void;
}) => {
  const hook = post.caption.split("\n").find((l) => l.trim()) ?? post.caption;
  const bloquant = !post.imageUrl;
  const propositions = post.imagePropositions?.length ?? 0;

  return (
    <li className={`flex gap-3 py-2.5 px-1 ${ouvert ? "bg-slate-50 rounded-xl" : ""}`}>
      <button
        onClick={onOuvrir}
        className={`h-14 w-14 rounded-lg flex-none overflow-hidden border ${focusRing} ${
          bloquant ? "border-dashed border-amber-300 bg-amber-50" : "border-slate-200"
        }`}
        title={bloquant ? "Aucun visuel attaché" : "Ouvrir"}
      >
        {post.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="grid h-full w-full place-items-center">
            <ImagePlus size={15} className="text-amber-500" />
          </span>
        )}
      </button>

      <button onClick={onOuvrir} className={`min-w-0 flex-1 text-left ${focusRing} rounded-lg`}>
        <span className="flex flex-wrap items-center gap-1.5 mb-1">
          <span className="text-[11px] font-bold text-slate-400 tabular-nums">{post.date.slice(5)}</span>
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: CHANNEL_META[post.channel].color }}
            title={CHANNEL_META[post.channel].label}
          />
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: TYPE_META[post.type].color }}>
            {TYPE_META[post.type].label}
          </span>
          <PastilleStatut post={post} />
          {bloquant && (
            <span className="text-[10px] font-bold text-amber-700">
              {propositions ? `${propositions} visuel${propositions > 1 ? "s" : ""} à choisir` : "visuel manquant"}
            </span>
          )}
        </span>
        <span className="block text-[12.5px] text-slate-700 leading-snug line-clamp-2">{hook}</span>
      </button>

      {post.status === "draft" && (
        <button onClick={onProgrammer} className={`${btnGhost} self-center flex-none`} title="Vérifier puis programmer">
          <span className="flex items-center gap-1"><ShieldCheck size={11} /> Programmer</span>
        </button>
      )}
    </li>
  );
};

/** Le statut, lisible partout de la même façon. */
const PastilleStatut = ({ post }: { post: SocialPost }) => {
  // Un échec prime sur le statut : le post est « prêt », mais ce qui compte
  // c'est qu'il n'est pas parti.
  if (post.publishError) {
    return (
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 bg-red-50 text-red-600">
        <CircleAlert size={10} /> Échec
      </span>
    );
  }
  const m = STATUS_META[post.status];
  return (
    <span
      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
      style={{ backgroundColor: `${m.color}24`, color: post.status === "draft" ? "#64748B" : m.color }}
    >
      {m.label}
    </span>
  );
};

/**
 * Sélecteur de visuel, alimenté par la médiathèque de l'onglet Fichiers —
 * elle-même synchronisée depuis ~/Desktop/ROBI_PARTAGE.
 *
 * Les images sont listées à l'ouverture seulement : le calendrier affiche
 * souvent trente posts, et charger le bucket pour chacun serait payé à chaque
 * changement de mois pour un écran qu'on n'ouvre presque jamais.
 */
const Mediatheque = ({ onClose, onPick }: { onClose: () => void; onPick: (url: string) => void }) => {
  const [fichiers, setFichiers] = useState<SharedFile[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    listSharedFiles()
      .then((tous) => setFichiers(tous.filter(isImage)))
      .catch((e) => setErreur((e as Error).message));
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className={`${card} w-full max-w-3xl max-h-[80vh] overflow-auto p-5`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-4">
          <p className="text-xs font-black uppercase tracking-widest text-slate-900 flex-1">
            Choisir un visuel
          </p>
          <button onClick={onClose} className={btnGhost}>
            <span className="flex items-center gap-1"><X size={11} /> Fermer</span>
          </button>
        </div>

        {erreur && <p className="text-[13px]" style={{ color: "#f87171" }}>{erreur}</p>}

        {!fichiers && !erreur && (
          <p className="text-[13px] text-slate-500 flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" /> Lecture de la médiathèque…
          </p>
        )}

        {fichiers?.length === 0 && (
          <p className="text-[13px] text-slate-500">
            Aucune image dans la médiathèque. Dépose-les dans l&apos;onglet Fichiers, ou dans
            <code className="mx-1">~/Desktop/ROBI_PARTAGE</code> si la synchronisation est active.
          </p>
        )}

        {!!fichiers?.length && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {fichiers.map((f) => (
              <button
                key={f.path}
                onClick={() => onPick(f.url)}
                className={`rounded-xl overflow-hidden border border-slate-200 hover:opacity-80 transition-opacity ${focusRing}`}
                title={f.path}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.url} alt={f.name} className="w-full h-28 object-cover" />
                <span className="block text-[10px] text-slate-500 truncate px-1.5 py-1">{f.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Ce que la file a fait du post au dernier passage.
 *
 * Sans ça, un échec de publication est invisible : le post reste « prêt »,
 * l'admin l'affiche comme les autres, et on découvre des semaines plus tard
 * qu'il n'est jamais parti.
 */
const SuiviPublication = ({ post, onRenvoyer, busy }: { post: SocialPost; onRenvoyer?: (p: SocialPost) => void; busy?: boolean }) => {
  if (post.status !== "published" && post.scheduledVia === "blotato") {
    const quand = post.scheduledFor ? `${post.scheduledFor.slice(0, 10)} à ${post.scheduledFor.slice(11, 16)}` : post.date;
    // Modifié après l'envoi : ce que Blotato publiera n'est plus ce qu'on voit ici.
    const modifieDepuis = !!(post.updatedAt && post.scheduledAt && post.updatedAt.toDate().toISOString() > post.scheduledAt);
    return (
      <div className="text-[11px] space-y-1">
        <p className="flex items-center gap-1.5" style={{ color: "#10B981" }}>
          <Check size={12} /> Programmé chez Blotato — publication le {quand} (heure de Paris).
          {post.publishedUrl && (
            <a href={post.publishedUrl} target="_blank" rel="noreferrer noopener" className="underline">Voir chez Blotato</a>
          )}
        </p>
        {modifieDepuis && (
          <p style={{ color: "#fbbf24" }}>
            Modifié depuis l&apos;envoi : Blotato publiera l&apos;ancienne version tant que tu ne l&apos;as pas renvoyé.
          </p>
        )}
        {onRenvoyer && (
          <button onClick={() => onRenvoyer(post)} disabled={busy} className={`${btnGhost} mt-1`}>Renvoyer à Blotato</button>
        )}
        {post.publishError && <p style={{ color: "#f87171" }}>Dernier envoi en échec : {post.publishError}</p>}
      </div>
    );
  }
  if (post.status === "publishing") {
    return (
      <p className="text-[11px] flex items-center gap-1.5" style={{ color: "#fbbf24" }}>
        <Loader2 size={12} className="animate-spin" />
        Envoi en cours depuis {post.claimedAt ? new Date(post.claimedAt).toLocaleTimeString("fr-FR") : "peu"}.
        Le statut se débloque tout seul si l&apos;envoi ne répond plus.
      </p>
    );
  }

  return (
    <>
      {post.publishedUrl && (
        <a
          href={post.publishedUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="text-[11px] font-bold underline"
          style={{ color: "#10B981" }}
        >
          Voir le post publié
        </a>
      )}
      {post.publishError && (
        <p className="text-[11px] leading-relaxed" style={{ color: "#f87171" }}>
          <span className="font-bold">Dernier envoi en échec</span>
          {post.publishAttempts ? ` (${post.publishAttempts} essai${post.publishAttempts > 1 ? "s" : ""})` : ""} :{" "}
          {post.publishError}
        </p>
      )}
    </>
  );
};

/** Une ligne de l'écran de vérification : le post, et ce qui cloche. */
const LigneVerification = ({ post, verdict }: { post: SocialPost; verdict: Verdict }) => {
  const bloque = !estProgrammable(verdict);
  return (
    <li
      className="rounded-xl border p-3 flex gap-3"
      style={{ borderColor: bloque ? "#f8717155" : "#e2e8f0", backgroundColor: bloque ? "#f871710d" : undefined }}
    >
      {post.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0" />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
          <ImagePlus size={16} className="text-slate-400" />
        </div>
      )}

      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: CHANNEL_META[post.channel].color }}>
          {CHANNEL_META[post.channel].label} · {post.date} · {TYPE_META[post.type].label}
        </p>
        {/* Le texte en entier, pas un extrait : c'est ce qui part. */}
        <p className="text-[12px] text-slate-700 whitespace-pre-wrap leading-relaxed">{post.caption}</p>
        {post.hashtags && <p className="text-[11px] text-slate-400">{post.hashtags}</p>}

        {verdict.blocages.map((b) => (
          <p key={b} className="text-[11px] font-bold flex items-start gap-1" style={{ color: "#f87171" }}>
            <X size={12} className="mt-0.5 shrink-0" /> {b}
          </p>
        ))}
        {verdict.avertissements.map((a) => (
          <p key={a} className="text-[11px] flex items-start gap-1" style={{ color: "#b45309" }}>
            <AlertTriangle size={12} className="mt-0.5 shrink-0" /> {a}
          </p>
        ))}
      </div>
    </li>
  );
};

/**
 * Dernier écran avant la publication automatique.
 *
 * Il montre exactement ce qui partira — texte entier et visuel, pas un
 * résumé — parce qu'après validation plus personne ne regardera. Les posts
 * bloqués sont affichés mais exclus de l'envoi : les cacher laisserait croire
 * qu'ils sont programmés.
 */
const EcranVerification = ({
  posts, voisins, jourDuJour, busy, onClose, onConfirm,
}: {
  posts: SocialPost[];
  voisins: SocialPost[];
  jourDuJour: string;
  busy: boolean;
  onClose: () => void;
  onConfirm: (posts: SocialPost[]) => void;
}) => {
  const examens = useMemo(
    () => posts.map((post) => ({ post, verdict: verifierAvantProgrammation(post, voisins, jourDuJour) })),
    [posts, voisins, jourDuJour]
  );
  const partants = examens.filter((e) => estProgrammable(e.verdict)).map((e) => e.post);
  const bloques = examens.length - partants.length;
  const alertes = examens.filter((e) => estProgrammable(e.verdict) && e.verdict.avertissements.length).length;

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-6" onClick={onClose}>
      <div className={`${card} w-full max-w-2xl max-h-[85vh] flex flex-col p-5`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-xs font-black uppercase tracking-widest text-slate-900 flex-1">
            Vérifier avant programmation
          </p>
          <button onClick={onClose} className={btnGhost}>
            <span className="flex items-center gap-1"><X size={11} /> Annuler</span>
          </button>
        </div>
        <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
          Une fois programmé, le post part tout seul à sa date, sans nouvelle relecture.
          C&apos;est le dernier écran où tu peux encore le retenir.
        </p>

        <ul className="space-y-2 overflow-auto flex-1 -mx-1 px-1">
          {examens.map(({ post, verdict }) => (
            <LigneVerification key={post.id} post={post} verdict={verdict} />
          ))}
        </ul>

        <div className="pt-4 flex flex-wrap items-center gap-3 border-t border-slate-200 mt-3">
          <span className="text-[11px] text-slate-500 flex-1 min-w-[180px]">
            {partants.length} post{partants.length > 1 ? "s" : ""} prêt{partants.length > 1 ? "s" : ""} à programmer
            {bloques > 0 && ` · ${bloques} bloqué${bloques > 1 ? "s" : ""}, à corriger d'abord`}
            {alertes > 0 && ` · ${alertes} à relire`}
          </span>
          <button
            onClick={() => onConfirm(partants)}
            disabled={busy || partants.length === 0}
            className={btnPrimary}
          >
            <span className="flex items-center gap-1">
              {busy ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              Programmer {partants.length > 0 ? partants.length : ""}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReseauxTab;
