import { defineField, defineType } from 'sanity';

export const section = defineType({
  name: 'section',
  title: 'Soirée ou lieu',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Titre', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'id', title: 'Identifiant technique', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({ name: 'dates', title: 'Dates affichées', type: 'string', description: 'Ex. : Du vendredi 11 au dimanche 13 septembre', validation: (r) => r.required() }),
    defineField({ name: 'venue', title: 'Lieu', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'order', title: 'Ordre d’affichage', type: 'number', validation: (r) => r.required().integer().min(0) }),
  ],
  orderings: [{ title: 'Ordre d’affichage', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'title', subtitle: 'dates' } },
});
