import { createClient } from '@sanity/client';
import type { ImageMetadata } from 'astro';

// Contenu édité dans Sanity (festival-arabesques). Sans SANITY_PROJECT_ID, le site
// retombe sur les fichiers locaux (src/data/*.json) : le build marche sans compte Sanity.
// Si Sanity est configuré mais injoignable, le build échoue exprès : Vercel garde alors
// la version en ligne au lieu de publier un site à moitié vide.
const projectId = import.meta.env.SANITY_PROJECT_ID as string | undefined;
// Aperçu des brouillons (dev uniquement) : actif seulement si SANITY_PREVIEW_TOKEN est défini.
// Sans lui, le site lit toujours la version publiée, comme en production.
const previewToken = import.meta.env.DEV ? (import.meta.env.SANITY_PREVIEW_TOKEN as string | undefined) : undefined;
export const cmsEnabled = Boolean(projectId);

const client = projectId
  ? createClient({
      projectId,
      dataset: (import.meta.env.SANITY_DATASET as string | undefined) || 'production',
      apiVersion: '2026-10-01',
      useCdn: false,
      ...(previewToken ? { token: previewToken, perspective: 'drafts' as const } : { perspective: 'published' as const }),
    })
  : null;

export interface CmsImage { src: string; width: number; height: number; format: 'jpg' }
export interface CmsSection { _id: string; title: string; dates: string; venue: string; id: string }
export interface CmsConcert {
  slug: string; name: string; date: string; complet: boolean; sectionId: string; bio?: string; image?: CmsImage;
}
export interface CmsCaravane { _id: string; kind: 'upcoming' | 'past'; title: string; when: string; url?: string; image?: CmsImage & { alt?: string } }
export interface CmsPresse { _id: string; label: string; title: string; text: string; linkLabel: string; url: string; external: boolean }
export interface CmsSpan { _type: 'span'; text: string; marks?: string[] }
export interface CmsBlockText {
  _type: 'block'; style?: string; listItem?: string; children: CmsSpan[]; markDefs?: { _key: string; _type: string; href?: string }[];
}
export type CmsPageBlock =
  | { _key: string; _type: 'texte'; heading?: string; body: CmsBlockText[] }
  | { _key: string; _type: 'imageSeule'; image: CmsImage; alt: string; caption?: string }
  | { _key: string; _type: 'texteImage'; heading: string; body: CmsBlockText[]; image: CmsImage; alt: string; side?: 'left' | 'right' }
  | { _key: string; _type: 'bouton'; label: string; url: string };
export interface CmsPageLibre { slug: string; title: string; label?: string; sub?: string; description: string; blocks: CmsPageBlock[] }
export interface CmsHero {
  line1?: string; line2?: string; intro?: string;
  mediaType?: 'image' | 'video';
  image?: CmsImage & { alt?: string };
  youtubeId?: string; videoUrl?: string;
}

const img = `{ "src": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height, "format": "jpg", alt }`;

const query = `{
  "hero": *[_id == "siteSettings"][0]{
    "line1": heroLine1, "line2": heroLine2, "intro": heroIntro, "mediaType": heroMediaType,
    "image": heroImage${img}, "youtube": heroYoutubeUrl, "videoUrl": heroVideoFile.asset->url
  },
  "caravaneIntro": *[_id == "pageCaravane"][0].intro,
  "caravane": *[_type == "caravaneEvent" && hidden != true] | order(order asc, _createdAt asc){
    _id, kind, title, when, url, "image": image${img}
  },
  "presse": *[_type == "presseItem" && hidden != true] | order(order asc, _createdAt asc){
    _id, label, title, text, linkLabel, url, "external": coalesce(external, false)
  },
  "pages": *[_type == "pageLibre" && hidden != true && defined(slug.current)]{
    "slug": slug.current, title, label, sub, description,
    "blocks": blocks[]{ ..., "image": image${img} }
  },
  "sections": *[_type == "section"] | order(order asc){ _id, title, dates, venue, "id": id.current },
  "concerts": *[_type == "concert" && hidden != true] | order(date asc, order asc){
    "slug": slug.current, name, date, "complet": coalesce(complet, false), "sectionId": section._ref, bio,
    "image": image${img}
  }
}`;

// youtu.be/ID, youtube.com/watch?v=ID, /embed/ID, /shorts/ID
export const youtubeId = (url?: string) => url?.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([\w-]{11})/)?.[1];

let cache: Promise<{ hero: any; sections: CmsSection[]; concerts: CmsConcert[]; caravaneIntro?: string; caravane: CmsCaravane[]; presse: CmsPresse[]; pages: CmsPageLibre[] }> | undefined;
export const loadCms = () => {
  if (!client) return Promise.resolve(null);
  // en dev on relit Sanity à chaque évaluation du module : une publication se voit sans redémarrer
  if (import.meta.env.DEV) cache = undefined;
  cache ??= client.fetch(query).then((r: any) => ({ ...r, hero: r.hero ? { ...r.hero, youtubeId: youtubeId(r.hero.youtube) } : null }));
  return cache;
};

export const toImageMetadata = (i: CmsImage): ImageMetadata => ({ src: i.src, width: i.width, height: i.height, format: i.format });

// Picture reçoit soit l'import local (ImageMetadata), soit l'URL Sanity avec ses dimensions
export const picProps = (i: ImageMetadata) => (/^https?:/.test(i.src) ? { src: i.src, width: i.width, height: i.height } : { src: i });
export const absUrl = (base: string, i: ImageMetadata) => (/^https?:/.test(i.src) ? i.src : `${base}${i.src}`);
// Astro plafonne les largeurs des images locales, pas celles des images distantes : on le fait ici
export const widthsFor = (i: ImageMetadata, list: number[]) => {
  const w = list.filter((x) => x <= i.width);
  return w.length ? w : [i.width];
};
