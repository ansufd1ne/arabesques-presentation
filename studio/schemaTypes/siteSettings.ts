import { defineField, defineType } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Réglages du site',
  type: 'document',
  groups: [{ name: 'hero', title: 'Haut de la page d’accueil', default: true }],
  fields: [
    defineField({ name: 'heroLine1', title: 'Titre, ligne 1', type: 'string', group: 'hero', initialValue: 'Arabesques.', validation: (r) => r.max(30) }),
    defineField({ name: 'heroLine2', title: 'Titre, ligne 2', type: 'string', group: 'hero', initialValue: 'Édition 2026.', validation: (r) => r.max(30) }),
    defineField({ name: 'heroIntro', title: 'Texte d’introduction', type: 'text', rows: 4, group: 'hero', validation: (r) => r.max(400) }),
    defineField({
      name: 'heroMediaType', title: 'Que montrer dans le haut de page ?', type: 'string', group: 'hero', initialValue: 'image',
      options: { list: [{ title: 'Une photo', value: 'image' }, { title: 'Une vidéo (teaser)', value: 'video' }], layout: 'radio' },
    }),
    defineField({
      name: 'heroImage', title: 'Photo (ou image d’aperçu de la vidéo)', type: 'image', group: 'hero', options: { hotspot: true },
      description: 'Format paysage conseillé, 1 600 px de large minimum. Elle s’affiche aussi avant la lecture de la vidéo.',
      fields: [defineField({ name: 'alt', title: 'Description de l’image (pour les malvoyants)', type: 'string', validation: (r) => r.required() })],
    }),
    defineField({
      name: 'heroYoutubeUrl', title: 'Lien YouTube de la vidéo', type: 'url', group: 'hero',
      description: 'Recommandé : on colle simplement le lien de la vidéo YouTube. Elle ne se charge que si le visiteur clique sur lecture.',
      hidden: ({ document }) => document?.heroMediaType !== 'video',
      validation: (r) => r.uri({ scheme: ['https'] }).custom((v) => (!v || /youtu\.?be/.test(v) ? true : 'Ce n’est pas un lien YouTube')),
    }),
    defineField({
      name: 'heroVideoFile', title: 'Ou fichier vidéo (MP4)', type: 'file', group: 'hero', options: { accept: 'video/mp4' },
      description: 'Utilisé seulement si aucun lien YouTube n’est renseigné. Joue en boucle, sans son. Gardez un fichier léger (moins de 8 Mo).',
      hidden: ({ document }) => document?.heroMediaType !== 'video',
    }),
  ],
  preview: { prepare: () => ({ title: 'Réglages du site' }) },
});
