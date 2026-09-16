"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart2, FileText, LogOut, ArrowUpRight, RefreshCw, Gauge, Rocket, HeartPulse, Target, Megaphone, ListChecks, FolderOpen, CalendarDays, Compass, TrendingDown, Search } from "lucide-react";
import {
  auth, onAuthStateChanged, signInWithGoogle, signOut, isAllowedEmail, firebaseReady,
  subscribeToArticles, subscribeToVisits, type Article, type VisitStats, type User,
} from "@/lib/firebase";
import { markInternalDevice } from "@/lib/internalTraffic";
import { subscribeToSeoKeywords, type SeoKeyword } from "@/lib/seoKeywords";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import SeoTab from "@/components/admin/SeoTab";
import BlogTab from "@/components/admin/BlogTab";
import CockpitTab from "@/components/admin/CockpitTab";
import PilotageTab from "@/components/admin/PilotageTab";
import LancementTab from "@/components/admin/LancementTab";
import SanteTab from "@/components/admin/SanteTab";
import ProduitTab from "@/components/admin/ProduitTab";
import AcquisitionTab from "@/components/admin/AcquisitionTab";
import InfluenceursTab from "@/components/admin/InfluenceursTab";
import KanbanTab from "@/components/admin/KanbanTab";
import FichiersTab from "@/components/admin/FichiersTab";
import ReseauxTab from "@/components/admin/ReseauxTab";
import ThemePicker from "@/components/admin/ThemePicker";
import ModeToggle from "@/components/admin/ModeToggle";
import { Toaster } from "@/components/admin/toast";
import { focusRing } from "@/components/admin/ui";

type Tab = "cockpit" | "pilotage" | "kanban" | "reseaux" | "fichiers" | "sante" | "produit" | "acquisition" | "influenceurs" | "analytics" | "seo" | "blog" | "lancement";

const EMPTY_VISITS: VisitStats = {
  today: 0, week: 0, prevWeek: 0, month: 0, days: [], byPage: [], bySource: [],
};

const ICON = { size: 16, strokeWidth: 1.75 } as const;

