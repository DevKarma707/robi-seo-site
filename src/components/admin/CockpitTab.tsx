"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, ArrowRight, CalendarClock, CheckCircle2, Megaphone,
  RefreshCw, ServerCrash, Users, XCircle,
} from "lucide-react";
import {
  computeDisplayedSold, fetchAppStats, fetchHealthReport, fetchLaunchConfig,
  type AppStats, type HealthReport, type LaunchConfig,
} from "@/lib/adminApi";
import { ACCENT_INK, btn, card, kpiLabel, kpiValue, sectionTitle } from "./ui";
import { CountUp } from "./motion";

/**
 * Le cockpit : ce qui brûle, et ce qui arrive.
 *
 * Les autres onglets répondent chacun à une question précise, mais aucun ne
 * répond à « qu'est-ce que je dois traiter maintenant ». Il fallait ouvrir
 * Santé, Pilotage et Lancement puis recouper soi-même — donc en pratique on
 * ne le faisait pas, et un incident pouvait durer des semaines sans que
 * personne le voie.
 *
 * Cet onglet n'affiche aucune donnée qui lui soit propre : il relit les trois
 * sources existantes et n'en tire que des alertes actionnables. Toute alerte
 * porte un seuil explicite et un lien vers l'onglet qui la traite — sinon
 * c'est de la décoration, et on réapprend à l'ignorer.
 */

const RED = "#f87171";
const AMBER = "#fbbf24";

type Severity = "down" | "warn" | "info";
type TabId =
  | "pilotage" | "kanban" | "reseaux" | "fichiers" | "sante"
  | "acquisition" | "influenceurs" | "analytics" | "blog" | "lancement";

interface Alert {
  id: string;
  severity: Severity;
  domain: "Technique" | "Produit" | "Marketing" | "Échéance";
  title: string;
  /** Ce qu'il faut faire. Une alerte sans geste associé n'en est pas une. */
  action: string;
  goTo?: TabId;
}

const SEVERITY_RANK: Record<Severity, number> = { down: 0, warn: 1, info: 2 };

const SEVERITY_STYLE: Record<Severity, { color: string; icon: React.ReactNode }> = {
  down: { color: RED, icon: <XCircle size={15} /> },
  warn: { color: AMBER, icon: <AlertTriangle size={15} /> },
  info: { color: ACCENT_INK, icon: <CheckCircle2 size={15} /> },
};

/** Jours restants avant une date ISO. Négatif si dépassée. */
const daysUntil = (iso: string): number =>
  Math.ceil((Date.parse(iso) - Date.now()) / 86_400_000);

const pct = (part: number, whole: number): number =>
  whole > 0 ? Math.round((part / whole) * 100) : 0;

/**
 * Construit la liste d'alertes à partir des trois sources.
 *
 * Les seuils sont ici, en un seul endroit, plutôt que dispersés dans le
 * rendu : ce sont eux qui décident de ce qui remonte, ils méritent d'être
 * lisibles et discutables.
 */
