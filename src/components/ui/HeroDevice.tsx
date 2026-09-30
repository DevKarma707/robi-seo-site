"use client";

/**
 * Héro « téléphone 3D flottant » (30/09/2026, direction choisie par Ralph).
 *
 * Le téléphone est construit en CSS 3D (tranche titane par empilement de
 * couches, écran en retrait, Dynamic Island, boutons), flotte et pivote
 * lentement dans une lumière lime ; à la souris, il suit le pointeur.
 *
 * À l'écran, les fonctions de nos pubs HyperFrames (skill robi-pub-video) :
 * dashboard Robi (objectif du mois, jauge lime), feuille « Vous dites » qui
 * monte, document qui se remplit ligne par ligne (le total compte), puis le
 * document se plie dans une enveloppe qui PART DU TÉLÉPHONE (elle sort de
 * l'écran et vole dans la scène), pastille « Robi AI » avec anneau et reflet,
 * chip « Envoyée à … », notification iOS « Paiement reçu » qui tombe, jauge
 * qui monte. Chip Factur-X (FR) flottant à côté.
 *
 * L'interface est dessinée à 320 px de large puis mise à l'échelle (`--s`).
 */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { BadgeCheck, Bot, Calendar, Check, CheckSquare, ChevronDown, CreditCard, Download, Eye, FileCheck, FileText, Mail, Mic, Package, Search, Send, Settings, Signal, TrendingUp, Users, Wifi, X, Activity } from "lucide-react";
import { SALES_PAID, SALES_PENDING, SALES_SCALE, type HeroDeviceCopy } from "@/lib/i18n/heroDevice";
import styles from "./HeroDevice.module.css";

const STEPS = ["idle", "sheet", "typing", "reply", "open", "client", "service", "total", "created", "ask", "yes", "sending", "fly", "sent", "list", "opened", "tap", "detail", "pdf", "notif", "back", "clear"] as const;
/** Scénario « relances » : pas de document, trois factures impayées qui partent. */
const REMINDER_STEPS = ["idle", "sheet", "typing", "reply", "rows", "ask", "yes", "sending", "fly", "sent", "back", "clear"] as const;
type Step = (typeof STEPS)[number] | (typeof REMINDER_STEPS)[number];
/* Rythme posé : Ralph trouvait la première version « encore un peu rapide »
   (30/09) — tout est ralenti d'environ 40 %, sauf la dictée. */
const BASE_DURATIONS: Record<Step, number> = {
  idle: 1300, sheet: 750, typing: 0, reply: 1500, open: 1100, client: 780, service: 780, total: 1400,
  rows: 2600, created: 1200, ask: 1600, yes: 650, sending: 1050, fly: 1150, sent: 3500, list: 2600, opened: 3400, tap: 800, detail: 2400, pdf: 4400, notif: 3800, back: 2200, clear: 700,
};
const waveHeights = [8, 14, 23, 12, 30, 20, 36, 17, 26, 40, 22, 32, 16, 28, 35, 18, 25, 12, 21, 9];
const slabs = [1, 2, 3, 4, 5, 6, 7];
/** Poussière lumineuse : position, taille, durée de montée, décalage. */
const dust = [
  { x: 12, size: 3, dur: 19, delay: 0 }, { x: 26, size: 4, dur: 23, delay: -7 }, { x: 41, size: 2, dur: 17, delay: -3 },
  { x: 58, size: 3, dur: 21, delay: -12 }, { x: 69, size: 5, dur: 26, delay: -5 }, { x: 80, size: 3, dur: 18, delay: -9 },
  { x: 88, size: 2, dur: 22, delay: -15 }, { x: 34, size: 2, dur: 24, delay: -18 }, { x: 74, size: 2, dur: 20, delay: -1 },
];

function subscribeToMedia(query: string) {
  return (callback: () => void) => {
    const media = window.matchMedia(query);
    media.addEventListener("change", callback);
    return () => media.removeEventListener("change", callback);
  };
}
const subscribeToMotion = subscribeToMedia("(prefers-reduced-motion: reduce)");
const subscribeToPointer = subscribeToMedia("(hover: hover) and (pointer: fine)");
const getReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const getFinePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const serverTrue = () => true;
const serverFalse = () => false;

