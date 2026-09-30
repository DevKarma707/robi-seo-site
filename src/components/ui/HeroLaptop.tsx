"use client";

/**
 * Héro « ordinateur 3D » (01/10/2026) — la version bureau du téléphone flottant.
 *
 * Un portable en CSS 3D (écran en aluminium avec épaisseur, dalle noire,
 * encoche, charnière, clavier et pavé tactile sur le plateau vu d'en haut)
 * flotte et pivote lentement dans la même lumière lime que le téléphone ;
 * à la souris, il suit le pointeur.
 *
 * À l'écran, l'app web de Robi (mode démo, clair) : le tableau de bord dont
 * les chiffres montent, puis un curseur ouvre Robi AI, dicte une facture qui
 * se remplit dans l'éditeur, Robi propose l'envoi, la facture part (une bulle
 * lime sort de l'écran), la liste des factures s'ouvre, le client l'ouvre,
 * le paiement arrive (notification du Mac), et le tableau de bord monte.
 * Deuxième tour : un devis, signé électroniquement.
 *
 * L'interface est dessinée à 1280 × 800 puis mise à l'échelle (`--s`). Le
 * curseur vise les vrais éléments (`data-cursor`), mesurés sans les
 * transformations 3D (offsetLeft / offsetTop).
 */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import {
  Activity, ArrowLeft, ArrowRight, Bot, Calendar, Check, ChevronDown, CreditCard, FileCheck, FilePlus, FileText,
  LayoutGrid, MapPin, Mic, Moon, Package, Paperclip, Plus, Receipt, RotateCcw, Save, Search, Send, Settings, Star,
  Sun, TrendingDown, TrendingUp, Users, X,
} from "lucide-react";
import { SALES_PAID, SALES_PENDING, SALES_SCALE } from "@/lib/i18n/heroDevice";
import type { HeroLaptopCopy } from "@/lib/i18n/heroLaptop";
import styles from "./HeroLaptop.module.css";

const INVOICE_STEPS = [
  "idle", "toRobi", "clickRobi", "robi", "toMic", "typing", "sendMsg", "reply", "fillClient", "fillLine", "fillTotal",
  "ask", "yes", "sending", "fly", "sent", "list", "toRow", "clickRow", "detail", "opened", "notif", "toDash", "clickDash", "back", "clear",
] as const;
/** Le devis : même parcours, il se termine sur la signature (le tableau de bord ne bouge pas). */
const QUOTE_STEPS = [
  "idle", "toRobi", "clickRobi", "robi", "toMic", "typing", "sendMsg", "reply", "fillClient", "fillLine", "fillTotal",
  "ask", "yes", "sending", "fly", "sent", "list", "toRow", "clickRow", "detail", "opened", "notif", "hold", "clear",
] as const;
type Step = (typeof INVOICE_STEPS)[number] | (typeof QUOTE_STEPS)[number];

/* Même rythme posé que le téléphone : rien de brusque, le temps de lire. */
const BASE_DURATIONS: Record<Step, number> = {
  idle: 3400, toRobi: 1300, clickRobi: 500, robi: 1100, toMic: 1000, typing: 0, sendMsg: 800, reply: 1500,
  fillClient: 950, fillLine: 1050, fillTotal: 1700, ask: 1700, yes: 950, sending: 1000, fly: 1200, sent: 2300,
  list: 1500, toRow: 1000, clickRow: 500, detail: 2100, opened: 3300, notif: 4000, toDash: 1100, clickDash: 500,
  back: 4800, hold: 2800, clear: 800,
};
/** Pas où le curseur clique (anneau + bouton enfoncé). */
const CLICKS: Step[] = ["clickRobi", "typing", "sendMsg", "clickRow", "clickDash"];
/** Cible du curseur à chaque pas (valeur de `data-cursor`), ou une position de repos. */
const CURSOR: Partial<Record<Step, string>> = {
  toRobi: "nav-robi", clickRobi: "nav-robi", robi: "nav-robi",
  toMic: "mic", typing: "mic", sendMsg: "send", reply: "send",
  fillClient: "rest-editor", fillLine: "rest-editor", fillTotal: "rest-editor", ask: "rest-editor", yes: "rest-editor",
  sending: "ready", fly: "ready", sent: "ready",
  list: "rest-list", toRow: "row-new", clickRow: "row-new", detail: "row-new", opened: "row-new", notif: "row-new",
  toDash: "nav-dashboard", clickDash: "nav-dashboard", back: "rest-dash", hold: "row-new",
};
const waveHeights = [8, 14, 22, 12, 26, 18, 30, 15, 22, 28, 16, 24, 12, 20];
const lidSlabs = [1, 2, 3, 4];
const dust = [
  { x: 8, size: 3, dur: 21, delay: 0 }, { x: 19, size: 4, dur: 25, delay: -8 }, { x: 33, size: 2, dur: 18, delay: -3 },
  { x: 52, size: 3, dur: 23, delay: -13 }, { x: 66, size: 5, dur: 27, delay: -5 }, { x: 78, size: 3, dur: 19, delay: -10 },
  { x: 91, size: 2, dur: 22, delay: -16 }, { x: 44, size: 2, dur: 26, delay: -19 }, { x: 86, size: 2, dur: 20, delay: -2 },
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

/** Un nombre qui compte jusqu'à sa cible (rAF, easing expo), comme sur le téléphone. */
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

/** Position d'un élément dans l'interface, sans les transformations 3D du portable. */
function centerIn(el: HTMLElement, root: HTMLElement) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x: x + el.offsetWidth * 0.5, y: y + el.offsetHeight * 0.55 };
}

