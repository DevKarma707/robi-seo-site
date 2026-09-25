"use client";

import { useEffect, useState, useSyncExternalStore, type CSSProperties } from "react";
import Image from "next/image";
import { ArrowDown, BadgeCheck, Bot, Check, Mic, Send, FileText, Search, Plus } from "lucide-react";
import type { HeroScenario, HeroStoryCopy } from "@/lib/i18n/heroStory";
import styles from "./HeroStory.module.css";

const waveHeights = [8, 14, 23, 12, 30, 20, 36, 17, 26, 40, 22, 32, 16, 28, 35, 18, 25, 12, 21, 9];
const phases = ["voice", "created", "sent", "paid"] as const;
const durations = [1800, 2400, 2400, 4200];

function subscribeToMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getServerMotion() { return true; }
function subscribeToMobile(callback: () => void) {
  const query = window.matchMedia("(max-width: 1023px)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
function getMobile() { return window.matchMedia("(max-width: 1023px)").matches; }
function getServerMobile() { return false; }

export function HeroStory({ copy }: { copy: HeroStoryCopy }) {
  // Les scénarios enchaînés (devis, puis facture). Sans scénarios dans la
  // copie, on retombe sur l'exemple historique unique.
  const scenarios: HeroScenario[] = copy.scenarios?.length ? copy.scenarios : [{
    kind: "invoice", prompt: copy.prompt, service: copy.service,
    statuses: [copy.creatingLabel, copy.createdLabel, copy.sentLabel, copy.paidLabel],
    details: [copy.voiceLabel, copy.reviewLabel, copy.sentDetail, copy.paidDetail],
  }];
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const scenario = scenarios[scenarioIndex % scenarios.length];
  const [phase, setPhase] = useState(0);
  const [spokenText, setSpokenText] = useState("");
  const [trackingStep, setTrackingStep] = useState(0);
  const reducedMotion = useSyncExternalStore(subscribeToMotion, getReducedMotion, getServerMotion);
  const mobile = useSyncExternalStore(subscribeToMobile, getMobile, getServerMobile);
  // Both cards loop; reduced motion keeps a static, readable example.
  const stage = reducedMotion ? 1 : phase;
  const playing = !reducedMotion;

  useEffect(() => {
    if (mobile || reducedMotion) return;
    const timer = setInterval(() => setTrackingStep((step) => (step + 1) % 8), 1870);
    return () => clearInterval(timer);
  }, [mobile, reducedMotion]);

  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => {
      // Fin d'un scénario : la carte suivante s'ouvre avec le scénario d'après.
      if (phase === phases.length - 1) setScenarioIndex((i) => (i + 1) % scenarios.length);
      setPhase((current) => (current + 1) % phases.length);
    }, durations[phase] * (mobile ? 1 : 1.1) * (phase === 0 ? 1.16 : 1));
    return () => clearTimeout(timer);
  }, [phase, playing, mobile, scenarios.length]);

  useEffect(() => {
    if (phase !== 0) { setSpokenText(scenario.prompt); return; }
    if (!playing) return;
    setSpokenText("");
    const step = Math.max(32, Math.round((durations[0] * (mobile ? 1 : 1.1) * 1.16 * 0.82) / scenario.prompt.length));
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setSpokenText(scenario.prompt.slice(0, index));
      if (index >= scenario.prompt.length) clearInterval(timer);
    }, step);
    return () => clearInterval(timer);
  }, [scenario.prompt, phase, playing, mobile]);

  const docLabel = scenario.kind === "quote" ? copy.quoteLabel : copy.invoiceLabel;
  const status = scenario.statuses[stage];
  const detail = scenario.details[stage];
  const StatusIcon = [Mic, Check, Send, BadgeCheck][stage];
  const trackingStates = [0, 1, 2].map((row) => {
    const step = reducedMotion ? 6 : trackingStep;
    return step >= row + 4 ? "paid" : step >= row + 1 ? "sent" : "created";
  });
  const sentCount = trackingStates.filter((state) => state === "sent").length;
  const paidCount = trackingStates.filter((state) => state === "paid").length;

  return (
    <div className={styles.story}>
      <figure className={styles.photo}>
        <Image
          src="/images/hero-atelier-4k.jpg"
          alt={copy.photoAlt}
          fill
          priority
          quality={90}
          sizes="(min-width: 1280px) 560px, (min-width: 1024px) 48vw, (min-width: 640px) 520px, 90vw"
          className={styles.portrait}
        />
        <div className={styles.photoShade} aria-hidden="true" />
        <figcaption className={styles.photoCaption}>{copy.photoCaption}</figcaption>
      </figure>

      <div className={styles.demo} data-playing={playing} data-stage={phases[stage]} data-mobile={mobile}>
        <div className={styles.voice}>
          <div className={styles.voiceTop}>
            <span className={styles.voiceLabel}><Mic size={14} aria-hidden="true" />{copy.voiceLabel}</span>
            <div className={styles.wave} aria-hidden="true">
              {waveHeights.map((height, i) => <i key={i} style={{ height, "--bar-delay": `${i * 0.055}s` } as CSSProperties} />)}
            </div>
          </div>
          <p className={styles.prompt}>
            « <span className={styles.promptText}>{stage === 0 ? spokenText : scenario.prompt}</span> »
          </p>
          <span className={styles.transfer} aria-hidden="true"><ArrowDown size={15} /></span>
        </div>

        {/* key = scénario : à chaque nouveau scénario, une nouvelle carte s'ouvre. */}
        <div key={`doc-${scenarioIndex}`} className={styles.document} data-kind={scenario.kind}>
          <div className={styles.documentTop}>
            <span className={styles.documentTitle}>
              {docLabel}<span className={styles.documentDot}>.</span>
            </span>
            <Bot size={27} color="#BEF221" strokeWidth={2} aria-hidden="true" />
          </div>
          <div className={styles.documentLines} aria-hidden="true"><i /><i /><i /></div>
          <div className={styles.service}><span>{scenario.service}</span><Check size={15} aria-hidden="true" /></div>
          <div className={styles.documentBottom}>
            <span className={styles.check}><StatusIcon size={17} strokeWidth={2.2} aria-hidden="true" /></span>
            <span key={stage} className={styles.statusText}><strong>{status}</strong><small>{detail}</small></span>
          </div>
          {mobile && <div className={styles.progress} aria-hidden="true">
            {[1, 2, 3].map((step) => <i key={step} data-complete={stage >= step} />)}
          </div>}
        </div>
      </div>
      <section className={styles.tracking} data-playing={playing} aria-label={copy.tracking.title}>
        <div className={styles.trackingHeader}>
          <span><FileText size={18} />{copy.tracking.title}</span>
          <span className={styles.trackingSearch}><Search size={12} />{copy.tracking.search}</span>
        </div>
        <div className={styles.trackingCreate}><Plus size={14} />{copy.tracking.create}</div>
        <div className={styles.trackingTabs}><span>{copy.tracking.all} <b>3</b></span><span>{copy.tracking.sent} <b>{sentCount}</b></span><span>{copy.tracking.paid} <b>{paidCount}</b></span></div>
        <div className={styles.trackingPeriod}><span>2026</span><strong>3 994,00 €</strong></div>
        <div className={styles.trackingRows}>
          {[0, 1, 2].map((row) => {
            const state = trackingStates[row];
            const Icon = state === "paid" ? BadgeCheck : state === "sent" ? Send : Check;
            return <div key={row} className={styles.trackingRow} data-state={state}>
              <span className={styles.trackingAvatar}>{["ML", "AD", "SB"][row]}</span>
              <div className={styles.trackingClient}><strong>{["Maison Laurent", "Atelier Dubois", "Studio Bernard"][row]}</strong><small>DEV-2026-00{row + 1}</small></div>
              <div className={styles.trackingAmount}><strong>{["1 240,00", "2 274,00", "480,00"][row]} €</strong>
                <span className={styles.trackingBadge}><Icon size={10} />{state === "paid" ? copy.tracking.paid : state === "sent" ? copy.tracking.sent : copy.tracking.draft}</span>
              </div>
            </div>;
          })}
        </div>
      </section>
    </div>
  );
}
