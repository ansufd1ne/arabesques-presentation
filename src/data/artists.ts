import type { ImageMetadata } from 'astro';
import raw from './programmation.json';
import { loadCms, toImageMetadata } from '../lib/cms';

const images = import.meta.glob<{ default: ImageMetadata }>('../assets/artists/*.{jpg,png}', { eager: true });

export interface Concert {
  slug: string;
  name: string;
  date: string; // ISO yyyy-mm-dd
  complet: boolean;
  section: number;
  image: ImageMetadata;
  venue: string;
  bio?: string;
}

const cms = await loadCms();

// Sanity si configuré, sinon fichiers locaux
export const sections: { title: string; dates: string; venue: string; id: string }[] = cms ? cms.sections : raw.sections;

export const concerts: Concert[] = cms
  ? cms.concerts.map((c) => {
      const idx = cms.sections.findIndex((s) => s._id === c.sectionId);
      if (idx < 0) throw new Error(`Concert « ${c.name} » sans section dans Sanity`);
      const local = images[`../assets/artists/${c.slug}.jpg`]?.default;
      const image = c.image ? toImageMetadata(c.image) : local;
      if (!image) throw new Error(`Concert « ${c.name} » sans image dans Sanity`);
      return { slug: c.slug, name: c.name, date: c.date, complet: c.complet, section: idx, image, venue: cms.sections[idx].venue, bio: c.bio };
    })
  : raw.artists.map((a) => {
      const img = images[`../assets/artists/${a.image}`];
      if (!img) throw new Error(`Image manquante : ${a.image}`);
      return { ...a, image: img.default, venue: raw.sections[a.section].venue };
    });

export const bySlug = (slug: string) => concerts.find((c) => c.slug === slug);

export const neighbours = (slug: string) => {
  const i = concerts.findIndex((c) => c.slug === slug);
  return { prev: concerts[i - 1], next: concerts[i + 1] };
};

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC', ...opts });
export const longDate = (iso: string) => fmt({ weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(iso + 'T12:00:00Z'));
export const shortDate = (iso: string) => fmt({ day: '2-digit', month: 'short' }).format(new Date(iso + 'T12:00:00Z')).replace('.', '');

// "OUM", "L'ANTIDOTE" → casse lisible pour les balises et le schema
export const properName = (s: string) =>
  s.toLowerCase().replace(/'/g, '’').replace(/(^|[\s'’+&:,-])(\p{L})/gu, (_, a, b) => a + b.toUpperCase());
