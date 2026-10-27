// Importe la page Caravane (texte, à venir, archives) et la page Presse dans Sanity, sans écraser ce qui existe déjà.
// Usage : node --env-file=.env seed-caravane.mjs
import { createClient } from '@sanity/client';
import { readFileSync, createReadStream, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2026-10-01',
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
});
const root = resolve(import.meta.dirname, '..');
const data = JSON.parse(readFileSync(resolve(root, 'src/data/caravane.json'), 'utf8'));
const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

const tx = client.transaction();
tx.createIfNotExists({ _id: 'pageCaravane', _type: 'pageCaravane', intro: data.intro });

data.upcoming.forEach((e, i) =>
  tx.createIfNotExists({ _id: `caravane-avenir-${slug(e.name)}-${i}`, _type: 'caravaneEvent', kind: 'upcoming', title: e.name, when: e.when, url: e.url, order: i, hidden: false }));

let n = 0;
for (const e of data.past) {
  const id = `caravane-archive-${slug(e.image.replace(/\.[a-z]+$/, ''))}`;
  if (await client.getDocument(id)) { n++; continue; }
  const file = resolve(root, 'src/assets/caravane', e.image);
  const asset = existsSync(file) ? await client.assets.upload('image', createReadStream(file), { filename: e.image }) : null;
  tx.createIfNotExists({
    _id: id, _type: 'caravaneEvent', kind: 'past', title: e.title, when: e.when, order: n++, hidden: false,
    ...(e.url && { url: e.url }),
    ...(asset && { image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id }, alt: `${e.title}, ${e.when}` } }),
  });
}

const presse = [
  { id: 'communique-2026', label: 'Édition 2026', title: 'Communiqué de presse 2026', text: 'Arabesques, l’élan d’un rêve méditerranéen : le bilan de la 21e édition.', linkLabel: 'Lire le communiqué', url: '/presse/communique-2026', external: false },
  { id: 'espace-medias', label: 'Professionnels', title: 'Accès à l’espace médias', text: 'Accès réservé aux médias, sur identifiant.', linkLabel: 'Accéder à l’espace', url: 'https://www.extrazik.com/arabesques-presse/login', external: true },
  { id: 'demande-interview', label: 'Contact', title: 'Demande d’interview', text: 'Infoligne : 04 99 77 00 17', linkLabel: 'Nous écrire', url: '/contact', external: false },
];
presse.forEach(({ id, ...p }, i) => tx.createIfNotExists({ _id: `presse-${id}`, _type: 'presseItem', ...p, order: i, hidden: false }));

await tx.commit();
console.log(`Caravane : ${data.upcoming.length} à venir, ${data.past.length} archives. Presse : ${presse.length} blocs.`);
