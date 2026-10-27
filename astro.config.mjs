// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import redirects from './redirects.json' with { type: 'json' };
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { typographieFrancaise } from './scripts/typographie-fr.mjs';

// Retire du sitemap les pages construites avec <meta name="robots" content="noindex">
// (pages en préparation) : elles repassent seules dans le sitemap
// dès que leur contenu est publié et que le noindex disparaît.
const sitemapSansNoindex = () => ({
  name: 'sitemap-sans-noindex',
  hooks: {
    'astro:build:done': ({ dir }) => {
      const root = fileURLToPath(dir);
      for (const f of fs.readdirSync(root).filter((n) => /^sitemap-\d+\.xml$/.test(n))) {
        const xml = fs.readFileSync(root + f, 'utf8');
        const out = xml.replace(/<url>[\s\S]*?<\/url>/g, (bloc) => {
          const loc = /<loc>([^<]+)<\/loc>/.exec(bloc)?.[1];
          if (!loc) return bloc;
          const chemin = new URL(loc).pathname.replace(/\/$/, '').slice(1) || 'index';
          const page = [root + chemin + '.html', root + chemin + '/index.html'].find((c) => fs.existsSync(c));
          return page && /<meta[^>]+name="robots"[^>]+noindex/i.test(fs.readFileSync(page, 'utf8')) ? '' : bloc;
        });
        if (out !== xml) fs.writeFileSync(root + f, out);
      }
    },
  },
});

// Les redirections 301 réelles sont dans vercel.json (généré par `npm run redirects`).
// Astro génère en plus des pages de repli (meta refresh) pour les hébergeurs statiques.
export default defineConfig({
  site: 'https://www.festivalarabesques.fr',
  trailingSlash: 'ignore',
  // Une page = un fichier .html : Cloudflare Pages la sert sans barre finale, sans redirection 308 en plus du 301
  build: { format: 'file' },
  redirects,
  image: { domains: ['cdn.sanity.io'] },
  integrations: [sitemap({ serialize: (item) => ({ ...item, url: item.url.replace(/(.)\/$/, '$1') }) }), sitemapSansNoindex(), typographieFrancaise()],
});