// ─── Auth screen ───────────────────────────────────────────
function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    const { ok, error: err } = await signInWithGoogle();
    if (!ok && err) setError(err);
    setLoading(false);
  };

  return (
    <div className="a-root a-shell min-h-screen flex items-center justify-center px-4">
      <div className="a-card a-rise w-full max-w-[340px] p-8">
        <div className="flex flex-col items-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Robi AI" className="w-11 h-11 mb-4" />
          <p className="text-[17px] font-bold tracking-[-0.02em] text-slate-900">Robi AI</p>
          <p className="a-mono text-[10.5px] uppercase tracking-[0.14em] mt-1 text-slate-400">Admin</p>
        </div>
        <button
          onClick={handleGoogle}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg font-semibold text-[14px] bg-[var(--a-surface)] text-slate-900 border border-slate-200 hover:bg-slate-900/[0.03] hover:border-slate-300 active:scale-[0.98] transition disabled:opacity-50 ${focusRing}`}
        >
          {loading ? (
            <RefreshCw size={16} className="animate-spin text-slate-400" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-4z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16.1 18.9 13 24 13c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5.1l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7.1l-6.5 5C9.5 39.4 16.3 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.4-2.4 4.4-4.4 5.8l6.2 5.2C41.5 35.4 44 30.1 44 24c0-1.3-.1-2.7-.4-4z" />
            </svg>
          )}
          {loading ? "Connexion…" : "Continuer avec Google"}
        </button>
        {error && <p className="text-xs text-red-600 text-center mt-4">{error}</p>}
        <p className="text-[11px] text-center mt-6 text-slate-400">Accès réservé aux admins autorisés</p>
      </div>
    </div>
  );
}

// ─── Dashboard ─────────────────────────────────────────────
export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [tab, setTab] = useState<Tab>("pilotage");
  const [articles, setArticles] = useState<Article[]>([]);
  const [visits, setVisits] = useState<VisitStats>(EMPTY_VISITS);
  const [seoKeywords, setSeoKeywords] = useState<SeoKeyword[]>([]);

  useEffect(() => {
    if (!firebaseReady) {
      setAuthReady(true);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      const admin = !!u && isAllowedEmail(u.email);
      // Un appareil qui ouvre l'admin est un appareil de l'équipe : ses
      // visites du site ne comptent plus dans les statistiques.
      if (admin) markInternalDevice();
      setUser(admin ? u : null);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const loggedIn = !!user;

  useEffect(() => {
    if (!loggedIn) return;
    const unsubArticles = subscribeToArticles(setArticles);
    const unsubVisits = subscribeToVisits(setVisits);
    const unsubSeo = subscribeToSeoKeywords(setSeoKeywords);
    return () => {
      unsubArticles();
      unsubVisits();
      unsubSeo();
    };
  }, [loggedIn]);

  if (!authReady) {
    return (
      <div className="a-root a-shell min-h-screen flex items-center justify-center text-slate-400">
        <RefreshCw size={20} className="animate-spin" />
      </div>
    );
  }
  if (!firebaseReady) {
    return (
      <div className="a-root a-shell min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center text-slate-600 space-y-3">
          <p className="font-bold text-lg text-slate-900">Firebase non configuré</p>
          <p className="text-sm">
            Ajoute les variables <code className="a-mono text-[var(--admin-ink)]">NEXT_PUBLIC_FIREBASE_*</code> dans
            ton <code className="a-mono">.env.local</code> (voir <code className="a-mono">.env.example</code>) puis recharge.
          </p>
        </div>
      </div>
    );
  }
  if (!loggedIn) return <AuthScreen />;

  // `slate-900` suit le mode (voir globals.css) : le même survol fonce en
  // clair et éclaire en sombre.
  const navItem = "text-slate-500 font-medium hover:text-slate-900 hover:bg-slate-900/[0.04]";
  const navActive = "a-nav-active text-slate-900 font-semibold";

  const NAV: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "cockpit", label: "Cockpit", icon: <Compass {...ICON} /> },
    { id: "pilotage", label: "Pilotage", icon: <Gauge {...ICON} /> },
    { id: "kanban", label: "Tâches", icon: <ListChecks {...ICON} /> },
    { id: "reseaux", label: "Réseaux", icon: <CalendarDays {...ICON} /> },
    { id: "fichiers", label: "Fichiers", icon: <FolderOpen {...ICON} /> },
    { id: "sante", label: "Santé", icon: <HeartPulse {...ICON} /> },
    { id: "produit", label: "Produit", icon: <TrendingDown {...ICON} /> },
    { id: "acquisition", label: "Acquisition", icon: <Target {...ICON} /> },
    { id: "influenceurs", label: "Influenceurs", icon: <Megaphone {...ICON} /> },
    { id: "analytics", label: "Analytics", icon: <BarChart2 {...ICON} /> },
    { id: "seo", label: "SEO", icon: <Search {...ICON} />, badge: seoKeywords.filter((k) => k.status === "a-travailler").length || undefined },
    { id: "blog", label: "Blog", icon: <FileText {...ICON} />, badge: articles.filter((a) => !a.published).length || undefined },
    { id: "lancement", label: "Lancement", icon: <Rocket {...ICON} /> },
  ];

  const subtitle: Record<Tab, string> = {
    cockpit: "Ce qui brûle et ce qui arrive, toutes sections confondues",
    pilotage: "Inscriptions, activation, usage et funnel — agrégats uniquement",
    kanban: "Le backlog du lancement, colonne par colonne",
    reseaux: "Calendrier éditorial : posts, visuels et statuts",
    fichiers: "Le dossier de travail partagé avec Claude",
    produit: "Le tunnel et les bugs, lus dans PostHog",
    sante: "Ce qui casse en silence : emails, plantages, IA, crons",
    acquisition: "Prospects, séquence de relance et envoi des emails",
    influenceurs: "Codes promo, ventes attribuées et commissions dues",
    analytics: `${visits.month} visites ce mois · ${visits.bySource.length} sources détectées`,
    seo: seoKeywords.length
      ? `${seoKeywords.length} mots-clés suivis · ${seoKeywords.filter((k) => typeof k.position === "number" && k.position <= 10).length} en page 1`
      : "Ce qu'on vise, où on ranke, quelle page doit ranker",
    blog: `${articles.filter((a) => a.published).length} publiés · ${articles.filter((a) => !a.published).length} brouillons`,
    lancement: "Compteur de places, date limite et retrait de l'offre",
  };

  return (
    <div className="a-root a-shell min-h-screen flex">
      {/* Sidebar */}
      <aside className="a-sidebar w-[232px] flex-shrink-0 flex flex-col h-screen sticky top-0">
        <div className="px-5 h-[68px] flex items-center gap-3 flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Robi AI" className="w-8 h-8" />
          <div>
            <p className="text-[14px] font-bold tracking-[-0.01em] text-slate-900 leading-none">Robi AI</p>
            <p className="a-mono text-[10px] uppercase tracking-[0.14em] text-slate-400 mt-1">Admin</p>
          </div>
        </div>

        <nav className="flex-1 px-3 pb-3 space-y-0.5 overflow-y-auto">
          {NAV.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-current={active ? "page" : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] transition-colors ${focusRing} ${active ? navActive : navItem}`}
              >
                {t.icon}
                <span className="flex-1 text-left">{t.label}</span>
                {t.badge ? (
                  <span className="a-mono min-w-[20px] h-5 px-1.5 rounded-full bg-[var(--color-accent)] text-[var(--a-on-accent)] text-[10.5px] font-medium flex items-center justify-center">{t.badge}</span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200 space-y-0.5">
          <ModeToggle />
          <ThemePicker />
          {/* Link plutôt que <a> : un href brut rechargeait toute l'app
              (flash blanc + re-auth Firebase) pour revenir sur le site. */}
          <Link href="/" className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] transition-colors ${focusRing} ${navItem}`}>
            <ArrowUpRight {...ICON} />
            <span>Voir le site</span>
          </Link>
          <button onClick={() => signOut()} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium text-slate-500 hover:text-red-600 hover:bg-red-600/[0.06] transition-colors ${focusRing}`}>
            <LogOut {...ICON} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-auto">
        {/* 1600px : au-delà, une ligne de tableau s'étire trop pour que l'œil
            garde sa ligne en la balayant. En dessous (l'ancien max-w-5xl, soit
            1024px), le kanban et la carte monde étouffaient. */}
        <div className="mx-auto w-full max-w-[1600px] px-6 py-8 md:px-10">
          {/* Le filet bas ancre le titre : sur 1600px de large, un titre sans
              séparateur flotte au-dessus du contenu au lieu de le coiffer. */}
          <header key={`h-${tab}`} className="a-rise mb-8 pb-6 border-b border-slate-200">
            <h1 className="text-[28px] font-bold leading-none tracking-[-0.03em] text-slate-900">{NAV.find((t) => t.id === tab)?.label}</h1>
            <p className="text-[13.5px] mt-2.5 text-slate-500">{subtitle[tab]}</p>
          </header>
          {/* La clé rejoue l'entrée en cascade à chaque changement d'onglet. */}
          <div key={tab} className="a-tab-enter">
            {tab === "cockpit" && <CockpitTab onNavigate={setTab} />}
            {tab === "pilotage" && <PilotageTab visits={visits} />}
            {tab === "kanban" && <KanbanTab />}
            {tab === "reseaux" && <ReseauxTab />}
            {tab === "fichiers" && <FichiersTab />}
            {tab === "sante" && <SanteTab />}
            {tab === "produit" && <ProduitTab />}
            {tab === "acquisition" && <AcquisitionTab />}
            {tab === "influenceurs" && <InfluenceursTab />}
            {tab === "analytics" && <AnalyticsTab visits={visits} />}
            {tab === "seo" && <SeoTab keywords={seoKeywords} />}
            {tab === "blog" && <BlogTab articles={articles} />}
            {tab === "lancement" && <LancementTab />}
          </div>
        </div>
      </main>

      <Toaster />
    </div>
  );
}
