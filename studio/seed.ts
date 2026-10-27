// Importe le contenu actuel du site (programmation.json + photos locales) dans Sanity.
// Usage : npx sanity exec seed.ts --with-user-token
import { getCliClient } from 'sanity/cli';
import { readFileSync, createReadStream, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const client = getCliClient({ apiVersion: '2026-10-01' });
const root = resolve(import.meta.dirname, '..');
const raw = JSON.parse(readFileSync(resolve(root, 'src/data/programmation.json'), 'utf8'));

const upload = async (file: string) => {
  if (!existsSync(file)) return undefined;
  const asset = await client.assets.upload('image', createReadStream(file), { filename: file.split('/').pop() });
  return asset._id;
};

const tx = client.transaction();
raw.sections.forEach((s: any, i: number) =>
  tx.createOrReplace({ _id: `section-${s.id}`, _type: 'section', title: s.title, dates: s.dates, venue: s.venue, id: { _type: 'slug', current: s.id }, order: i }));

const hero = await upload(resolve(root, 'src/assets/photos/hero.jpg'));
tx.createOrReplace({
  _id: 'siteSettings', _type: 'siteSettings',
  heroLine1: 'Arabesques.', heroLine2: 'Édition 2026.', heroMediaType: 'image',
  heroIntro: 'Festival des cultures du monde arabe à Montpellier : musique, danse, cinéma, littérature et rencontres. Dernière édition du 8 au 20 septembre 2026, prochaine du 7 au 19 septembre 2027.',
  ...(hero && { heroImage: { _type: 'image', asset: { _type: 'reference', _ref: hero }, alt: 'Entrée du festival Arabesques à la tombée de la nuit, Montpellier 2026' } }),
});

let n = 0;
for (const a of raw.artists) {
  const img = await upload(resolve(root, 'src/assets/artists', a.image));
  tx.createOrReplace({
    _id: `concert-${a.slug}`, _type: 'concert', name: a.name, slug: { _type: 'slug', current: a.slug }, date: a.date, complet: a.complet,
    section: { _type: 'reference', _ref: `section-${raw.sections[a.section].id}` }, order: n++, hidden: false,
    ...(a.bio && { bio: a.bio }),
    ...(img && { image: { _type: 'image', asset: { _type: 'reference', _ref: img } } }),
  });
}
await tx.commit();
console.log(`Importé : ${raw.sections.length} sections, ${raw.artists.length} concerts, réglages du site.`);
