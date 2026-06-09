"use client";

import React, { useState } from "react";
import {
  Plus, Search, Edit2, Trash2, X, Save, RefreshCw,
  Eye, EyeOff, Star, StarOff, Globe, ImageIcon, ChevronDown, FileText, FileJson,
} from "lucide-react";
import {
  type Article, addArticle, updateArticle, deleteArticle, importArticlesFromJson,
} from "@/lib/firebase";

type Lang = "fr" | "en" | "es";
const CATEGORIES = ["guides", "legal", "tips", "business"] as const;

const slugify = (str: string) =>
  str.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");

// ─── Liste des articles ────────────────────────────────────
const BlogTab: React.FC<{ articles: Article[] }> = ({ articles }) => {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Article | null>(null);
  const [creating, setCreating] = useState(false);
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);

  const text = "text-white";
  const muted = "text-white/40";
  const card = "bg-white/[0.03] border-white/8";
  const inputBg = "bg-white/5 border-white/10 text-white";

  const filtered = articles.filter(
    (a) =>
      !search.trim() ||
      a.titleFr.toLowerCase().includes(search.toLowerCase()) ||
      a.titleEn.toLowerCase().includes(search.toLowerCase()) ||
      a.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (a: Article) => {
    if (!confirm(`Supprimer "${a.titleFr}" ?\nCette action est irréversible.`)) return;
    if (a.id) await deleteArticle(a.id);
  };
  const handleTogglePublish = async (a: Article) => {
    if (a.id) await updateArticle(a.id, { published: !a.published });
  };
  const handleToggleFeatured = async (a: Article) => {
    if (a.id) await updateArticle(a.id, { featured: !a.featured });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${muted}`} size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un article…"
            className={`w-full pl-9 pr-3 py-2 rounded-xl border text-sm ${inputBg} placeholder:opacity-50 focus:border-[#BEF221]/40 focus:outline-none`}
          />
        </div>
        <button
          onClick={() => {
            setShowJsonImport(true);
            setImportMsg(null);
          }}
          title="Colle un JSON d'article (préparé par Claude) pour l'importer en 1 clic"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#BEF221]/40 text-[#BEF221] text-sm font-bold hover:bg-[#BEF221]/10 transition-colors"
        >
          <FileJson size={16} />
          Importer JSON
        </button>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#BEF221] text-black text-sm font-bold hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Nouvel article
        </button>
      </div>

      {/* Message import */}
      {importMsg && (
        <div
          className={`text-sm px-4 py-3 rounded-xl border ${
            importMsg.startsWith("✅")
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : importMsg.startsWith("ℹ️")
              ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {importMsg}
        </div>
      )}

      {showJsonImport && (
        <ArticleJsonImportModal
          onClose={() => setShowJsonImport(false)}
          onResult={(msg) => {
            setImportMsg(msg);
            setShowJsonImport(false);
          }}
        />
      )}

      {/* Stats */}
      <div className="flex gap-4 text-xs">
        <span className={muted}>{articles.length} articles</span>
        <span className="text-green-400">• {articles.filter((a) => a.published).length} publiés</span>
        <span className="text-yellow-400">• {articles.filter((a) => !a.published).length} brouillons</span>
        <span className="text-[#BEF221]">• {articles.filter((a) => a.featured).length} en vedette</span>
      </div>

      {/* Liste */}
      <div className={`rounded-2xl border overflow-hidden ${card}`}>
        {filtered.length === 0 ? (
          <div className={`text-center py-16 ${muted}`}>
            <FileText size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">
              {articles.length === 0
                ? 'Aucun article. Clique sur "Importer JSON" ou "Nouvel article".'
                : "Aucun article ne correspond à la recherche."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((a) => (
              <div key={a.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-white/[0.04] transition-colors">
                <div className="w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center bg-white/5">
                  {a.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.coverImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={18} className={muted} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-semibold text-sm truncate ${text}`}>{a.titleFr}</p>
                    {a.featured && <Star size={11} className="text-[#BEF221] flex-shrink-0" />}
                  </div>
                  <p className={`text-xs truncate ${muted}`}>
                    /{a.slug} · {a.category} · {a.date}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-full border flex-shrink-0 ${
                    a.published
                      ? "bg-green-400/10 text-green-400 border-green-400/20"
                      : "bg-yellow-400/10 text-yellow-500 border-yellow-400/20"
                  }`}
                >
                  {a.published ? "Publié" : "Brouillon"}
                </span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleToggleFeatured(a)}
                    title={a.featured ? "Retirer de la une" : "Mettre en vedette"}
                    className={`p-1.5 rounded-lg transition-colors ${
                      a.featured ? "text-[#BEF221] hover:bg-[#BEF221]/10" : `${muted} hover:text-[#BEF221] hover:bg-[#BEF221]/10`
                    }`}
                  >
                    {a.featured ? <Star size={14} /> : <StarOff size={14} />}
                  </button>
                  <button
                    onClick={() => handleTogglePublish(a)}
                    title={a.published ? "Dépublier" : "Publier"}
                    className={`p-1.5 rounded-lg transition-colors ${
                      a.published ? "text-green-400 hover:bg-green-400/10" : `${muted} hover:text-green-400 hover:bg-green-400/10`
                    }`}
                  >
                    {a.published ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <a
                    href={`/fr/blog/${a.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-1.5 rounded-lg transition-colors ${muted} hover:text-blue-400 hover:bg-blue-400/10`}
                    title="Voir l'article"
                  >
                    <Globe size={14} />
                  </a>
                  <button
                    onClick={() => setEditing(a)}
                    className={`p-1.5 rounded-lg hover:bg-[#BEF221]/10 hover:text-[#BEF221] transition-colors ${muted}`}
                    title="Éditer"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(a)}
                    className="p-1.5 rounded-lg hover:bg-red-400/10 hover:text-red-400 text-red-400/60 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(editing || creating) && (
        <ArticleForm
          article={editing}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
        />
      )}
    </div>
  );
};

// ─── Formulaire ────────────────────────────────────────────
const emptyArticle = (): Article => ({
  slug: "",
  titleFr: "", titleEn: "", titleEs: "",
  excerptFr: "", excerptEn: "", excerptEs: "",
  contentFr: "", contentEn: "", contentEs: "",
  category: "guides",
  keywords: [],
  metaDescFr: "", metaDescEn: "", metaDescEs: "",
  coverImage: "",
  published: false,
  featured: false,
  date: new Date().toISOString().split("T")[0],
});

const ArticleForm: React.FC<{ article: Article | null; onClose: () => void }> = ({ article, onClose }) => {
  const [data, setData] = useState<Article>(article || emptyArticle());
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<Lang>("fr");
  const [showSeo, setShowSeo] = useState(false);
  const isCreate = !article;

  const set = (field: keyof Article, value: unknown) => setData((d) => ({ ...d, [field]: value }));
  const handleTitleFr = (v: string) =>
    setData((d) => ({ ...d, titleFr: v, slug: isCreate ? slugify(v) : d.slug }));

  const handleSave = async () => {
    if (!data.titleFr.trim()) return alert("Le titre FR est requis");
    if (!data.slug.trim()) return alert("Le slug est requis");
    if (!data.date) return alert("La date est requise");
    setSaving(true);
    try {
      if (isCreate) {
        await addArticle(data);
      } else if (article?.id) {
        const { id, createdAt, updatedAt, ...payload } = data;
        void id; void createdAt; void updatedAt;
        await updateArticle(article.id, payload);
      }
      onClose();
    } catch (e) {
      alert(`Erreur: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const text = "text-white";
  const muted = "text-white/50";
  const inputBg = "bg-white/5 border-white/10 text-white placeholder:text-white/30";
  const inputCls = `w-full px-3 py-2 rounded-lg border text-sm ${inputBg} focus:border-[#BEF221]/40 focus:outline-none transition-colors`;
  const labelCls = `text-[11px] font-bold uppercase tracking-wider ${muted}`;

  const titleKey = `title${tab[0].toUpperCase()}${tab[1]}` as keyof Article;
  const excerptKey = `excerpt${tab[0].toUpperCase()}${tab[1]}` as keyof Article;
  const contentKey = `content${tab[0].toUpperCase()}${tab[1]}` as keyof Article;
  const langLabel = { fr: "🇫🇷 Français", en: "🇬🇧 English", es: "🇪🇸 Español" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-4xl max-h-[93vh] overflow-y-auto rounded-2xl border bg-[#0F0A2E] border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-[#0F0A2E] border-white/8">
          <h2 className={`font-black text-lg ${text}`}>{isCreate ? "Nouvel article" : `Éditer : ${article?.titleFr}`}</h2>
          <button onClick={onClose} className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${muted}`}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Slug + date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Slug URL *</label>
              <input
                type="text"
                value={data.slug}
                onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/\s/g, "-"))}
                className={`mt-1 ${inputCls} font-mono`}
                placeholder="mon-article-de-blog"
              />
              <p className={`text-[10px] mt-1 ${muted}`}>/blog/{data.slug || "…"}</p>
            </div>
            <div>
              <label className={labelCls}>Date *</label>
              <input type="date" value={data.date} onChange={(e) => set("date", e.target.value)} className={`mt-1 ${inputCls}`} />
            </div>
          </div>

          {/* Catégorie + statut */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Catégorie</label>
              <select value={data.category} onChange={(e) => set("category", e.target.value)} className={`mt-1 ${inputCls}`}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#0F0A2E]">
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Statut</label>
              <div className="mt-2 flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={data.published} onChange={(e) => set("published", e.target.checked)} className="w-4 h-4 rounded" />
                  <span className={`text-sm font-semibold ${text}`}>Publié</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={data.featured || false} onChange={(e) => set("featured", e.target.checked)} className="w-4 h-4 rounded" />
                  <span className={`text-sm font-semibold ${text}`}>⭐ Vedette</span>
                </label>
              </div>
            </div>
          </div>

          {/* Mots-clés + cover URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Mots-clés SEO (séparés par virgule)</label>
              <input
                type="text"
                value={data.keywords.join(", ")}
                onChange={(e) => set("keywords", e.target.value.split(",").map((k) => k.trim()).filter(Boolean))}
                className={`mt-1 ${inputCls}`}
                placeholder="facture freelance, devis auto-entrepreneur"
              />
            </div>
            <div>
              <label className={labelCls}>Image de couverture (URL)</label>
              <input type="text" value={data.coverImage || ""} onChange={(e) => set("coverImage", e.target.value)} className={`mt-1 ${inputCls}`} placeholder="https://…/cover.png" />
            </div>
          </div>

          {/* Onglets langues */}
          <div>
            <div className="flex gap-1 mb-4">
              {(["fr", "en", "es"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setTab(l)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    tab === l ? "bg-[#BEF221] text-black" : "bg-white/8 text-white/50 hover:bg-white/15"
                  }`}
                >
                  {langLabel[l]}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelCls}>Titre {tab.toUpperCase()} {tab === "fr" && "*"}</label>
                <input
                  type="text"
                  value={(data[titleKey] as string) || ""}
                  onChange={(e) => (tab === "fr" ? handleTitleFr(e.target.value) : set(titleKey, e.target.value))}
                  className={`mt-1 ${inputCls}`}
                  placeholder="Titre de l'article"
                />
              </div>
              <div>
                <label className={labelCls}>Extrait {tab.toUpperCase()} (affiché dans la liste)</label>
                <textarea
                  value={(data[excerptKey] as string) || ""}
                  onChange={(e) => set(excerptKey, e.target.value)}
                  rows={2}
                  className={`mt-1 ${inputCls} resize-y`}
                  placeholder="Courte description (1-2 phrases)…"
                />
              </div>
              <div>
                <label className={labelCls}>Contenu {tab.toUpperCase()} {tab === "fr" && "*"}</label>
                <p className={`text-[10px] mb-1 ${muted}`}>
                  Lignes vides = paragraphes. ## pour H2, ### pour H3, **gras**, - liste, [lien](url).
                </p>
                <textarea
                  value={(data[contentKey] as string) || ""}
                  onChange={(e) => set(contentKey, e.target.value)}
                  rows={18}
                  className={`mt-1 ${inputCls} resize-y font-mono text-xs leading-relaxed`}
                  placeholder={`## Introduction\n\nVotre contenu…\n\n## Section 1\n\nTexte…`}
                />
              </div>
            </div>
          </div>

          {/* SEO méta */}
          <button
            onClick={() => setShowSeo((v) => !v)}
            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${muted} hover:text-[#BEF221] transition-colors`}
          >
            <ChevronDown size={14} className={`transition-transform ${showSeo ? "rotate-180" : ""}`} />
            Méta SEO (optionnel)
          </button>
          {showSeo && (
            <div className="grid grid-cols-1 gap-4 pt-2">
              {(["fr", "en", "es"] as const).map((l) => {
                const key = `metaDesc${l[0].toUpperCase()}${l[1]}` as keyof Article;
                return (
                  <div key={l}>
                    <label className={labelCls}>Meta description {l.toUpperCase()} (≤160 car.)</label>
                    <textarea
                      value={(data[key] as string) || ""}
                      onChange={(e) => set(key, e.target.value)}
                      rows={2}
                      className={`mt-1 ${inputCls} resize-none`}
                      maxLength={160}
                      placeholder={`Description Google (${l.toUpperCase()})…`}
                    />
                    <p className={`text-[10px] mt-0.5 ${muted}`}>{((data[key] as string) || "").length}/160</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 px-6 py-4 border-t bg-[#0F0A2E] border-white/8">
          <p className={`text-xs ${muted}`}>{data.published ? "🟢 Sera visible sur le site" : "🟡 Brouillon — non visible"}</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-bold text-white/60 hover:text-white hover:bg-white/8 transition-colors">
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#BEF221] text-black text-sm font-black hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              {isCreate ? "Créer l'article" : "Sauvegarder"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Modal Importer JSON ───────────────────────────────────
const EXAMPLE_ARTICLE_JSON = `{
  "slug": "exemple-article-2026",
  "titleFr": "Titre de l'article (FR)",
  "titleEn": "Article title (EN)",
  "titleEs": "Título del artículo (ES)",
  "excerptFr": "Résumé court FR (1-2 phrases).",
  "category": "guides",
  "keywords": ["facture freelance", "devis auto-entrepreneur"],
  "metaDescFr": "Meta description FR pour Google (max 158 chars).",
  "date": "2026-06-09",
  "published": true,
  "featured": false,
  "coverImage": "",
  "tldrFr": ["Point clé 1 (résumé GEO).", "Point clé 2."],
  "faqFr": [{ "q": "Question fréquente ?", "a": "Réponse concise." }],
  "contentFr": "## Titre H2\\n\\nParagraphe en markdown.\\n\\n- Liste à puce\\n- Autre item\\n\\n### Sous-titre H3\\n\\nTexte avec **gras** et [un lien](https://robi-app.com).",
  "contentEn": "## H2 title\\n\\nParagraph…",
  "contentEs": "## Título H2\\n\\nPárrafo…"
}`;

const ArticleJsonImportModal: React.FC<{ onClose: () => void; onResult: (msg: string) => void }> = ({ onClose, onResult }) => {
  const [jsonStr, setJsonStr] = useState("");
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overwrite, setOverwrite] = useState(false);

  const muted = "text-white/50";
  const inputBg = "bg-white/5 border-white/10 text-white placeholder:text-white/30";
  const labelCls = `text-[11px] font-bold uppercase tracking-wider ${muted}`;

  const handleImport = async () => {
    if (!jsonStr.trim()) return setError("Colle un JSON dans le champ.");
    setImporting(true);
    setError(null);
    try {
      const { imported, skipped, updated } = await importArticlesFromJson(jsonStr, overwrite);
      const parts: string[] = [];
      if (imported > 0) parts.push(`${imported} ajouté${imported > 1 ? "s" : ""}`);
      if (updated > 0) parts.push(`${updated} mis à jour`);
      if (skipped > 0) parts.push(`${skipped} ignoré${skipped > 1 ? "s" : ""} (slug existant)`);
      onResult(imported > 0 || updated > 0 ? `✅ ${parts.join(" · ")}` : `ℹ️ ${parts.join(" · ") || "Rien à importer."}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border bg-[#0F0A2E] border-white/10" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-[#0F0A2E] border-white/8">
          <div>
            <h2 className="font-black text-lg text-white">Importer un article depuis JSON</h2>
            <p className={`text-xs mt-0.5 ${muted}`}>Colle un objet JSON (ou un tableau) préparé par Claude.</p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${muted}`}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={labelCls}>JSON du / des article(s)</label>
              <button onClick={() => setJsonStr(EXAMPLE_ARTICLE_JSON)} className={`text-[10px] font-bold uppercase tracking-wider ${muted} hover:text-[#BEF221] transition-colors`}>
                Charger un exemple
              </button>
            </div>
            <textarea
              value={jsonStr}
              onChange={(e) => setJsonStr(e.target.value)}
              rows={18}
              className={`w-full px-3 py-2 rounded-lg border text-xs font-mono ${inputBg} focus:border-[#BEF221]/40 focus:outline-none transition-colors resize-y`}
              placeholder='Colle ton JSON ici… ex: { "slug": "mon-article", "titleFr": "...", "contentFr": "..." }'
              spellCheck={false}
            />
          </div>

          <div className="text-xs p-3 rounded-lg border bg-white/5 border-white/10 text-white/60">
            <p className="font-bold mb-1">Format attendu :</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li><strong>slug</strong>, <strong>titleFr</strong>, <strong>contentFr</strong> requis</li>
              <li>Optionnels : <code>titleEn/Es</code>, <code>excerptFr/En/Es</code>, <code>contentEn/Es</code>, <code>category</code>, <code>keywords[]</code>, <code>metaDescFr/En/Es</code>, <code>coverImage</code>, <code>date</code>, <code>published</code>, <code>featured</code></li>
              <li>GEO : <code>tldrFr/En/Es</code> (puces) + <code>faqFr/En/Es</code> (<code>[{`{q, a}`}]</code>) → bloc résumé + FAQ + FAQPage schema</li>
              <li>EN/ES manquants : copie du FR par défaut · readTime calculé automatiquement</li>
              <li>Markdown : <code>##</code> H2, <code>###</code> H3, <code>**gras**</code>, <code>- liste</code>, <code>[lien](url)</code></li>
              <li>Un <code>slug</code> déjà présent est ignoré (sauf case « écraser »)</li>
              <li>Plusieurs articles d&apos;un coup avec un tableau <code>[ ... ]</code></li>
            </ul>
          </div>

          {error && <div className="text-sm px-4 py-3 rounded-xl border bg-red-500/10 border-red-500/30 text-red-400">❌ {error}</div>}
        </div>

        <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 px-6 py-4 border-t bg-[#0F0A2E] border-white/8">
          <label className={`flex items-center gap-2 text-xs font-bold cursor-pointer ${muted}`} title="Si coché, un slug existant est MIS À JOUR au lieu d'être ignoré">
            <input type="checkbox" checked={overwrite} onChange={(e) => setOverwrite(e.target.checked)} />
            Écraser si le slug existe déjà
          </label>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-bold text-white/60 hover:text-white hover:bg-white/8 transition-colors">
              Annuler
            </button>
            <button
              onClick={handleImport}
              disabled={importing || !jsonStr.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#BEF221] text-black text-sm font-black hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {importing ? <RefreshCw size={14} className="animate-spin" /> : <FileJson size={14} />}
              {importing ? "Import…" : overwrite ? "Importer / Écraser" : "Importer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogTab;