export function buildAlerts(
  stats: AppStats | null,
  health: HealthReport | null,
  launch: LaunchConfig | null,
): Alert[] {
  const alerts: Alert[] = [];

  // — Technique : la fonction santé calcule déjà des problèmes en clair.
  if (health) {
    health.problems.forEach((problem, i) => {
      alerts.push({
        id: `health-${i}`,
        severity: health.severity === "down" ? "down" : "warn",
        domain: "Technique",
        title: problem,
        action: "Ouvrir Santé pour voir les signatures d'erreur.",
        goTo: "sante",
      });
    });
  }

  // — Produit : des inscrits qui ne reviennent jamais est le symptôme d'un
  //   mur au premier usage, pas d'un problème d'acquisition. Seuil à 50 %
  //   sur au moins 5 inscrits, pour ne pas s'alarmer sur 2 comptes de test.
  if (stats && stats.signups.total >= 5) {
    const share = pct(stats.signups.neverSignedIn, stats.signups.total);
    if (share >= 50) {
      alerts.push({
        id: "never-signed-in",
        severity: "down",
        domain: "Produit",
        title: `${stats.signups.neverSignedIn} inscrits sur ${stats.signups.total} (${share} %) ne sont jamais revenus`,
        action: "Ils ont buté sur quelque chose au premier usage. Vérifier le parcours d'inscription et le paiement.",
        goTo: "pilotage",
      });
    }
  }

  // — Produit : aucune conversion malgré du volume. Payer de l'acquisition
  //   avant d'avoir réglé ça revient à remplir un seau percé.
  if (stats && stats.signups.total >= 10 && stats.soldSeats === 0) {
    alerts.push({
      id: "no-conversion",
      severity: "down",
      domain: "Produit",
      title: `${stats.signups.total} inscrits et aucune vente`,
      action: "Confirmer que le paiement fonctionne de bout en bout avant toute dépense d'acquisition.",
      goTo: "pilotage",
    });
  }

  // — Marketing : pas un incident, mais l'info qui décide de la semaine.
  if (stats && stats.signups.j7 === 0 && stats.signups.total > 0) {
    alerts.push({
      id: "no-signups-7d",
      severity: "warn",
      domain: "Marketing",
      title: "Aucune inscription depuis 7 jours",
      action: "Relancer la diffusion : les visuels Instagram sont prêts dans Réseaux.",
      goTo: "reseaux",
    });
  }

  // — Échéance : la date limite de l'offre de lancement.
  if (launch?.deadline) {
    const left = daysUntil(launch.deadline);
    if (left < 0) {
      alerts.push({
        id: "deadline-passed",
        severity: "down",
        domain: "Échéance",
        title: `La date limite de l'offre est dépassée de ${Math.abs(left)} j`,
        action: "Retirer l'offre ou repousser la date — une échéance périmée affichée est trompeuse.",
        goTo: "lancement",
      });
    } else if (left <= 14) {
      alerts.push({
        id: "deadline-soon",
        severity: "warn",
        domain: "Échéance",
        title: `Date limite de l'offre dans ${left} j`,
        action: "Préparer la communication de fin d'offre, ou décider de la prolonger.",
        goTo: "lancement",
      });
    }
  }

  // — Échéance : les places de lancement qui s'épuisent.
  if (launch) {
    const sold = computeDisplayedSold(launch);
    const left = launch.totalSeats - sold;
    if (launch.enabled && left <= launch.totalSeats * 0.1) {
      alerts.push({
        id: "seats-low",
        severity: "warn",
        domain: "Échéance",
        title: `Il reste ${left} places sur ${launch.totalSeats}`,
        action: "Décider du prix après l'offre de lancement avant d'arriver à zéro.",
        goTo: "lancement",
      });
    }
  }

  return alerts.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
}

function Kpi({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className={`${card} p-4`}>
      <p className={kpiLabel}>{label}</p>
      <p className={`${kpiValue} mt-3`}><CountUp value={value} /></p>
      {sub && <p className="text-[11px] mt-1.5 text-slate-500">{sub}</p>}
    </div>
  );
}