const initialsOf = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
const fill = (text: string, n: number) => text.replace("{n}", String(n));

function Card({ icon, title, children, className = "" }: { icon: ReactNode; title: string; children: ReactNode; className?: string }) {
  return (
    <div className={`${styles.card} ${className}`}>
      <div className={styles.cardHead}>
        <span className={styles.cardIcon}>{icon}</span>
        <span className={styles.cardTitle}>{title}</span>
      </div>
      {children}
    </div>
  );
}

export function HeroLaptop({ copy }: { copy: HeroLaptopCopy }) {
  const reducedMotion = useSyncExternalStore(subscribeToMotion, getReducedMotion, serverTrue);
  const finePointer = useSyncExternalStore(subscribeToPointer, getFinePointer, serverFalse);
  const stageRef = useRef<HTMLDivElement>(null);
  const uiRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [typed, setTyped] = useState(0);
  // Au début de chaque tour, les chiffres du tableau de bord partent de zéro et montent.
  const [boot, setBoot] = useState(false);
  const [loop, setLoop] = useState(0);

  const d = copy.desk;
  const playing = !reducedMotion;
  const scenario = copy.scenarios[scenarioIndex];
  const isQuote = scenario.kind === "quote";
  const steps: readonly Step[] = isQuote ? QUOTE_STEPS : INVOICE_STEPS;
  // Sans mouvement : un état lisible, le tableau de bord rempli.
  const at = reducedMotion ? 0 : stepIndex;
  const step = steps[at];
  const is = (name: Step) => { const i = steps.indexOf(name); return i >= 0 && at >= i; };
  const prompt = scenario.prompt;
  const booted = boot || reducedMotion;

  const money0 = useMemo(() => new Intl.NumberFormat(copy.locale, { style: "currency", currency: copy.currency, maximumFractionDigits: 0 }), [copy.locale, copy.currency]);
  const money = useMemo(() => new Intl.NumberFormat(copy.locale, { style: "currency", currency: copy.currency }), [copy.locale, copy.currency]);
  const compact = useMemo(() => new Intl.NumberFormat(copy.locale, { notation: "compact", maximumFractionDigits: 1 }), [copy.locale]);

  const durations = useMemo(() => ({
    ...BASE_DURATIONS,
    typing: prompt.length * 42 + 450,
    idle: scenarioIndex === 0 ? BASE_DURATIONS.idle : 2200,
    notif: isQuote ? 5000 : BASE_DURATIONS.notif,
  }), [prompt.length, scenarioIndex, isQuote]);

  // Séquenceur : au bout du dernier pas, le scénario suivant repart de zéro.
  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => {
      if (stepIndex === steps.length - 1) {
        const next = (scenarioIndex + 1) % copy.scenarios.length;
        setScenarioIndex(next);
        setTyped(0);
        setStepIndex(0);
        if (next === 0) { setBoot(false); setLoop((l) => l + 1); }
      } else {
        setStepIndex(stepIndex + 1);
      }
    }, durations[steps[stepIndex]]);
    return () => clearTimeout(timer);
  }, [stepIndex, playing, durations, steps, scenarioIndex, copy.scenarios.length]);

  // Démarrage du tour : un temps sur zéro, puis les chiffres montent.
  useEffect(() => {
    if (!playing || boot || step !== "idle") return;
    const timer = setTimeout(() => setBoot(true), 450);
    return () => clearTimeout(timer);
  }, [playing, boot, step]);

  // La dictée s'écrit lettre à lettre dans le champ de Robi AI.
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

  // Le curseur file vers sa cible (mesurée dans l'interface, avant la mise à l'échelle).
  useEffect(() => {
    const ui = uiRef.current;
    const cursor = cursorRef.current;
    if (!ui || !cursor || !playing) return;
    const raf = requestAnimationFrame(() => {
      const name = CURSOR[step];
      let point = { x: 960, y: 610 };
      const target = name ? ui.querySelector<HTMLElement>(`[data-cursor="${name}"]`) : null;
      if (target) point = centerIn(target, ui);
      cursor.style.setProperty("--cx", `${Math.round(point.x)}px`);
      cursor.style.setProperty("--cy", `${Math.round(point.y)}px`);
    });
    return () => cancelAnimationFrame(raf);
  }, [step, playing, scenarioIndex]);

  // Souris : le portable suit doucement le pointeur sur toute la section.
  useEffect(() => {
    const stage = stageRef.current;
    const zone = stage?.closest("section") ?? stage;
    if (!stage || !zone || !finePointer || reducedMotion) return;
    let target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let raf = 0;
    const tick = () => {
      current.x += (target.x - current.x) * 0.06;
      current.y += (target.y - current.y) * 0.06;
      stage.style.setProperty("--tx", `${current.x.toFixed(2)}deg`);
      stage.style.setProperty("--ty", `${current.y.toFixed(2)}deg`);
      stage.style.setProperty("--mx", (current.x / 12).toFixed(3));
      stage.style.setProperty("--my", (-current.y / 6).toFixed(3));
      const settled = Math.abs(target.x - current.x) < 0.02 && Math.abs(target.y - current.y) < 0.02;
      raf = settled ? 0 : requestAnimationFrame(tick);
    };
    const move = (event: MouseEvent) => {
      const rect = zone.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      target = { x: x * 12, y: -y * 6 };
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

  /* ---------- Les données de la démo (celles du téléphone) ---------- */
  const invoiceRows = copy.scenarios[0].rows;
  const invoice = copy.scenarios[0];
  const openRows = invoiceRows.filter((r) => r.badge !== "paid");
  const lateSum = openRows.filter((r) => r.badge === "late").reduce((s, r) => s + r.amount, 0);
  const waitBase = openRows.filter((r) => r.badge !== "late").reduce((s, r) => s + r.amount, 0);
  // Le tableau de bord ne change qu'au retour du tour « facture » : payée, elle entre dans le CA du mois.
  const paidIn = !isQuote && is("back");
  const goalTarget = booted ? copy.goalFrom + (paidIn ? invoice.amount : 0) : 0;
  const collectTarget = booted ? lateSum + waitBase : 0;
  const invoiceCount = invoiceRows.length + (paidIn ? 1 : 0);
  const basketTarget = booted ? (invoiceRows.reduce((s, r) => s + r.amount, 0) + (paidIn ? invoice.amount : 0)) / invoiceCount : 0;
  const pastSales = SALES_PAID.reduce((s, v) => s + v, 0) * copy.scale;

  const goal = useCountUp(goalTarget, 1800, playing);
  const collect = useCountUp(collectTarget, 1600, playing);
  const basket = useCountUp(basketTarget, 1700, playing);
  const past = useCountUp(booted ? pastSales : 0, 1800, playing);
  const salesTotal = past + goal;
  const avg = salesTotal / 12;
  const goalPct = Math.min(100, Math.round((goal / copy.goalTotal) * 100));
  const remaining = Math.max(0, copy.goalTotal - goal);

  // Top clients : ce qu'ils ont rapporté ; Maison Laurent entre dans le classement une fois payée.
  const topClients = [
    ...invoiceRows.map((r) => ({ name: r.client, amount: r.amount, fresh: false })),
    ...(paidIn ? [{ name: invoice.client, amount: invoice.amount, fresh: true }] : []),
  ].sort((a, b) => b.amount - a.amount).slice(0, 3);
  const topMax = Math.max(...topClients.map((c) => c.amount));

  // Éditeur de Robi AI : les montants du document.
  const ht = scenario.amount / 1.2;
  const docTotal = useCountUp(is("fillTotal") ? scenario.amount : 0, 1400, playing);
  const docHt = docTotal / 1.2;

  // Liste : factures ou devis du scénario, la nouvelle ligne en tête.
  const content = is("clickDash") ? "dash" : is("list") ? "list" : "dash";
  const robiOpen = is("robi") && !is("list");
  const done = is("notif");
  const badge = done ? scenario.doneBadge : "sent";
  const listRows = scenario.rows;
  const today = useMemo(() => new Date(), []);
  const dateFmt = useMemo(() => new Intl.DateTimeFormat(copy.locale, { day: "2-digit", month: "2-digit", year: "2-digit" }), [copy.locale]);
  const dayOffset = (days: number) => dateFmt.format(new Date(today.getTime() + days * 86400000));
  const monthTitle = useMemo(() => new Intl.DateTimeFormat(copy.locale, { month: "long", year: "numeric" }).format(today), [copy.locale, today]);
  const monthTotal = listRows.reduce((s, r) => s + r.amount, 0) + scenario.amount;
  const rowDates = [-6, -12, -47];
  const history = [
    { key: "created", label: scenario.created, time: "20:12", on: true },
    { key: "sent", label: scenario.sent, time: "20:13", on: true },
    { key: "opened", label: copy.detail.emailOpen, time: "20:30", on: is("opened") },
    { key: "done", label: scenario.doneHistory, time: "20:41", on: done },
  ].filter((h) => h.on).reverse();

  const spoken = step === "typing" ? prompt.slice(0, typed) : "";
  const clickKey = CLICKS.includes(step) ? `${scenarioIndex}-${step}` : "";
  const mark = <Bot strokeWidth={2.2} aria-hidden="true" />;
  const salesMax = SALES_SCALE * copy.scale;

  const flags = {
    "data-step": step,
    "data-kind": scenario.kind,
    "data-playing": playing,
    "data-content": content,
    "data-robi": robiOpen,
    "data-typing": step === "typing",
    "data-msg": is("sendMsg"),
    "data-reply": is("reply"),
    "data-client": is("fillClient"),
    "data-line": is("fillLine"),
    "data-total": is("fillTotal"),
    "data-ask": is("ask"),
    "data-yes": is("yes"),
    "data-sending": step === "sending",
    "data-fly": step === "fly",
    "data-chip": step === "sent" || step === "list",
    "data-selected": is("clickRow"),
    "data-toast": step === "opened" || step === "notif",
    "data-done": done,
    "data-back": paidIn,
    "data-boot": booted,
    "data-clear": step === "clear",
  };

  return (
    <div ref={stageRef} className={styles.stage} {...flags} aria-label={d.stageAlt} role="img">
      <div className={styles.light} aria-hidden="true" />
      <div className={styles.dust} aria-hidden="true">
        {dust.map((p, i) => <i key={i} style={{ "--x": `${p.x}%`, "--size": `${p.size}px`, "--dur": `${p.dur}s`, "--delay": `${p.delay}s` } as CSSProperties} />)}
      </div>
      <span className={styles.ripple} aria-hidden="true" />
      <span className={`${styles.ripple} ${styles.rippleLate}`} aria-hidden="true" />

      <div className={styles.float}>
        <div className={styles.tilt}>
          <div className={styles.turn}>
            <div className={styles.laptop}>
              {/* ---- Le plateau : clavier et pavé tactile, vus d'en haut ---- */}
              <div className={styles.deck} aria-hidden="true">
                <div className={styles.keyboard}><span className={styles.keys} /></div>
                <div className={styles.trackpad} />
                <div className={styles.lip} />
              </div>
              <div className={styles.hinge} aria-hidden="true" />

              {/* ---- L'écran : épaisseur, cadre, dalle ---- */}
              <div className={styles.lid}>
                {lidSlabs.map((i) => <div key={i} className={styles.lidSlab} style={{ "--i": i } as CSSProperties} aria-hidden="true" />)}
                <div className={`${styles.lidSlab} ${styles.lidBack}`} aria-hidden="true"><Bot size={54} strokeWidth={1.5} /></div>
                <div className={styles.frame}>
                  <div className={styles.bezel}>
                    <span className={styles.notch} aria-hidden="true"><i /></span>
                    <div className={styles.screen}>
                      <div ref={uiRef} className={styles.ui} aria-hidden="true">
                        {/* ================= Menu latéral ================= */}
                        <aside className={styles.side}>
                          <span className={styles.logo}><i>{mark}</i>Robi <b>AI</b></span>
                          <nav className={styles.nav}>
                            <span className={styles.navItem} data-active={content === "dash" && !robiOpen} data-cursor="nav-dashboard"><LayoutGrid size={17} />{d.nav.dashboard}</span>
                            <span className={`${styles.navItem} ${styles.navRobi}`} data-cursor="nav-robi"><Bot size={17} strokeWidth={2.2} />{d.nav.robi}</span>
                            <small>{d.nav.documents}</small>
                            <span className={styles.navItem} data-active={content === "list" && isQuote}><FileText size={17} />{d.nav.quotes}</span>
                            <span className={styles.navItem} data-active={content === "list" && !isQuote}><FileCheck size={17} />{d.nav.invoices}</span>
                            <small>{d.nav.management}</small>
                            <span className={styles.navItem}><Users size={17} />{d.nav.clients}</span>
                            <span className={styles.navItem}><Package size={17} />{d.nav.products}</span>
                          </nav>
                          <div className={styles.sideFoot}>
                            <span className={styles.theme}><i data-on="true"><Sun size={13} /></i><i><Moon size={13} /></i></span>
                            <span className={styles.navItem}><Settings size={17} />{d.nav.settings}</span>
                          </div>
                        </aside>

                        <main className={styles.main}>
                          {/* ================= Tableau de bord ================= */}
                          <section key={`dash-${loop}`} className={`${styles.page} ${styles.dash}`}>
                            <Card icon={<Activity size={17} />} title={d.cards.health}>
                              <small className={styles.kicker}>{d.cards.toCollect} · {fill(d.cards.invoicesCount, openRows.length)}</small>
                              <strong className={styles.big}>{money0.format(Math.round(collect))}</strong>
                              <span className={styles.pills}>
                                <em data-tone="late">{fill(d.cards.late, openRows.filter((r) => r.badge === "late").length)}</em>
                                <em data-tone="wait">{fill(d.cards.pending, openRows.filter((r) => r.badge !== "late").length)}</em>
                              </span>
                              <span className={styles.split}>
                                <i data-tone="wait" style={{ flexGrow: waitBase }} />
                                <i data-tone="late" style={{ flexGrow: lateSum }} />
                              </span>
                              <span className={styles.legend}><span data-tone="wait">{d.cards.waiting} {money0.format(waitBase)}</span><span data-tone="late">{d.cards.lateShort} {money0.format(lateSum)}</span></span>
                            </Card>

                            <Card icon={<Calendar size={17} />} title={d.cards.goal}>
                              <small className={styles.kicker}>{d.cards.goalMonth} ({today.getFullYear()})</small>
                              <strong className={styles.big} data-glow={paidIn}>{money0.format(Math.round(goal))}</strong>
                              <span className={styles.pills}><em data-tone="lime"><Star size={10} strokeWidth={2.6} />{d.cards.goal} : {money0.format(copy.goalTotal)}</em></span>
                              <span className={styles.progress}><i style={{ width: `${goalPct}%` }} /></span>
                              <span className={styles.legend}><span>{goalPct} % {d.cards.reached}</span><span>{d.cards.remaining} {money0.format(Math.round(remaining))}</span></span>
                            </Card>

                            <Card icon={<TrendingUp size={17} />} title={d.cards.avg}>
                              <small className={styles.kicker}>{d.cards.avgMonth} ({today.getFullYear()})</small>
                              <strong className={styles.big}>{money0.format(Math.round(avg))}</strong>
                              <span className={styles.pills}><em data-tone="lime"><Activity size={10} strokeWidth={2.6} />{d.cards.caTotal} : {money0.format(Math.round(salesTotal))}</em></span>
                              <span className={styles.legend} data-trend="true">
                                <span><TrendingDown size={11} />{copy.dashboard.months[10]} {money0.format(SALES_PAID[10] * copy.scale)}</span>
                                <span><TrendingUp size={11} />{copy.dashboard.months[11]} {money0.format(Math.round(goal))}</span>
                              </span>
                            </Card>

                            <Card icon={<Receipt size={17} />} title={d.cards.basket}>
                              <small className={styles.kicker}>{d.cards.basketSub} ({today.getFullYear()})</small>
                              <strong className={styles.big}>{money0.format(Math.round(basket))}</strong>
                              <span className={styles.wide}><Activity size={10} strokeWidth={2.6} />{fill(d.cards.basketCount, invoiceCount)}</span>
                            </Card>

                            <div className={styles.stack}>
                              <div className={`${styles.card} ${styles.newCard}`}>
                                <span className={styles.cardTitle}>{d.cards.newInvoice}</span>
                                <span className={styles.newDesc}>{d.cards.newInvoiceDesc}</span>
                                <span className={styles.newBtn}><FilePlus size={15} />{d.cards.create}</span>
                              </div>
                              <Card icon={<Users size={17} />} title={d.cards.topClients} className={styles.topCard}>
                                <div className={styles.top}>
                                  {topClients.map((c, i) => (
                                    <div key={c.name} className={styles.topRow} data-fresh={c.fresh} style={{ "--w": `${(c.amount / topMax) * 100}%`, "--i": i } as CSSProperties}>
                                      <span><b>{c.name}</b><em>{money0.format(c.amount)}</em></span>
                                      <i />
                                    </div>
                                  ))}
                                </div>
                              </Card>
                            </div>

                            <div className={`${styles.card} ${styles.salesCard}`}>
                              <div className={styles.salesHead}>
                                <span className={styles.cardTitle}>{d.cards.sales}</span>
                                <span className={styles.salesTotal}><small>{d.cards.total}</small>{money0.format(Math.round(salesTotal))}</span>
                              </div>
                              <span className={styles.salesLegend}><span data-tone="lime">{d.cards.paid}</span><span data-tone="dark">{d.cards.pendingLegend}</span></span>
                              <div className={styles.chart}>
                                <div className={styles.grid} aria-hidden="true">
                                  {[4, 3, 2, 1, 0].map((q) => <span key={q}><small>{q === 0 ? "0" : compact.format((salesMax * q) / 4)}</small></span>)}
                                </div>
                                <div className={styles.bars}>
                                  {SALES_PENDING.map((pending, i) => {
                                    const paidValue = i === 11 ? goal : SALES_PAID[i] * copy.scale * (booted ? 1 : 0);
                                    const pendingValue = i === 11 ? collect : pending * copy.scale * (booted ? 1 : 0);
                                    return (
                                      <span key={i} className={styles.col} style={{ "--i": i } as CSSProperties} data-current={i === 11}>
                                        <span className={styles.colStack}>
                                          <i className={styles.pending} style={{ height: `${(pendingValue / salesMax) * 100}%` }} />
                                          <i className={styles.paid} style={{ height: `${(paidValue / salesMax) * 100}%` }} />
                                        </span>
                                        <small>{copy.dashboard.months[i]}</small>
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </section>

                          {/* ================= Liste des factures / devis ================= */}
                          <section className={`${styles.page} ${styles.list}`}>
                            <div className={styles.listPane}>
                              <div className={styles.listHead}>
                                <span className={styles.listIcon}><FileCheck size={19} /></span>
                                <span className={styles.listTitle}>{isQuote ? copy.list.quotes : copy.list.invoices}</span>
                                <span className={styles.search}><Search size={14} />{copy.list.search}</span>
                                <span className={styles.createBtn}><Plus size={14} strokeWidth={2.6} />{copy.list.create}</span>
                              </div>
                              <div className={styles.tabs}>
                                {scenario.tabs.map((tab, i) => <span key={tab} data-active={i === 0}>{tab}<b>{scenario.tabCounts[i]}</b></span>)}
                              </div>
                              <div className={styles.table}>
                                <div className={styles.th}>{d.list.cols.map((c) => <span key={c}>{c}</span>)}</div>
                                <div className={styles.group}><span>{monthTitle}</span><b>{money.format(monthTotal)}</b></div>
                                <div key={`new-${scenarioIndex}-${loop}`} className={`${styles.tr} ${styles.trNew}`} data-cursor="row-new">
                                  <span className={styles.num}>{scenario.number}</span>
                                  <span className={styles.who}>{scenario.client}</span>
                                  <span>{dayOffset(0)}</span>
                                  <span>{dayOffset(30)}</span>
                                  <span>{done && !isQuote ? dayOffset(0) : "–"}</span>
                                  <span className={styles.amt}>{money.format(scenario.amount)}</span>
                                  <span><i key={badge} className={styles.badge} data-badge={badge}>{copy.badges[badge]}</i></span>
                                </div>
                                {listRows.map((r, i) => (
                                  <div key={r.number} className={styles.tr}>
                                    <span className={styles.num}>{r.number}</span>
                                    <span className={styles.who}>{r.client}</span>
                                    <span>{dayOffset(rowDates[i] ?? -20)}</span>
                                    <span>{dayOffset((rowDates[i] ?? -20) + 30)}</span>
                                    <span>{r.badge === "paid" ? dayOffset(-2) : "–"}</span>
                                    <span className={styles.amt}>{money.format(r.amount)}</span>
                                    <span><i className={styles.badge} data-badge={r.badge}>{copy.badges[r.badge]}</i></span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className={styles.detailPane}>
                              <div className={styles.empty}>
                                <span><FileCheck size={24} /></span>
                                <b>{d.list.emptyTitle}</b>
                                <small>{d.list.emptyDesc}</small>
                              </div>
                              <div className={styles.detail}>
                                <div className={styles.detailTop}>
                                  <i key={badge} className={styles.badge} data-badge={badge}>{copy.badges[badge]}</i>
                                  <small>N° {scenario.number}</small>
                                </div>
                                <strong className={styles.detailClient}>{scenario.client}</strong>
                                <span className={styles.detailAmount}>{money.format(scenario.amount)}</span>
                                {/* Aperçu du PDF : l'en-tête de l'entreprise de démo, la ligne, le total. */}
                                <div className={styles.paper}>
                                  <div className={styles.paperHead}>
                                    <span className={styles.paperLogo}>{initialsOf(copy.pdf.issuer)}</span>
                                    <span className={styles.paperIssuer}><b>{copy.pdf.issuer}</b><small>{copy.pdf.issuerLine}</small></span>
                                    <span className={styles.paperTitle}>{scenario.docLabel}<em>{scenario.number}</em></span>
                                  </div>
                                  <div className={styles.paperBody}>
                                    <span className={styles.paperRow}><em>{copy.pdf.designation}</em><em>{copy.pdf.amount}</em></span>
                                    <span className={styles.paperLine}><b>{scenario.service}</b><b>{money.format(ht)}</b></span>
                                    <span className={styles.paperGhost}><i /><i /></span>
                                    <span className={styles.paperTotal}><em>{copy.detail.total}</em><b>{money.format(scenario.amount)}</b></span>
                                    {isQuote ? (
                                      <span className={styles.paperSign}>
                                        <em>{copy.pdf.approve}</em>
                                        <svg width="96" height="30" viewBox="0 0 120 44" fill="none" aria-hidden="true">
                                          <path d="M6 32 C 14 10, 24 6, 30 22 C 34 34, 42 36, 48 20 C 52 9, 60 10, 62 24 C 64 34, 74 30, 80 18 C 86 8, 96 14, 114 12" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
                                        </svg>
                                      </span>
                                    ) : (
                                      <span className={styles.paperPay}><CreditCard size={12} strokeWidth={2.4} />{copy.pdf.payOnline}</span>
                                    )}
                                  </div>
                                </div>
                                <span className={styles.historyTitle}>{copy.detail.history}</span>
                                <ol className={styles.timeline}>
                                  {history.map((h, i) => (
                                    <li key={h.key} data-latest={i === 0}>
                                      <i />
                                      <strong>{h.label}</strong>
                                      <small>{copy.detail.on} {dayOffset(0)} {copy.detail.at} {h.time}</small>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            </div>
                          </section>
                        </main>

                        {/* ================= Robi AI : la conversation et l'éditeur ================= */}
                        <section className={styles.robi}>
                          <div className={styles.robiBar}>
                            <span className={styles.robiPill}><i>{mark}</i>Robi <b>AI</b></span>
                            <X size={20} className={styles.robiClose} />
                          </div>
                          <div className={styles.robiBody}>
                            <div className={styles.chat}>
                              <div className={styles.chatTop}>
                                <span className={styles.segment}>
                                  <i data-on={isQuote}>{d.robi.quote}</i>
                                  <i data-on={!isQuote}>{d.robi.invoice}</i>
                                </span>
                                <RotateCcw size={16} className={styles.chatReset} />
                              </div>
                              <div className={styles.messages}>
                                <span className={styles.hello}>{d.robi.greeting}</span>
                                <span className={`${styles.msg} ${styles.msgUser} ${styles.msgPrompt}`}><Mic size={12} strokeWidth={2.4} />{prompt}</span>
                                <span className={`${styles.msg} ${styles.msgRobi} ${styles.msgReply}`}><i>{mark}</i><span>{scenario.reply}</span></span>
                                <span className={`${styles.msg} ${styles.msgRobi} ${styles.msgAsk}`}><i>{mark}</i><span>{scenario.ask}</span></span>
                                <span className={`${styles.msg} ${styles.msgUser} ${styles.msgYes}`}><Mic size={12} strokeWidth={2.4} />{scenario.yes}</span>
                              </div>
                              <div className={styles.input}>
                                <Paperclip size={16} className={styles.clip} />
                                <span className={styles.field}>
                                  {spoken ? <>{spoken}<i className={styles.caret} /></> : <em>{d.robi.placeholder}</em>}
                                </span>
                                <span className={styles.wave}>
                                  {waveHeights.map((h, i) => <i key={i} style={{ height: h * 0.6, "--bar-delay": `${i * 0.06}s` } as CSSProperties} />)}
                                </span>
                                <span className={styles.mic} data-cursor="mic"><Mic size={16} strokeWidth={2.3} /></span>
                                <span className={styles.send} data-cursor="send"><ArrowRight size={16} strokeWidth={2.4} /></span>
                              </div>
                            </div>

                            <div className={styles.editor}>
                              <div className={styles.editorBar}>
                                <ArrowLeft size={20} />
                                <span className={styles.editorTitle}>{isQuote ? d.robi.newQuote : d.robi.newInvoice}</span>
                                <span className={styles.saveBtn}><Save size={16} /></span>
                                <span className={styles.readyBtn} data-cursor="ready"><Send size={15} strokeWidth={2.4} />{d.robi.ready}</span>
                              </div>
                              <div className={styles.editorBody} data-cursor="rest-editor">
                                <div className={styles.sheet}>
                                  <div className={styles.metaGrid}>
                                    <div className={styles.metaCol}>
                                      <div className={styles.box}>
                                        <small className={styles.boxLabel}>{d.robi.recipient}</small>
                                        <span className={styles.searchField}><Search size={13} />{copy.list.search}</span>
                                        <span className={styles.clientCard}>
                                          <i>{initialsOf(scenario.client)}</i>
                                          <span><b>{scenario.client}</b><small>{d.robi.clientAddress}</small></span>
                                          <Check size={15} strokeWidth={2.6} />
                                        </span>
                                      </div>
                                      <div className={styles.box}>
                                        <small className={styles.boxLabel}><MapPin size={11} />{d.robi.issuer}</small>
                                        <b className={styles.issuer}>{copy.pdf.issuer}</b>
                                        <small className={styles.issuerLine}>{d.robi.issuerAddress}</small>
                                      </div>
                                    </div>
                                    <div className={`${styles.box} ${styles.dates}`}>
                                      <small className={styles.boxLabel}>{d.robi.dates}</small>
                                      <span><em>{d.robi.number}</em><b>{scenario.number}</b></span>
                                      <span><em>{d.robi.issueDate}</em><b>{dayOffset(0)}</b></span>
                                      <span><em>{d.robi.due}</em><b>{dayOffset(30)}</b></span>
                                      <span><em>{d.robi.terms}</em><b>{d.robi.termsValue}</b></span>
                                    </div>
                                  </div>
                                  <div className={styles.lines}>
                                    <div className={styles.lh}><span>{d.robi.desc}</span><span>{d.robi.qty}</span><span>{d.robi.price}</span><span>{d.robi.vat}</span><span>{d.robi.amount}</span></div>
                                    <div className={styles.lr}>
                                      <span><b>{scenario.service}</b></span><span>1</span><span>{money.format(ht)}</span><span>20 %</span><span><b>{money.format(ht)}</b></span>
                                    </div>
                                    <span className={styles.addLine}><Plus size={14} strokeWidth={2.6} />{d.robi.addLine}<ChevronDown size={14} /></span>
                                  </div>
                                  <div className={styles.totals}>
                                    <span><em>{d.robi.totalHt}</em><b>{money.format(docHt)}</b></span>
                                    <span><em>{copy.detail.vat} 20 %</em><b>{money.format(docTotal - docHt)}</b></span>
                                    <span className={styles.totalMain}><em>{d.robi.totalTtc}</em><b>{money.format(docTotal)}</b></span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </section>

                        {/* Repères invisibles pour le curseur (positions de repos). */}
                        <span className={styles.restList} data-cursor="rest-list" />
                        <span className={styles.restDash} data-cursor="rest-dash" />

                        {/* ================= Notification du Mac ================= */}
                        <div key={done ? "done" : "opened"} className={styles.notif}>
                          <span className={styles.notifIcon}>{mark}</span>
                          <span className={styles.notifText}>
                            <small>{d.notifApp} · {copy.now}</small>
                            <strong>{done ? scenario.doneTitle : copy.openedTitle}</strong>
                            <span>{done ? scenario.doneLine : scenario.openedLine}</span>
                          </span>
                        </div>

                        {/* ================= Le curseur ================= */}
                        <div ref={cursorRef} className={styles.cursor}>
                          {clickKey && <span key={clickKey} className={styles.clickRing} />}
                          <svg width="22" height="26" viewBox="0 0 22 26" aria-hidden="true">
                            <path d="M2 2 L2 21 L7.2 16.6 L10.6 24 L14 22.5 L10.7 15.3 L17.6 15.3 Z" fill="#0d0630" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <span className={styles.glass} aria-hidden="true" />
                  </div>
                </div>
                <span className={styles.rim} aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
        <span className={styles.shadow} aria-hidden="true" />
      </div>

      {/* ---- Hors de l'écran : la bulle qui part, le chip « Envoyée à », les chips du pays ---- */}
      <div className={styles.flyer} aria-hidden="true">
        <span className={styles.trail} />
        <span className={styles.orb}><Send size={20} strokeWidth={2.4} /></span>
      </div>
      <div className={styles.chipWrap} aria-hidden="true">
        <div className={styles.sentChip}><span className={styles.sentRing} /><Check size={13} strokeWidth={3} />{scenario.sentChip}</div>
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
              <span className={styles.payIcon}><CreditCard size={15} strokeWidth={2.4} /></span>
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
