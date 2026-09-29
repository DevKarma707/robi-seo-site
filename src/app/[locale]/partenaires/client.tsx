"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle, Send } from "lucide-react";
import type { PartnerCopy } from "./copy";

const field = "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#BEF221] focus:border-[#0D0630]";
const label = "block text-sm font-semibold text-slate-700 mb-1.5";

const COUNTRIES: [string, string][] = [
  ["FR", "France"], ["MA", "Maroc / Morocco"], ["US", "United States"], ["GB", "United Kingdom"], ["BE", "Belgique"],
  ["CH", "Suisse"], ["CA", "Canada"], ["ES", "España"], ["MX", "México"], ["SN", "Sénégal"], ["CI", "Côte d'Ivoire"],
  ["AE", "UAE"], ["AU", "Australia"], ["IE", "Ireland"], ["NL", "Netherlands"], ["PT", "Portugal"], ["", "—"],
];

export function PartnerForm({ copy, locale }: { copy: PartnerCopy["form"]; locale: string }) {
  const defaultCountry = locale.includes("-") ? locale.split("-")[1].toUpperCase() : locale === "fr" ? "FR" : locale === "es" ? "ES" : "GB";
  const [f, setF] = useState({
    name: "", email: "", platform: "instagram", handle: "", url: "", country: defaultCountry,
    audience: "", payoutMethod: "paypal", payoutDetails: "", message: "", website: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "already" | "error">("idle");

  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email) || (!f.handle.trim() && !f.url.trim())) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const r = await fetch("/api/partenaires/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, audience: Number(f.audience) || 0, locale }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setStatus("error"); return; }
      setStatus(j.already ? "already" : "success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success" || status === "already") {
    return (
      <div className="rounded-2xl border border-[#BEF221] bg-[#BEF221]/15 p-6 flex items-start gap-3">
        <CheckCircle className="text-[#0D0630] mt-0.5 flex-shrink-0" size={20} />
        <p className="text-[#0D0630] font-semibold">{status === "already" ? copy.already : copy.success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={label} htmlFor="p-name">{copy.name} *</label>
          <input id="p-name" name="name" className={field} value={f.name} onChange={set} required autoComplete="name" />
        </div>
        <div>
          <label className={label} htmlFor="p-email">{copy.email} *</label>
          <input id="p-email" name="email" type="email" className={field} value={f.email} onChange={set} required autoComplete="email" />
        </div>
        <div>
          <label className={label} htmlFor="p-platform">{copy.platform} *</label>
          <select id="p-platform" name="platform" className={field} value={f.platform} onChange={set}>
            {Object.entries(copy.platforms).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="p-handle">{copy.handle} *</label>
          <input id="p-handle" name="handle" className={field} value={f.handle} onChange={set} placeholder="@" />
        </div>
        <div className="sm:col-span-2">
          <label className={label} htmlFor="p-url">{copy.url}</label>
          <input id="p-url" name="url" className={field} value={f.url} onChange={set} placeholder="https://" inputMode="url" />
        </div>
        <div>
          <label className={label} htmlFor="p-country">{copy.country}</label>
          <select id="p-country" name="country" className={field} value={f.country} onChange={set}>
            {COUNTRIES.map(([k, v]) => <option key={k || "none"} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="p-audience">{copy.audience}</label>
          <input id="p-audience" name="audience" type="number" min={0} className={field} value={f.audience} onChange={set} inputMode="numeric" />
        </div>
        <div>
          <label className={label} htmlFor="p-method">{copy.payoutMethod}</label>
          <select id="p-method" name="payoutMethod" className={field} value={f.payoutMethod} onChange={set}>
            {Object.entries(copy.methods).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="p-details">{copy.payoutDetails}</label>
          <input id="p-details" name="payoutDetails" className={field} value={f.payoutDetails} onChange={set} autoComplete="off" />
          <p className="text-xs text-slate-500 mt-1">{copy.payoutHint}</p>
        </div>
        <div className="sm:col-span-2">
          <label className={label} htmlFor="p-message">{copy.message}</label>
          <textarea id="p-message" name="message" className={`${field} h-24`} value={f.message} onChange={set} maxLength={500} />
        </div>
        {/* Champ piège pour les robots : invisible, doit rester vide. */}
        <input name="website" value={f.website} onChange={set} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      </div>

      {status === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 flex items-start gap-2 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{copy.error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center gap-2 rounded-xl bg-[#0D0630] px-6 py-3.5 font-bold text-white hover:bg-[#18314F] disabled:opacity-60"
      >
        <Send size={16} />
        {status === "loading" ? copy.sending : copy.submit}
      </button>
    </form>
  );
}
