"use client";

import { useEffect, useState, useSyncExternalStore, type CSSProperties } from "react";
import Image from "next/image";
import { ArrowDown, BadgeCheck, Bot, Check, Mic, Pause, Play, RotateCcw, Send } from "lucide-react";
import type { HeroStoryCopy } from "@/lib/i18n/heroStory";
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
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState(0);
  const [spokenText, setSpokenText] = useState("");
  const [paused, setPaused] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeToMotion, getReducedMotion, getServerMotion);
  const mobile = useSyncExternalStore(subscribeToMobile, getMobile, getServerMobile);
  // The full lifecycle is a mobile proposal; desktop art direction is deferred.
  const stage = reducedMotion || !mobile ? 1 : phase;
  const playing = !paused && !reducedMotion && mobile;

  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => setPhase((current) => (current + 1) % phases.length), durations[phase]);
    return () => clearTimeout(timer);
  }, [phase, playing, run]);

  useEffect(() => {
    if (phase !== 0) { setSpokenText(copy.prompt); return; }
    if (!playing) return;
    setSpokenText("");
    const step = Math.max(32, Math.round((durations[0] * 0.82) / copy.prompt.length));
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setSpokenText(copy.prompt.slice(0, index));
      if (index >= copy.prompt.length) clearInterval(timer);
    }, step);
    return () => clearInterval(timer);
  }, [copy.prompt, phase, playing, run]);

  function replay() {
    setRun((current) => current + 1);
    setPhase(0);
    setPaused(false);
  }

  const status = mobile ? [copy.creatingLabel, copy.createdLabel, copy.sentLabel, copy.paidLabel][stage] : copy.draftLabel;
  const detail = [copy.voiceLabel, copy.reviewLabel, copy.sentDetail, copy.paidDetail][stage];
  const StatusIcon = [Mic, Check, Send, BadgeCheck][stage];

  return (
    <div className={styles.story}>
      <figure className={styles.photo}>
        <Image
          src="/images/hero-atelier.jpg"
          alt={copy.photoAlt}
          fill
          priority
          sizes="(min-width: 1280px) 465px, (min-width: 1024px) 40vw, (min-width: 640px) 480px, 85vw"
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
            « <span className={styles.promptText}>{stage === 0 ? spokenText : copy.prompt}</span> »
          </p>
          <span className={styles.transfer} aria-hidden="true"><ArrowDown size={15} /></span>
        </div>

        <div className={styles.document}>
          <div className={styles.documentTop}>
            <span key={`document-title-${stage}-${spokenText.toLocaleLowerCase().includes("facture")}`} className={styles.documentTitle}>
              {stage === 0 && !spokenText.toLocaleLowerCase().includes("facture") ? copy.quoteLabel : copy.invoiceLabel}<span className={styles.documentDot}>.</span>
            </span>
            <Bot size={27} color="#BEF221" strokeWidth={2} aria-hidden="true" />
          </div>
          <div className={styles.documentLines} aria-hidden="true"><i /><i /><i /></div>
          <div className={styles.service}><span>{copy.service}</span><Check size={15} aria-hidden="true" /></div>
          <div className={styles.documentBottom}>
            <span className={styles.check}><StatusIcon size={17} strokeWidth={2.2} aria-hidden="true" /></span>
            <span key={stage} className={styles.statusText}><strong>{status}</strong><small>{detail}</small></span>
          </div>
          {mobile && <div className={styles.progress} aria-hidden="true">
            {[1, 2, 3].map((step) => <i key={step} data-complete={stage >= step} />)}
          </div>}
        </div>
        <div className={styles.demoFooter}>
          <span>{copy.demoLabel}</span>
          {!reducedMotion && mobile && <div className={styles.playback}>
          <button type="button" onClick={() => setPaused((current) => !current)} aria-label={paused ? copy.resumeLabel : copy.pauseLabel} title={paused ? copy.resumeLabel : copy.pauseLabel}>
            {paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
          </button>
          <button type="button" onClick={replay} aria-label={copy.replayLabel} title={copy.replayLabel}>
            <RotateCcw size={13} aria-hidden="true" /><span>{copy.replayLabel}</span>
          </button>
          </div>}
        </div>
      </div>
    </div>
  );
}
