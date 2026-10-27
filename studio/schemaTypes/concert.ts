import { defineField, defineType } from 'sanity';

export const concert = defineType({
  name: 'concert',
  title: 'Concert ou artiste',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Nom de l’artiste', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Adresse de la page', type: 'slug', options: { source: 'name', maxLength: 60 }, description: 'Générée à partir du nom. Ne plus la changer une fois le concert en ligne.', validation: (r) => r.required() }),
    defineField({ name: 'date', title: 'Date du concert', type: 'date', validation: (r) => r.required() }),
    defineField({ name: 'section', title: 'Soirée ou lieu', type: 'reference', to: [{ type: 'section' }], validation: (r) => r.required() }),
    defineField({ name: 'order', title: 'Ordre dans la journée', type: 'number', initialValue: 0, description: 'Pour classer deux concerts du même jour (0 = premier).' }),
    defineField({ name: 'complet', title: 'Complet', type: 'boolean', initialValue: false }),
    defineField({ name: 'hidden', title: 'Masquer du site', type: 'boolean', initialValue: false, description: 'Cache le concert sans le supprimer.' }),
    defineField({
      name: 'image', title: 'Photo', type: 'image', options: { hotspot: true },
      description: 'Paysage ou carré, 1 400 px de large minimum.',
      fields: [defineField({ name: 'alt', title: 'Description de l’image', type: 'string' })],
    }),
    defineField({ name: 'bio', title: 'Présentation', type: 'text', rows: 8 }),
  ],
  orderings: [{ title: 'Date', name: 'date', by: [{ field: 'date', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'date', media: 'image' } },
});
