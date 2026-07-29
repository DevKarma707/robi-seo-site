"use client";

import React, { useEffect, useState } from "react";
import { BarChart2, FileText, LogOut, ArrowUpRight, RefreshCw, Gauge, Rocket } from "lucide-react";
import {
  auth, onAuthStateChanged, signInWithGoogle, signOut, isAllowedEmail, firebaseReady,
  subscribeToArticles, subscribeToVisits, type Article, type VisitStats, type User,
} from "@/lib/firebase";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import BlogTab from "@/components/admin/BlogTab";
import PilotageTab from "@/components/admin/PilotageTab";
import LancementTab from "@/components/admin/LancementTab";

type Tab = "pilotage" | "analytics" | "blog" | "lancement";

const EMPTY_VISITS: VisitStats = {
  today: 0, week: 0, prevWeek: 0, month: 0, days: [], byPage: [], bySource: [],
};

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
    <div className="min-h-screen flex items-center justify-center bg-[#0A0425]">
      <div className="w-80 rounded-3xl p-8 shadow-2xl border bg-white/[0.04] border-white/[0.08] backdrop-blur-xl">
        <div className="flex flex-col items-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Robi AI" className="w-12 h-12 mb-3" />
          <p className="font-black text-sm text-white">Robi AI</p>
          <p className="font-black text-[11px] uppercase tracking-[0.2em] mt-1 text-white/40">Admin Dashboard</p>
        </div>
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl font-black text-sm bg-[#BEF221] text-black hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-4z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16.1 18.9 13 24 13c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5.1l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7.1l-6.5 5C9.5 39.4 16.3 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.4-2.4 4.4-4.4 5.8l6.2 5.2C41.5 35.4 44 30.1 44 24c0-1.3-.1-2.7-.4-4z" />
          </svg>
          {loading ? "Connexion…" : "Continuer avec Google"}
        </button>
        {error && <p className="text-xs text-red-400 text-center mt-4">{error}</p>}
        <p className="text-[10px] text-center mt-6 text-white/20">Accès réservé aux admins autorisés</p>
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

  useEffect(() => {
    if (!firebaseReady) {
      setAuthReady(true);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u && isAllowedEmail(u.email) ? u : null);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const loggedIn = !!user;

  useEffect(() => {
    if (!loggedIn) return;
    const unsubArticles = subscribeToArticles(setArticles);
    const unsubVisits = subscribeToVisits(setVisits);
    return () => {
      unsubArticles();
      unsubVisits();
    };
  }, [loggedIn]);

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0425] text-white/40">
        <RefreshCw size={20} className="animate-spin" />
      </div>
    );
  }
  if (!firebaseReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0425] px-6">
        <div className="max-w-md text-center text-white/70 space-y-3">
          <p className="font-black text-lg text-white">Firebase non configuré</p>
          <p className="text-sm">
            Ajoute les variables <code className="text-[#BEF221]">NEXT_PUBLIC_FIREBASE_*</code> dans
            ton <code>.env.local</code> (voir <code>.env.example</code>) puis recharge.
          </p>
        </div>
      </div>
    );
  }
  if (!loggedIn) return <AuthScreen />;

  const navItem = "text-white/50 hover:text-white hover:bg-white/[0.06]";
  const navActive = "text-[#BEF221] bg-[#BEF221]/[0.08] border border-[#BEF221]/20";

  const NAV: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "pilotage", label: "Pilotage", icon: <Gauge size={17} /> },
    { id: "analytics", label: "Analytics", icon: <BarChart2 size={17} /> },
    { id: "blog", label: "Blog", icon: <FileText size={17} />, badge: articles.filter((a) => !a.published).length || undefined },
    { id: "lancement", label: "Lancement", icon: <Rocket size={17} /> },
  ];

  const subtitle: Record<Tab, string> = {
    pilotage: "Inscriptions, activation, usage et funnel — agrégats uniquement",
    analytics: `${visits.month} visites ce mois · ${visits.bySource.length} sources détectées`,
    blog: `${articles.filter((a) => a.published).length} publiés · ${articles.filter((a) => !a.published).length} brouillons`,
    lancement: "Compteur de places, date limite et retrait de l'offre",
  };

  return (
    <div className="min-h-screen flex bg-[#0A0425]">
      {/* Sidebar */}
      <aside className="w-[232px] flex-shrink-0 border-r flex flex-col h-screen sticky top-0 bg-white/[0.02] border-white/[0.06]">
        <div className="px-4 py-4 border-b border-white/[0.06] flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Robi AI" className="w-8 h-8" />
          <div>
            <p className="font-black text-sm text-white leading-none">Robi AI</p>
            <p className="text-[10px] uppercase tracking-widest text-white/30 mt-0.5">Admin</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all ${tab === t.id ? navActive : navItem}`}
            >
              {t.icon}
              <span className="flex-1 text-left font-bold tracking-wide">{t.label}</span>
              {t.badge ? (
                <span className="min-w-[20px] h-5 px-1 rounded-full bg-[#BEF221] text-black text-[10px] flex items-center justify-center font-black">{t.badge}</span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/[0.06] space-y-0.5">
          <a href="/" className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all ${navItem}`}>
            <ArrowUpRight size={17} />
            <span className="font-bold tracking-wide">Voir le site</span>
          </a>
          <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-semibold text-red-400 hover:bg-red-400/10 transition-all">
            <LogOut size={17} />
            <span className="font-bold tracking-wide">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="mb-6">
            <h1 className="font-black text-2xl uppercase tracking-tight text-white">{NAV.find((t) => t.id === tab)?.label}</h1>
            <p className="text-sm mt-1 text-white/40">{subtitle[tab]}</p>
          </div>
          {tab === "pilotage" && <PilotageTab visits={visits} />}
          {tab === "analytics" && <AnalyticsTab visits={visits} />}
          {tab === "blog" && <BlogTab articles={articles} />}
          {tab === "lancement" && <LancementTab />}
        </div>
      </main>
    </div>
  );
}
