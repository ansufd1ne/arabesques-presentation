// Contrôle des balises <title> (65 caractères au plus) et description (110 à 160 caractères) des pages construites.
// Usage : node scripts/verifier-seo.mjs [dossier] [tout]   (code de sortie 1 si une page est hors limites)
import fs from 'node:fs'; import path from 'node:path';
const D = process.argv[2] ?? 'dist';
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
let bad = 0, n = 0;
for (const f of walk(D).filter((f) => f.endsWith('.html'))) {
  const h = fs.readFileSync(f, 'utf8');
  if (/http-equiv="refresh"/.test(h)) continue;
  const t = /<title>([^<]*)<\/title>/.exec(h)?.[1]; const d = /<meta name="description" content="([^"]*)"/.exec(h)?.[1];
  if (t == null) continue; n++;
  const dec = (x) => x.replace(/&amp;/g,'&').replace(/&#39;|&#x27;/g,"'").replace(/&quot;/g,'"');
  const tl = [...dec(t)].length, dl = [...dec(d ?? '')].length;
  const noindex = /name="robots"[^>]*noindex/.test(h);
  const ko = tl > 65 || dl < 110 || dl > 160;
  if (ko) bad++;
  if (ko || process.argv[3]) console.log(ko ? 'HORS' : 'ok  ', tl, dl, noindex ? 'noindex' : '', path.relative(D, f), '|', dec(t));
}
console.log(`pages : ${n}, hors limites : ${bad}`);
process.exit(bad ? 1 : 0);