function Section({
  title, icon, children, onGoTo, goToLabel,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onGoTo?: () => void;
  goToLabel?: string;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className={`${sectionTitle} flex items-center gap-2`}>
          <span className="text-slate-400">{icon}</span>
          {title}
        </h2>
        {onGoTo && (
          <button onClick={onGoTo} className={btn}>
            {goToLabel} <ArrowRight size={13} />
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

const CockpitTab: React.FC<{ onNavigate?: (tab: TabId) => void }> = ({ onNavigate }) => {
  const [stats, setStats] = useState<AppStats | null>(null);
  const [health, setHealth] = useState<HealthReport | null>(null);
  const [launch, setLaunch] = useState<LaunchConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  /**
   * Chaque source est chargée indépendamment : si l'une tombe, le cockpit
   * affiche quand même les autres. Un tableau de bord de supervision qui
   * devient aveugle dès qu'une brique tousse manque son objet.
   *
   * `apply` est séparé de la commande de chargement pour que l'effet de
   * montage n'appelle aucun setState de façon synchrone — ce que React
   * déconseille, parce que cela déclenche un rendu en cascade.
   */
  const apply = useCallback((
    results: PromiseSettledResult<unknown>[],
  ) => {
    const [s, h, l] = results;
    const failed: string[] = [];
    if (s.status === "fulfilled") setStats(s.value as AppStats); else failed.push("Statistiques");
    if (h.status === "fulfilled") setHealth(h.value as HealthReport); else failed.push("Santé");
    if (l.status === "fulfilled") setLaunch(l.value as LaunchConfig); else failed.push("Lancement");
    setErrors(failed);
    setLoading(false);
  }, []);

  const fetchAll = () => Promise.allSettled([
    fetchAppStats(), fetchHealthReport(7), fetchLaunchConfig(),
  ]);

  /** Rafraîchissement manuel : déclenché par un geste, pas par un rendu. */
  const refresh = useCallback(async () => {
    setLoading(true);
    apply(await fetchAll());
  }, [apply]);

  useEffect(() => {
    // `loading` vaut déjà true au premier rendu : rien à poser avant l'await.
    let cancelled = false;
    void (async () => {
      const results = await fetchAll();
      if (!cancelled) apply(results);
    })();
    return () => { cancelled = true; };
  }, [apply]);

  const alerts = useMemo(() => buildAlerts(stats, health, launch), [stats, health, launch]);
  const blocking = alerts.filter((a) => a.severity === "down").length;

  return (
    <div className="space-y-8">
      {/* En-tête : verdict global + rafraîchissement */}
      <div className={`${card} p-5 flex items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <span style={{ color: blocking ? RED : alerts.length ? AMBER : ACCENT_INK }}>
            {blocking ? <XCircle size={22} /> : alerts.length ? <AlertTriangle size={22} /> : <CheckCircle2 size={22} />}
          </span>
          <div>
            <p className="a-display font-extrabold text-[19px] tracking-tight text-slate-900">
              {blocking > 0
                ? `${blocking} point${blocking > 1 ? "s" : ""} à traiter en urgence`
                : alerts.length > 0
                  ? `${alerts.length} point${alerts.length > 1 ? "s" : ""} à surveiller`
                  : "Rien à traiter"}
            </p>
            <p className="text-[12px] text-slate-500 mt-0.5">
              {errors.length > 0
                ? `Sources indisponibles : ${errors.join(", ")}. Le reste est à jour.`
                : "Santé, produit, marketing et échéances, recoupés."}
            </p>
          </div>
        </div>
        <button onClick={() => void refresh()} disabled={loading} className={btn}>
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Actualiser
        </button>
      </div>

      {/* Urgences */}
      <Section title="À traiter" icon={<AlertTriangle size={16} />}>
        {alerts.length === 0 ? (
          <div className={`${card} p-6 text-center`}>
            <CheckCircle2 size={22} className="mx-auto mb-2" style={{ color: ACCENT_INK }} />
            <p className="text-sm font-bold text-slate-700">Aucun signal anormal</p>
            <p className="text-[12px] text-slate-500 mt-1">
              {loading ? "Chargement…" : "Rien ne remonte sur les seuils surveillés."}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {alerts.map((a) => (
              <li key={a.id} className={`${card} p-4 flex items-start gap-3`}>
                <span className="mt-0.5 shrink-0" style={{ color: SEVERITY_STYLE[a.severity].color }}>
                  {SEVERITY_STYLE[a.severity].icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {a.domain}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 mt-1">{a.title}</p>
                  <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">{a.action}</p>
                </div>
                {a.goTo && onNavigate && (
                  <button onClick={() => onNavigate(a.goTo!)} className={`${btn} shrink-0`}>
                    Ouvrir <ArrowRight size={13} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Marketing */}
      <Section
        title="Marketing"
        icon={<Megaphone size={16} />}
        onGoTo={onNavigate && (() => onNavigate("acquisition"))}
        goToLabel="Acquisition"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi label="Inscrits (7 j)" value={stats?.signups.j7 ?? "—"} sub={`${stats?.signups.j30 ?? "—"} sur 30 j`} />
          <Kpi label="Total inscrits" value={stats?.signups.total ?? "—"} />
          <Kpi label="Ventes" value={stats?.soldSeats ?? "—"} sub="places réellement payées" />
          <Kpi
            label="Conversion"
            value={stats ? `${stats.conversionRate} %` : "—"}
            sub="inscrits devenus Pro"
          />
        </div>
      </Section>

      {/* Produit */}
      <Section
        title="Produit"
        icon={<Users size={16} />}
        onGoTo={onNavigate && (() => onNavigate("pilotage"))}
        goToLabel="Pilotage"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi label="Actifs (7 j)" value={stats?.active.j7 ?? "—"} />
          <Kpi label="Activation" value={stats ? `${stats.activationRate} %` : "—"} sub="ont créé un document" />
          <Kpi
            label="Jamais revenus"
            value={stats?.signups.neverSignedIn ?? "—"}
            sub={stats ? `${pct(stats.signups.neverSignedIn, stats.signups.total)} % des inscrits` : undefined}
          />
          <Kpi label="Documents" value={stats?.documents.total ?? "—"} sub={`${stats?.avgDocsPerUser ?? "—"} par compte`} />
        </div>
      </Section>

      {/* Technique */}
      <Section
        title="Technique"
        icon={<ServerCrash size={16} />}
        onGoTo={onNavigate && (() => onNavigate("sante"))}
        goToLabel="Santé"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi label="Plantages client" value={health?.clientErrors.total ?? "—"} sub={health ? `${health.clientErrors.affectedUsers} utilisateurs` : undefined} />
          <Kpi label="Échecs IA" value={health?.aiFailures.total ?? "—"} sub="sur 7 jours" />
          <Kpi
            label="Emails en échec"
            value={health?.emails.failureRate != null ? `${health.emails.failureRate} %` : "—"}
            sub={health?.emails.sent != null ? `${health.emails.sent} envoyés` : undefined}
          />
          <Kpi
            label="Dernier cron"
            value={health?.cron.staleHours != null ? `${health.cron.staleHours} h` : "—"}
            sub="depuis la dernière exécution"
          />
        </div>
      </Section>

      {/* Échéances */}
      <Section
        title="Échéances"
        icon={<CalendarClock size={16} />}
        onGoTo={onNavigate && (() => onNavigate("lancement"))}
        goToLabel="Lancement"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi
            label="Date limite"
            value={launch?.deadline ? `J${daysUntil(launch.deadline) >= 0 ? "-" : "+"}${Math.abs(daysUntil(launch.deadline))}` : "—"}
            sub={launch?.deadline
              ? new Date(launch.deadline).toLocaleDateString("fr-FR", { dateStyle: "long" })
              : "aucune date fixée"}
          />
          <Kpi
            label="Places restantes"
            value={launch ? launch.totalSeats - computeDisplayedSold(launch) : "—"}
            sub={launch ? `sur ${launch.totalSeats}` : undefined}
          />
          <Kpi label="Offre" value={launch ? (launch.enabled ? "Active" : "Retirée") : "—"} />
          <Kpi
            label="Données arrêtées au"
            value={stats?.computedAt ? new Date(stats.computedAt).toLocaleDateString("fr-FR") : "—"}
            sub={stats?.computedAt ? new Date(stats.computedAt).toLocaleTimeString("fr-FR", { timeStyle: "short" }) : undefined}
          />
        </div>
      </Section>
    </div>
  );
};

export default CockpitTab;
