const sm = await (await fetch("https://robi-app.com/sitemap.xml")).text();
const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
console.log("sitemap URLs:", urls.length);
const out = [];
const pick = (h, re) => (h.match(re) || [])[1] || "";
async function one(u) {
  try {
    const r = await fetch(u, { redirect: "manual" });
    const h = r.status === 200 ? await r.text() : "";
    const body = h.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ");
    out.push({ u, s: r.status,
      title: pick(h, /<title>([^<]*)<\/title>/),
      desc: pick(h, /<meta name="description" content="([^"]*)"/),
      canon: pick(h, /<link rel="canonical" href="([^"]*)"/),
      robots: pick(h, /<meta name="robots" content="([^"]*)"/),
      h1: (h.match(/<h1/g) || []).length,
      words: body.split(/\s+/).filter(w => w.length > 2).length,
      lang: pick(h, /<html lang="([^"]*)"/),
      ld: (h.match(/application\/ld\+json/g) || []).length });
  } catch (e) { out.push({ u, s: "ERR" }); }
}
for (let i = 0; i < urls.length; i += 12) await Promise.all(urls.slice(i, i + 12).map(one));
const fs = await import("node:fs"); fs.writeFileSync("crawl.json", JSON.stringify(out, null, 1));
const bad = out.filter(x => x.s !== 200); console.log("non-200:", bad.length, bad.slice(0, 10).map(x => x.s + " " + x.u));
console.log("canonical ≠ URL:", out.filter(x => x.s === 200 && x.canon && x.canon !== x.u).length);
console.log("noindex dans sitemap:", out.filter(x => /noindex/.test(x.robots)).length);
console.log("sans description:", out.filter(x => x.s === 200 && !x.desc).length);
console.log("h1 ≠ 1:", out.filter(x => x.s === 200 && x.h1 !== 1).map(x => x.h1 + " " + x.u).slice(0, 15));
const t = {}; out.forEach(x => { if (x.title) (t[x.title] ||= []).push(x.u) });
console.log("titres dupliqués:", Object.entries(t).filter(([, v]) => v.length > 1).length);
console.log("titres > 60 car.:", out.filter(x => x.title.length > 60).length, " desc > 160:", out.filter(x => x.desc.length > 160).length);
console.log("pages < 400 mots:", out.filter(x => x.s === 200 && x.words < 400).length);
const byType = {}; out.forEach(x => { const k = x.u.replace("https://robi-app.com/", "").split("/").slice(1, 2)[0] || "(accueil)"; byType[k] = (byType[k] || 0) + 1 }); console.log(byType);