/** Un nombre qui compte jusqu'à sa cible (rAF, easing expo), comme le total des pubs. */
function useCountUp(target: number, duration: number, animate: boolean) {
  const [value, setValue] = useState(target);
  const previous = useRef(target);
  useEffect(() => {
    const from = previous.current;
    previous.current = target;
    if (!animate || from === target) {
      const id = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(id);
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(2, -10 * t);
      setValue(from + (target - from) * (t >= 1 ? 1 : eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, animate]);
  return value;
}

export function HeroDevice({ copy }: { copy: HeroDeviceCopy }) {
  const reducedMotion = useSyncExternalStore(subscribeToMotion, getReducedMotion, serverTrue);
  const finePointer = useSyncExternalStore(subscribeToPointer, getFinePointer, serverFalse);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [typed, setTyped] = useState(0);
  const [goalTarget, setGoalTarget] = useState(copy.goalFrom);
  // La boucle : facture → relances → devis (deux types de scénario, plus d'une minute).
  const SEQUENCE = 3;
  const isReminder = !reducedMotion && scenarioIndex === 1;
  const scenario = copy.scenarios[scenarioIndex === 2 ? 1 : 0];
  const steps: readonly Step[] = isReminder ? REMINDER_STEPS : STEPS;
  const playing = !reducedMotion;
  // Sans mouvement : un état lisible, le document créé.
  const at = reducedMotion ? STEPS.indexOf("created") : stepIndex;
  const step = steps[at];
  const is = (name: Step) => { const i = steps.indexOf(name); return i >= 0 && at >= i; };
  const prompt = isReminder ? copy.reminder.prompt : scenario.prompt;

  const money = useMemo(() => new Intl.NumberFormat(copy.locale, { style: "currency", currency: copy.currency }), [copy.locale, copy.currency]);
  // La dictée dure selon sa longueur ; la signature du devis prend son temps (Ralph, 30/09).
  const durations = useMemo(() => ({
    ...BASE_DURATIONS,
    typing: prompt.length * 42 + 300,
    notif: scenario.kind === "quote" ? 5200 : BASE_DURATIONS.notif,
    // Relances : on laisse le temps de lire la réponse, puis de voir partir les trois.
    ...(isReminder ? { reply: 1700, sending: 1300, fly: 1900, sent: 3200 } : {}),
  }), [prompt.length, scenario.kind, isReminder]);

  // Séquenceur : au bout du dernier pas, le scénario suivant repart de zéro.
  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => {
      if (stepIndex === steps.length - 1) {
        setScenarioIndex((i) => (i + 1) % SEQUENCE);
        setTyped(0);
        setStepIndex(0);
      } else {
        const next = steps[stepIndex + 1];
        // Le paiement fait monter l'objectif ; la feuille du premier scénario
        // le remet au départ pendant qu'elle cache le dashboard.
        if (next === "back" && !isReminder && scenario.kind === "invoice") setGoalTarget((g) => g + scenario.amount);
        if (next === "typing" && scenarioIndex === 0) setGoalTarget(copy.goalFrom);
        setStepIndex(stepIndex + 1);
      }
    }, durations[steps[stepIndex]]);
    return () => clearTimeout(timer);
  }, [stepIndex, playing, durations, steps, isReminder, copy.goalFrom, scenario, scenarioIndex]);

  // La dictée s'écrit lettre à lettre pendant le pas « typing ».
  useEffect(() => {
    if (step !== "typing" || !playing) return;
    const timer = setInterval(() => {
      setTyped((count) => {
        if (count >= prompt.length) { clearInterval(timer); return count; }
        return count + 1;
      });
    }, 42);
    return () => clearInterval(timer);
  }, [prompt, step, playing]);

  // Souris : le téléphone suit doucement le pointeur sur toute la section.
  useEffect(() => {
    const stage = stageRef.current;
    const zone = stage?.closest("section") ?? stage;
    if (!stage || !zone || !finePointer || reducedMotion) return;
    let target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let raf = 0;
    const tick = () => {
      current.x += (target.x - current.x) * 0.07;
      current.y += (target.y - current.y) * 0.07;
      stage.style.setProperty("--tx", `${current.x.toFixed(2)}deg`);
      stage.style.setProperty("--ty", `${current.y.toFixed(2)}deg`);
      stage.style.setProperty("--mx", (current.x / 18).toFixed(3));
      stage.style.setProperty("--my", (-current.y / 10).toFixed(3));
      const settled = Math.abs(target.x - current.x) < 0.02 && Math.abs(target.y - current.y) < 0.02;
      raf = settled ? 0 : requestAnimationFrame(tick);
    };
    const move = (event: MouseEvent) => {
      const rect = zone.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      target = { x: x * 18, y: -y * 10 };
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const leave = () => { target = { x: 0, y: 0 }; if (!raf) raf = requestAnimationFrame(tick); };
    zone.addEventListener("mousemove", move);
    zone.addEventListener("mouseleave", leave);
    return () => {
      zone.removeEventListener("mousemove", move);
      zone.removeEventListener("mouseleave", leave);
      cancelAnimationFrame(raf);
    };
  }, [finePointer, reducedMotion]);

  // Les chiffres qui comptent : le total du document, l'objectif du mois.
  const total = useCountUp(is("total") ? scenario.amount : 0, 1300, playing);
  const goal = useCountUp(goalTarget, 1500, playing);
  const goalPct = Math.min(100, Math.round((goal / copy.goalTotal) * 100));

  const spoken = step === "typing" ? prompt.slice(0, typed) : is("reply") ? prompt : "";
  const reminderTotal = copy.reminder.rows.reduce((sum, r) => sum + r.amount, 0);
  const replyText = isReminder ? copy.reminder.answer.replace("{total}", money.format(reminderTotal)) : scenario.reply;
  const askText = isReminder ? copy.reminder.ask : scenario.ask;
  const yesText = isReminder ? copy.reminder.yes : scenario.yes;
  const chipText = isReminder ? copy.reminder.sentChip : scenario.sentChip;
  const statusTitle = is("sending") ? copy.sending[0] : is("created") ? scenario.created : copy.writing[0];
  const statusDetail = is("sending") ? copy.sending[1] : is("created") ? copy.review : copy.writing[1];
  const StatusIcon = is("sending") ? BadgeCheck : is("created") ? Check : Mic;
  const page = is("back") ? "dashboard" : is("detail") ? "detail" : is("list") ? "list" : "dashboard";
  const done = is("notif");
  const badge = done ? scenario.doneBadge : "sent";
  const today = useMemo(() => new Intl.DateTimeFormat(copy.locale, { day: "2-digit", month: "2-digit", year: "2-digit" }).format(new Date()), [copy.locale]);
  const monthTitle = useMemo(() => new Intl.DateTimeFormat(copy.locale, { month: "long", year: "numeric" }).format(new Date()), [copy.locale]);
  const listTitle = scenario.kind === "quote" ? copy.list.quotes : copy.list.invoices;
  const monthTotal = scenario.rows.reduce((sum, r) => sum + r.amount, 0) + scenario.amount;
  const historyWhen = (time: string) => `${copy.detail.on} ${today} ${copy.detail.at} ${time}`;
  const history = [
    { key: "created", label: scenario.created, time: "20:12", on: true },
    { key: "sent", label: scenario.sent, time: "20:13", on: true },
    { key: "opened", label: copy.detail.emailOpen, time: "20:30", on: is("opened") },
    { key: "done", label: scenario.doneHistory, time: "20:41", on: done },
  ].filter((h) => h.on).reverse();
  // Ventes (12 mois) : 11 mois passés + le mois en cours (le chiffre qui compte).
  const salesTotal = SALES_PAID.reduce((sum, v) => sum + v, 0) * copy.scale + goal;
  const salesAvg = salesTotal / 12;
  const flags = {
    "data-step": step,
    "data-kind": isReminder ? "reminder" : scenario.kind,
    "data-rows": is("rows") && !is("sent"),
    "data-page": page,
    "data-playing": playing,
    "data-sheet": is("sheet") && !is("sent"),
    "data-reply": is("reply") && !is("sending"),
    "data-doc": is("open"),
    "data-pdf": step === "pdf",
    "data-client": is("client"),
    "data-service": is("service"),
    "data-total": is("total"),
    "data-ask": is("ask") && !is("sending"),
    "data-yes": is("yes") && !is("sending"),
    "data-envelope": is("sending") && !is("sent"),
    "data-fly": step === "fly",
    "data-pill": step === "sent",
    "data-toast": step === "opened" || step === "notif",
    "data-notif": step === "notif",
    "data-done": done,
    "data-clear": step === "clear",
  };

  const mark = <Bot strokeWidth={2.2} aria-hidden="true" />;

  return (
    <div ref={stageRef} className={styles.stage} {...flags} aria-label={copy.stageAlt}>
      <div className={styles.light} aria-hidden="true" />
      <div className={styles.dust} aria-hidden="true">
        {dust.map((d, i) => <i key={i} style={{ "--x": `${d.x}%`, "--size": `${d.size}px`, "--dur": `${d.dur}s`, "--delay": `${d.delay}s` } as CSSProperties} />)}
      </div>
      <span className={styles.ripple} aria-hidden="true" />
      <span className={`${styles.ripple} ${styles.rippleLate}`} aria-hidden="true" />
      <div className={styles.float}>
        <div className={styles.tilt}>
          <div className={styles.turn}>
            <div className={styles.device}>
              {slabs.map((i) => <div key={i} className={styles.slab} style={{ "--i": i } as CSSProperties} aria-hidden="true" />)}
              <div className={`${styles.slab} ${styles.back}`} aria-hidden="true"><Bot size={44} strokeWidth={1.6} /></div>
              <span className={`${styles.button} ${styles.mute}`} aria-hidden="true" />
              <span className={`${styles.button} ${styles.volUp}`} aria-hidden="true" />
              <span className={`${styles.button} ${styles.volDown}`} aria-hidden="true" />
              <span className={`${styles.button} ${styles.power}`} aria-hidden="true" />

              <div className={styles.front}>
                <div className={styles.bezel}>
                  <div className={styles.screen}>
                    <div className={styles.ui}>
                      <div className={styles.statusBar}>
                        <span>9:41</span>
                        <span className={styles.statusIcons}>
                          <Signal size={13} strokeWidth={2.4} aria-hidden="true" />
                          <Wifi size={13} strokeWidth={2.4} aria-hidden="true" />
                          <i className={styles.battery} aria-hidden="true" />
                        </span>
                      </div>

                      <div className={styles.pages}>
                        {/* ---- Dashboard (écran réel de l'app, mode sombre) ---- */}
                        <section className={`${styles.page} ${styles.pageDash}`}>
                          <div className={styles.appBar}>
                            <span className={styles.brand}><i>{mark}</i>Robi <b>AI</b></span>
                            <span className={styles.gear}><Settings size={15} strokeWidth={2} aria-hidden="true" /></span>
                          </div>
                          <div className={styles.revenue}>
                            <span className={styles.cardLabel}>{copy.dashboard.revenueMonth}</span>
                            <strong className={styles.revenueBig}>{money.format(Math.round(goal))}</strong>
                            <span className={styles.bar}><i style={{ width: `${goalPct}%` }} /></span>
                            <span className={styles.pct}><span>{copy.dashboard.goal} · {money.format(copy.goalTotal)}</span><b>{goalPct} %</b></span>
                          </div>
                          <div className={styles.tiles}>
                            <span className={`${styles.tile} ${styles.warn}`}><b>3</b><small>{copy.dashboard.pendingInvoices}</small></span>
                            <span className={styles.tile}><b>1</b><small>{copy.dashboard.openQuotes}</small></span>
                          </div>
                          <div className={styles.sales}>
                            <div className={styles.salesHead}>
                              <span className={styles.salesTitle}><i><TrendingUp size={12} strokeWidth={2.4} aria-hidden="true" /></i>{copy.dashboard.sales12m}</span>
                              <b>{money.format(Math.round(salesTotal))}</b>
                            </div>
                            <div className={styles.salesChart} aria-hidden="true">
                              {SALES_PENDING.map((pending, i) => {
                                const paidValue = i === 11 ? goal / copy.scale : SALES_PAID[i];
                                return (
                                  <span key={i} className={styles.salesCol}>
                                    {/* En attente (gris) empilé sur l'encaissé (lime), comme dans l'app. */}
                                    <i className={styles.salesPending} style={{ "--h": `${(pending / SALES_SCALE) * 100}%` } as CSSProperties} />
                                    <i className={styles.salesBar} data-current={i === 11} style={{ "--h": `${Math.min(100, (paidValue / SALES_SCALE) * 100)}%` } as CSSProperties} />
                                    <small>{copy.dashboard.months[i]}</small>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                          <div className={styles.duo}>
                            <span className={styles.mini}><small><Calendar size={10} aria-hidden="true" />{copy.dashboard.goal}</small><b>{goalPct} %</b><span className={styles.miniBar}><i style={{ width: `${goalPct}%` }} /></span></span>
                            <span className={styles.mini}><small><Activity size={10} aria-hidden="true" />{copy.dashboard.avgMonth}</small><b>{money.format(Math.round(salesAvg))}</b><em>{copy.dashboard.avgMonthSub}</em></span>
                          </div>
                        </section>

                        {/* ---- Liste des factures / devis (écran réel) ---- */}
                        <section className={`${styles.page} ${styles.pageList}`}>
                          <div className={styles.appBar}>
                            <span className={styles.brand}><i>{mark}</i>Robi <b>AI</b></span>
                            <span className={styles.gear}><Settings size={15} strokeWidth={2} aria-hidden="true" /></span>
                          </div>
                          <div className={styles.listHead}>
                            <span className={styles.listTitle}><FileCheck size={18} strokeWidth={2.2} aria-hidden="true" />{listTitle}</span>
                            <span className={styles.search}><Search size={12} aria-hidden="true" />{copy.list.search}</span>
                          </div>
                          <span className={styles.createBtn}>+ {copy.list.create}</span>
                          <div className={styles.tabs}>
                            {scenario.tabs.map((tab, i) => <span key={tab} data-active={i === 0}>{tab}<b>{scenario.tabCounts[i]}</b></span>)}
                          </div>
                          <div className={styles.month}><span>{monthTitle}</span><b>{money.format(monthTotal)}</b></div>
                          <div className={styles.rows}>
                            <div key={`new-${scenarioIndex}`} className={`${styles.row} ${styles.rowNew}`}>
                              {/* Le toucher : on appuie sur la ligne, puis sa fiche s'ouvre. */}
                              <span className={styles.touch} aria-hidden="true" />
                              <span className={styles.avatar}>{scenario.client.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}</span>
                              <span className={styles.rowText}><strong>{scenario.client}</strong><small>{scenario.number}</small></span>
                              <span className={styles.rowAmount}><strong>{money.format(scenario.amount)}</strong><i className={styles.badge} data-badge={badge}>{copy.badges[badge]}</i></span>
                            </div>
                            {scenario.rows.map((r) => (
                              <div key={r.number} className={styles.row}>
                                <span className={styles.avatar}>{r.client.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}</span>
                                <span className={styles.rowText}><strong>{r.client}</strong><small>{r.number}</small></span>
                                <span className={styles.rowAmount}><strong>{money.format(r.amount)}</strong><i className={styles.badge} data-badge={r.badge}>{copy.badges[r.badge]}</i></span>
                              </div>
                            ))}
                          </div>
                        </section>

                        {/* ---- Fiche du document (écran réel) ---- */}
                        <section className={`${styles.page} ${styles.pageDetail}`}>
                          <div className={styles.detailBar}>
                            <X size={16} strokeWidth={2.2} aria-hidden="true" />
                            <i key={badge} className={styles.badge} data-badge={badge}>{copy.badges[badge]}</i>
                            <span className={styles.detailView} data-tap={step === "pdf"}><span className={styles.touch} aria-hidden="true" /><Eye size={13} aria-hidden="true" />{copy.detail.view}</span>
                            <Download size={15} strokeWidth={2} aria-hidden="true" />
                            <span className={styles.detailMore}>{copy.detail.more}<ChevronDown size={13} aria-hidden="true" /></span>
                          </div>
                          <div className={styles.detailBody}>
                            <small className={styles.detailNumber}>N° {scenario.number}</small>
                            <strong className={styles.detailClient}>{scenario.client}</strong>
                            <div className={styles.totals}>
                              <span><em>{copy.detail.totalHt}</em><b>{money.format(scenario.amount / 1.2)}</b></span>
                              <span><em>{copy.detail.vat}</em><b>{money.format(scenario.amount - scenario.amount / 1.2)}</b></span>
                              <span className={styles.totalsMain}><em>{copy.detail.total}</em><b>{money.format(scenario.amount)}</b></span>
                            </div>
                            {/* « Marquer comme payée » n'existe que sur une facture ; un devis affiche son état. */}
                            {scenario.kind === "invoice" ? (
                              <span key={String(done)} className={styles.markPaid} data-done={done}>
                                <CheckSquare size={15} strokeWidth={2.4} aria-hidden="true" />{done ? copy.detail.paid : copy.detail.markPaid}
                              </span>
                            ) : (
                              <span key={String(done)} className={styles.markPaid} data-done={!done} data-quote="true">
                                <CheckSquare size={15} strokeWidth={2.4} aria-hidden="true" />{done ? scenario.doneTitle : scenario.sent}
                              </span>
                            )}
                            <div className={styles.dates}>
                              <span><em>{copy.detail.createdOn}</em><b>{today}</b></span>
                              <span><em>{copy.detail.due}</em><b>{today}</b></span>
                            </div>
                            <div className={styles.detailTabs}><span data-active="true">{copy.detail.history}</span><span>{copy.detail.lines}</span></div>
                            <ol className={styles.timeline}>
                              {history.map((h, i) => (
                                <li key={h.key} data-latest={i === 0}>
                                  <i />
                                  <strong>{h.label}</strong>
                                  <small>{historyWhen(h.time)}</small>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </section>
                      </div>

                      {/* ---- Aperçu PDF : on touche « Afficher », le document s'ouvre ---- */}
                      <div className={styles.pdf} aria-hidden={step !== "pdf"}>
                        <div className={styles.pdfBar}>
                          <X size={15} strokeWidth={2.2} aria-hidden="true" />
                          <span>{scenario.number}.pdf</span>
                          <Download size={15} strokeWidth={2} aria-hidden="true" />
                        </div>
                        <div className={styles.paper}>
                          {/* En-tête coloré : le logo et le nom d'une entreprise de démo (pas celui de Robi). */}
                          <div className={styles.paperHead}>
                            <span className={styles.paperLogo} aria-hidden="true">{copy.pdf.issuer.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
                            <span className={styles.paperIssuer}><b>{copy.pdf.issuer}</b><small>{copy.pdf.issuerLine}</small></span>
                            <span className={styles.paperTitle}>{scenario.docLabel}<em>{scenario.number}</em></span>
                          </div>
                          <div className={styles.paperBody}>
                            <div className={styles.paperMeta}>
                              <span><em>{scenario.kind === "quote" ? copy.fields.client : copy.pdf.billTo}</em><b>{scenario.client}</b><i /><i /></span>
                              <span className={styles.paperDate}><em>{copy.pdf.date}</em><b>{today}</b><em>{copy.detail.due}</em><b>{today}</b></span>
                            </div>
                            <div className={styles.paperTable}>
                              <span className={styles.paperTh}><em>{copy.pdf.designation}</em><em>{copy.pdf.amount}</em></span>
                              <span className={styles.paperTr}><b>{scenario.service}</b><b>{money.format(scenario.amount / 1.2)}</b></span>
                              <span className={styles.paperGhost} aria-hidden="true"><i /><i /></span>
                            </div>
                            <div className={styles.paperTotals}>
                              <span><em>{copy.detail.totalHt}</em><b>{money.format(scenario.amount / 1.2)}</b></span>
                              <span><em>{copy.detail.vat} 20 %</em><b>{money.format(scenario.amount - scenario.amount / 1.2)}</b></span>
                              <span className={styles.paperTotal}><em>{copy.detail.total}</em><b>{money.format(scenario.amount)}</b></span>
                            </div>
                            {scenario.kind === "invoice" ? (
                              <span className={styles.paperPay}><CreditCard size={13} strokeWidth={2.4} aria-hidden="true" />{copy.pdf.payOnline}</span>
                            ) : (
                              <span className={styles.paperSign}>
                                <em>{copy.pdf.approve}</em>
                                <svg width="92" height="30" viewBox="0 0 120 44" fill="none" aria-hidden="true">
                                  <path d="M6 32 C 14 10, 24 6, 30 22 C 34 34, 42 36, 48 20 C 52 9, 60 10, 62 24 C 64 34, 74 30, 80 18 C 86 8, 96 14, 114 12" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
                                </svg>
                              </span>
                            )}
                            <div className={styles.paperFoot}>
                              {copy.facturX && scenario.kind === "invoice" ? <span className={styles.paperFx}>Factur-X</span> : <span />}
                              <span>{scenario.number}.pdf</span>
                            </div>
                          </div>
                        </div>
                        {/* Les quatre boutons de l'app, sous l'aperçu. */}
                        <div className={styles.pdfActions}>
                          <span><Download size={13} strokeWidth={2.2} aria-hidden="true" />{copy.pdf.actions.pdf}</span>
                          <span><Mail size={13} strokeWidth={2.2} aria-hidden="true" />{copy.pdf.actions.send}</span>
                          {scenario.kind === "invoice" ? (
                            <>
                              <span><Check size={13} strokeWidth={2.6} aria-hidden="true" />{copy.pdf.actions.approved}</span>
                              <span data-accent="true"><CheckSquare size={14} strokeWidth={2.4} aria-hidden="true" />{copy.pdf.actions.paid}</span>
                            </>
                          ) : (
                            <>
                              <span data-ghost="true"><FileText size={13} strokeWidth={2.2} aria-hidden="true" />{copy.pdf.actions.draft}</span>
                              <span data-accent="true"><Check size={13} strokeWidth={2.6} aria-hidden="true" />{copy.pdf.actions.approveBtn}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* ---- Feuille de dictée : « Vous dites » → document ---- */}
                      <div className={styles.sheet}>
                        <span className={styles.grabber} aria-hidden="true" />
                        <div className={styles.voice}>
                          <div className={styles.voiceTop}>
                            <span className={styles.voiceLabel}><Mic size={13} aria-hidden="true" />{copy.youSay}</span>
                            <span className={styles.wave} aria-hidden="true">
                              {waveHeights.map((height, i) => <i key={i} style={{ height: height * 0.55, "--bar-delay": `${i * 0.055}s` } as CSSProperties} />)}
                            </span>
                          </div>
                          <p className={styles.prompt}>« {spoken}<i className={styles.caret} aria-hidden="true" /> »</p>
                        </div>

                        {/* Robi répond dans une bulle lime, en même temps que le document s'ouvre. */}
                        <div className={`${styles.reply} ${styles.first}`}>
                          <span className={styles.replyMark}>{mark}</span>
                          <span className={styles.replyBubble}>{replyText}</span>
                        </div>

                        {isReminder ? (
                          /* Relances : les trois factures impayées, puis chacune devient une bulle qui part. */
                          <div className={styles.remRows}>
                            {copy.reminder.rows.map((row, i) => (
                              <div key={row.number} className={styles.remItem} style={{ "--i": i } as CSSProperties}>
                                <div className={styles.remRow}>
                                  <span className={styles.avatar}>{row.client.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}</span>
                                  <span className={styles.rowText}><strong>{row.client}</strong><small>{row.number}</small></span>
                                  <span className={styles.rowAmount}><strong>{money.format(row.amount)}</strong><i className={styles.badge} data-badge={row.badge}>{copy.badges[row.badge]}</i></span>
                                </div>
                                <span className={styles.remOrb} aria-hidden="true"><Mail size={17} strokeWidth={2.4} /></span>
                              </div>
                            ))}
                          </div>
                        ) : (
                        <div key={`doc-${scenarioIndex}`} className={styles.document}>
                            <div className={styles.documentTop}>
                              <span className={styles.documentTitle}>{scenario.docLabel}<span>.</span></span>
                              <span className={styles.documentMark}>{mark}</span>
                            </div>
                            <div className={styles.lines}>
                              <div className={styles.line} data-on={is("client")}><span>{copy.fields.client}</span><i /><b>{scenario.client}</b></div>
                              <div className={styles.line} data-on={is("service")}><span>{copy.fields.service}</span><i /><b>{scenario.service}</b></div>
                              <div className={`${styles.line} ${styles.lineTotal}`} data-on={is("total")}><span>{copy.fields.total}</span><i /><b>{money.format(total)}</b></div>
                            </div>
                            <div className={styles.documentStatus}>
                              <span className={styles.check}><StatusIcon size={15} strokeWidth={2.4} aria-hidden="true" /></span>
                              <span key={statusTitle} className={styles.statusText}><strong>{statusTitle}</strong><small>{statusDetail}</small></span>
                            </div>
                          </div>
                        )}

                        {/* Sous le document : Robi propose l'envoi, l'utilisateur répond, ça part. */}
                        <div className={`${styles.reply} ${styles.ask}`}>
                          <span className={styles.replyMark}>{mark}</span>
                          <span className={styles.replyBubble}>{askText}</span>
                        </div>
                        <div className={`${styles.reply} ${styles.yes}`}>
                          <span className={styles.userBubble}><Mic size={11} strokeWidth={2.4} aria-hidden="true" />{yesText}</span>
                        </div>

                        {!isReminder && <div className={styles.orb} aria-hidden="true"><Send size={22} strokeWidth={2.4} /></div>}
                      </div>

                      {/* ---- Notification iOS : « Document ouvert » puis « Paiement reçu » ---- */}
                      <div key={done ? "done" : "opened"} className={styles.notif} role="status">
                        <span className={styles.notifIcon}>{mark}</span>
                        <span className={styles.notifText}>
                          <small>{copy.app} · {copy.now}</small>
                          <strong>{done ? scenario.doneTitle : copy.openedTitle}</strong>
                          <span>{done ? scenario.doneLine : scenario.openedLine}</span>
                        </span>
                      </div>

                      <div className={styles.tabBar} aria-hidden="true">
                        <span data-active={page === "list" || page === "detail"}><FileCheck size={18} strokeWidth={2} /><small>{copy.nav[0]}</small></span>
                        <span><FileText size={18} strokeWidth={2} /><small>{copy.nav[1]}</small></span>
                        <span className={styles.tabMic}>{mark}</span>
                        <span><Users size={18} strokeWidth={2} /><small>{copy.nav[2]}</small></span>
                        <span><Package size={18} strokeWidth={2} /><small>{copy.nav[3]}</small></span>
                      </div>
                      <span className={styles.homeBar} aria-hidden="true" />
                    </div>
                  </div>
                  <span className={styles.island} aria-hidden="true" />
                  <span className={styles.glass} aria-hidden="true" />
                </div>
              </div>
              <span className={styles.rim} aria-hidden="true" />
            </div>
          </div>
        </div>
        <span className={styles.shadow} aria-hidden="true" />
      </div>

      {/* ---- Hors du téléphone : l'enveloppe qui vole, la pastille, les chips ---- */}
      {(isReminder ? [0, 1, 2] : [0]).map((n) => (
        <div key={`${isReminder}-${n}`} className={styles.flyer} style={{ "--n": n } as CSSProperties} aria-hidden="true">
          <span className={styles.trail} />
          <span className={styles.orbMini}>{isReminder ? <Mail size={17} strokeWidth={2.4} /> : <Send size={18} strokeWidth={2.4} />}</span>
        </div>
      ))}
      {/* Pastille « Robi AI » retirée à la demande de Ralph (30/09) : seul le chip « Envoyé à … » reste. */}
      <div className={styles.pillWrap} aria-hidden="true">
        <div className={styles.sentChip}><span className={styles.sentRing} /><Check size={13} strokeWidth={3} />{chipText}</div>
      </div>
      <div className={styles.fxWrap} aria-hidden="true">
        {copy.facturX && (
          <div className={styles.fxChip}>
            <span className={styles.flag} />
            <span>{copy.facturX.split("Factur-X")[0]}<b>Factur-X</b></span>
          </div>
        )}
        {copy.cardPayments && (
        <div className={styles.payGroup}>
            <div className={`${styles.fxChip} ${styles.payChip}`}>
              <span className={styles.payIcon}><CreditCard size={15} strokeWidth={2.4} aria-hidden="true" /></span>
              <span>{copy.stripe}</span>
            </div>
            <div className={`${styles.fxChip} ${styles.logoChip}`}>
              <span className={styles.visa}>VISA</span>
              <span className={styles.mastercard}><i /><i /></span>
              <span className={styles.stripeBadge}><b>S</b>Stripe</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
