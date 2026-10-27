import { defineField, defineType } from 'sanity';

export const caravaneEvent = defineType({
  name: 'caravaneEvent',
  title: 'Événement de la Caravane',
  type: 'document',
  fields: [
    defineField({
      name: 'kind', title: 'Où l’afficher ?', type: 'string', initialValue: 'upcoming', validation: (r) => r.required(),
      options: { list: [{ title: 'À venir (prochaines caravanes)', value: 'upcoming' }, { title: 'Archives (événements passés)', value: 'past' }], layout: 'radio' },
    }),
    defineField({ name: 'title', title: 'Nom de l’événement ou de l’artiste', type: 'string', validation: (r) => r.required().max(80) }),
    defineField({ name: 'when', title: 'Date et lieu affichés', type: 'string', description: 'Ex. : 21 OCT. · L’AGORA, MONTPELLIER', validation: (r) => r.required().max(80) }),
    defineField({ name: 'url', title: 'Lien « Plus d’infos »', type: 'url', description: 'Page de la salle ou de la billetterie. Facultatif pour les archives.', validation: (r) => r.uri({ scheme: ['https'] }) }),
    defineField({
      name: 'image', title: 'Photo (archives)', type: 'image', options: { hotspot: true },
      description: 'Carrée ou paysage, 800 px de large minimum. Affichée dans la galerie des archives.',
      fields: [defineField({ name: 'alt', title: 'Description de l’image', type: 'string' })],
      hidden: ({ document }) => document?.kind !== 'past',
    }),
    defineField({ name: 'order', title: 'Ordre d’affichage', type: 'number', initialValue: 0, description: 'Petit nombre = affiché en premier.' }),
    defineField({ name: 'hidden', title: 'Masquer du site', type: 'boolean', initialValue: false, description: 'Cache l’événement sans le supprimer.' }),
  ],
  orderings: [{ title: 'Ordre d’affichage', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'title', subtitle: 'when', media: 'image' } },
});
