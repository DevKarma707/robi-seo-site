#!/usr/bin/env node
/**
 * Robi task runner — ouvre une fenêtre Terminal par tâche du kanban.
 *
 * Le navigateur ne peut pas lancer un programme sur la machine : c'est une
 * barrière volontaire, pas un manque. Ce petit serveur est le seul passage,
 * et il est donc traité comme tel — il exécute des prompts, ce qui revient à
 * donner un clavier à qui l'atteint.
 *
 *   node scripts/robi-task-runner.mjs
 *
 * Choix de sécurité, dans l'ordre d'importance :
 *
 * 1. Écoute sur 127.0.0.1 uniquement. Rien du réseau local n'atteint le port.
 * 2. Jeton partagé, généré au premier lancement et gardé hors du dépôt. Il
 *    n'est PAS dans le bundle de l'admin : le site est public, un secret
 *    compilé dedans serait lisible par n'importe qui. Tu le colles une fois
 *    dans l'admin, il reste dans le localStorage du navigateur.
 * 3. Le client n'envoie jamais de chemin, seulement une clé de dépôt
 *    ("app" ou "site"). La correspondance vit ici. Aucune traversée de
 *    répertoire n'est possible, même avec le jeton.
 * 4. Le prompt ne touche jamais une ligne de commande. Il est écrit dans un
 *    fichier, que le script relit à l'exécution. Un brief contenant des
 *    guillemets ou un `;` ne peut donc rien exécuter.
 * 5. CORS restreint aux origines de l'admin.
 */
import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { mkdtempSync, writeFileSync, chmodSync, readFileSync, existsSync } from "node:fs";
import { tmpdir, homedir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";

const PORT = 4599;
const HOST = "127.0.0.1";

/** Seuls dépôts ouvrables. Le client choisit une clé, jamais un chemin. */
const REPOS = {
  app: join(homedir(), "Desktop", "ROBI_V1_READY"),
  site: join(homedir(), "Desktop", "robi-seo-site"),
};

/** Origines autorisées à parler au runner. */
const ALLOWED_ORIGINS = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://robi-app.com",
  "https://www.robi-app.com",
  "https://go.robi-app.com",
]);

// ─── Jeton ────────────────────────────────────────────────────────────
const TOKEN_FILE = join(homedir(), ".robi-task-runner-token");
const token = existsSync(TOKEN_FILE)
  ? readFileSync(TOKEN_FILE, "utf8").trim()
  : (() => {
      const t = randomBytes(24).toString("hex");
      writeFileSync(TOKEN_FILE, t, { mode: 0o600 });
      return t;
    })();

// ─── Binaire claude ───────────────────────────────────────────────────
// Terminal démarre un shell de login dont le PATH ne contient pas forcément
// ~/.local/bin. On résout le chemin absolu une fois, ici.
const claudeBin = await new Promise((resolve) => {
  execFile("/bin/zsh", ["-lc", "command -v claude"], (err, stdout) => {
    resolve(err ? null : stdout.trim());
  });
});

if (!claudeBin) {
  console.error("✗ `claude` introuvable dans le PATH d'un shell de login.");
  process.exit(1);
}

// ─── Lancement dans VS Code ───────────────────────────────────────────
//
// L'extension Claude Code enregistre un handler d'URI à l'exécution
// (window.registerUriHandler dans extension.js) : la déclaration dans
// package.json est facultative, d'où son absence trompeuse. Le handler accepte
//   vscode://anthropic.claude-code/open?prompt=…&session=…
// et exécute claude-vscode.primaryEditor.open — le panneau Claude, pas un
// terminal.
//
// Il manque un paramètre de dossier : le panneau s'ouvre dans la fenêtre VS
// Code active. On ouvre donc d'abord le bon dépôt, puis on envoie l'URI.
const VSCODE_BIN = "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const run = (bin, args) =>
  new Promise((resolve, reject) =>
    execFile(bin, args, (err) => (err ? reject(err) : resolve()))
  );

