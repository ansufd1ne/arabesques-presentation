// Contrôle des liens externes (lecture seule) : node scripts/verifier-liens-externes.mjs [dossier]
// Parcourt les pages HTML construites (dist par défaut), teste chaque lien http(s) externe une seule fois
// (HEAD puis GET), 4 requêtes simultanées, 15 s maximum par lien. Ne modifie aucun fichier.
// Code de sortie 1 si un lien est mort (404, 410, 5xx hors filtrage anti-robot, délai dépassé, redirection vers l'accueil).
import fs from 'node:fs';
import path from 'node:path';

const dossier = process.argv[2] ?? 'dist';
const CONCURRENCE = 4;
const DELAI_MS = 15000;
const IGNORES = /^https?:\/\/(www\.festivalarabesques\.fr|www\.unisons\.fr|schema\.org|www\.w3\.org|localhost|127\.0\.0\.1)(\/|$)/;
// Ces sites répondent 400/403/429/503 à tout client automatisé : à vérifier à la main.
const ANTI_ROBOT = /^https?:\/\/([a-z0-9-]+\.)?(facebook\.com|instagram\.com|linkedin\.com|cnil\.fr|x\.com|twitter\.com)(\/|$)/;
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

if (!fs.existsSync(dossier)) { console.error(`Dossier introuvable : ${dossier} (lancer d'abord npm run build)`); process.exit(2); }
const parcourir = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? parcourir(path.join(d, e.name)) : [path.join(d, e.name)]));
const liens = new Map(); // url -> premières pages où elle apparaît
for (const f of parcourir(dossier).filter((f) => f.endsWith('.html'))) {
  const html = fs.readFileSync(f, 'utf8');
  for (const m of html.matchAll(/\bhref="(https?:\/\/[^"#]+)/g)) {
    const url = m[1].replace(/&amp;/g, '&');
    if (IGNORES.test(url)) continue;
    const pages = liens.get(url) ?? [];
    if (pages.length < 3) pages.push('/' + path.relative(dossier, f));
    liens.set(url, pages);
  }
}

async function appeler(url, methode) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), DELAI_MS);
  try {
    return await fetch(url, { method: methode, redirect: 'follow', signal: ac.signal, headers: { 'User-Agent': UA, Accept: 'text/html,*/*' } });
  } finally { clearTimeout(t); }
}

async function tester(url) {
  try {
    let res = await appeler(url, 'HEAD');
    if (res.status >= 400) res = await appeler(url, 'GET');
    const finale = new URL(res.url);
    const origine = new URL(url);
    const versAccueil = res.ok && finale.pathname.replace(/\/$/, '') === '' && origine.pathname.replace(/\/$/, '') !== '';
    if (versAccueil) return { url, etat: 'mort', detail: `redirigé vers l'accueil (${res.url})` };
    if (res.ok) return { url, etat: 'ok', detail: res.url !== url ? `redirigé vers ${res.url}` : String(res.status) };
    if (ANTI_ROBOT.test(url)) return { url, etat: 'manuel', detail: `${res.status} (filtrage anti-robot probable)` };
    return { url, etat: 'mort', detail: String(res.status) };
  } catch (e) {
    if (ANTI_ROBOT.test(url)) return { url, etat: 'manuel', detail: 'injoignable (filtrage anti-robot probable)' };
    return { url, etat: 'mort', detail: e?.name === 'AbortError' ? `délai de ${DELAI_MS / 1000} s dépassé` : `erreur réseau (${e?.cause?.code ?? e?.message})` };
  }
}

const file = [...liens.keys()];
const resultats = [];
await Promise.all(Array.from({ length: CONCURRENCE }, async () => {
  while (file.length) resultats.push(await tester(file.shift()));
}));

const par = (etat) => resultats.filter((r) => r.etat === etat).sort((a, b) => a.url.localeCompare(b.url));
console.log(`${resultats.length} liens externes testés : ${par('ok').length} valides, ${par('mort').length} morts, ${par('manuel').length} à vérifier à la main`);
for (const r of par('mort')) console.log(`MORT    ${r.detail}  ${r.url}\n        vu sur : ${liens.get(r.url).join(', ')}`);
for (const r of par('manuel')) console.log(`MANUEL  ${r.detail}  ${r.url}`);
process.exit(par('mort').length ? 1 : 0);
