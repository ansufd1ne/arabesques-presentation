// Typographie française : espaces insécables (U+00A0) dans le HTML construit.
// Seuls les noeuds de texte visibles sont modifiés (plus le contenu des balises meta description et Open Graph).
// Jamais touchés : attributs, <script> (dont JSON-LD), <style>, <code>, <pre>, <textarea>, commentaires, URL, e-mails,
// horaires du type « 14h30 ».
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const NB = ' ';
// Avant « : ; ? ! » et « % € », avant la fermeture » et après l'ouverture «, entre « n° » et son numéro,
// entre les groupes de milliers (65 000) et entre un nombre et « % » ou « € ».
export const corrigerTexte = (t) => t
  .replace(/(\S|^) ([:;?!»%€])(?=\s|$|[^\w])/g, `$1${NB}$2`)
  .replace(/(«) /g, `$1${NB}`)
  .replace(/\b(n°) (?=\d)/g, `$1${NB}`)
  .replace(/(\d) (\d{3})(?!\d)(?![h:])/g, `$1${NB}$2`);

const META = /^<meta\b[^>]*\b(?:name|property)="(?:description|og:title|og:description|twitter:title|twitter:description)"/i;
const BLOCS_IGNORES = /<(script|style|code|pre|textarea)\b[\s\S]*?<\/\1>|<!--[\s\S]*?-->/gi;

export const corrigerHtml = (html) => html.replace(new RegExp(`${BLOCS_IGNORES.source}|<[^>]*>|[^<]+`, 'gi'), (seg) => {
  if (seg.startsWith('<')) {
    if (/^<(script|style|code|pre|textarea|!--)/i.test(seg)) return seg;
    return META.test(seg) ? seg.replace(/\bcontent="([^"]*)"/, (m, c) => `content="${corrigerTexte(c)}"`) : seg;
  }
  return corrigerTexte(seg);
});

export const typographieFrancaise = () => ({
  name: 'typographie-francaise',
  hooks: {
    'astro:build:done': ({ dir }) => {
      const parcourir = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? parcourir(path.join(d, e.name)) : [path.join(d, e.name)]));
      for (const f of parcourir(fileURLToPath(dir)).filter((f) => f.endsWith('.html'))) {
        const avant = fs.readFileSync(f, 'utf8');
        const apres = corrigerHtml(avant);
        if (apres !== avant) fs.writeFileSync(f, apres);
      }
    },
  },
});