const launchVSCode = async (repoKey, prompt) => {
  const cwd = REPOS[repoKey];
  // -n : une fenêtre par tâche, ce qui donne les « petites fenêtres »
  // séparées plutôt qu'un panneau qui écrase le précédent.
  await run(VSCODE_BIN, ["-n", cwd]);
  // Laisse la fenêtre s'initialiser : l'extension s'active sur
  // onStartupFinished, et une URI envoyée trop tôt part dans le vide.
  await sleep(3000);
  const uri = `vscode://anthropic.claude-code/open?prompt=${encodeURIComponent(prompt)}`;
  // execFile, donc pas de shell : le prompt reste un argument, jamais du code.
  await run("/usr/bin/open", [uri]);
};

// ─── Lancement dans un Terminal (repli) ───────────────────────────────
const launch = (repoKey, prompt) => {
  const cwd = REPOS[repoKey];
  const dir = mkdtempSync(join(tmpdir(), "robi-task-"));
  const promptFile = join(dir, "prompt.txt");
  const script = join(dir, "tache.command");

  writeFileSync(promptFile, prompt, { mode: 0o600 });

  // Le prompt est relu depuis le fichier au moment de l'exécution : il
  // n'apparaît jamais dans la ligne de commande, donc rien à échapper.
  writeFileSync(
    script,
    [
      "#!/bin/zsh",
      `cd ${JSON.stringify(cwd)} || exit 1`,
      `exec ${JSON.stringify(claudeBin)} "$(cat ${JSON.stringify(promptFile)})"`,
      "",
    ].join("\n"),
    { mode: 0o700 }
  );
  chmodSync(script, 0o700);

  // `open` confie le .command à Terminal, qui ouvre une nouvelle fenêtre.
  return new Promise((resolve, reject) => {
    execFile("/usr/bin/open", [script], (err) => (err ? reject(err) : resolve()));
  });
};

// ─── Serveur ──────────────────────────────────────────────────────────
const cors = (req, res) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Headers", "content-type, x-runner-token");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  // Chrome exige cet en-tête pour qu'une page publique atteigne une adresse
  // privée (Private Network Access), sinon le préflight échoue.
  if (req.headers["access-control-request-private-network"]) {
    res.setHeader("Access-Control-Allow-Private-Network", "true");
  }
};

const json = (res, code, body) => {
  res.writeHead(code, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
};

createServer((req, res) => {
  cors(req, res);

  if (req.method === "OPTIONS") return res.writeHead(204).end();

  // Sonde d'existence : l'admin s'en sert pour n'afficher le bouton que si le
  // runner tourne. Volontairement sans jeton, elle ne révèle rien.
  if (req.method === "GET" && req.url === "/health") {
    return json(res, 200, { ok: true, repos: Object.keys(REPOS) });
  }

  if (req.method === "POST" && req.url === "/run") {
    if (req.headers["x-runner-token"] !== token) return json(res, 401, { error: "jeton invalide" });

    let raw = "";
    req.on("data", (c) => {
      raw += c;
      if (raw.length > 20_000) req.destroy();
    });
    req.on("end", async () => {
      try {
        const { repo, prompt, mode } = JSON.parse(raw);
        if (!REPOS[repo]) return json(res, 400, { error: "dépôt inconnu" });
        if (typeof prompt !== "string" || !prompt.trim()) return json(res, 400, { error: "prompt vide" });
        if (mode && mode !== "vscode" && mode !== "terminal") return json(res, 400, { error: "mode inconnu" });
        const target = mode === "terminal" ? "terminal" : "vscode";
        await (target === "terminal" ? launch(repo, prompt) : launchVSCode(repo, prompt));
        console.log(`→ ${target} ouvert sur ${repo} : ${prompt.split("\n")[0].slice(0, 70)}`);
        json(res, 200, { ok: true });
      } catch (e) {
        json(res, 500, { error: String(e.message || e) });
      }
    });
    return;
  }

  json(res, 404, { error: "route inconnue" });
}).listen(PORT, HOST, () => {
  console.log(`Robi task runner — http://${HOST}:${PORT}`);
  console.log(`claude : ${claudeBin}`);
  console.log(`\nJeton à coller une fois dans l'admin (onglet Tâches) :\n\n  ${token}\n`);
});
