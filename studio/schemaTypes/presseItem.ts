import { defineField, defineType } from 'sanity';

export const presseItem = defineType({
  name: 'presseItem',
  title: 'Bloc de la page Presse',
  type: 'document',
  fields: [
    defineField({ name: 'label', title: 'Petit titre', type: 'string', description: 'Ex. : Édition 2026, Professionnels, Contact', validation: (r) => r.required().max(40) }),
    defineField({ name: 'title', title: 'Titre', type: 'string', validation: (r) => r.required().max(80) }),
    defineField({ name: 'text', title: 'Texte', type: 'text', rows: 3, validation: (r) => r.required().max(240) }),
    defineField({ name: 'linkLabel', title: 'Texte du lien', type: 'string', description: 'Ex. : Lire le communiqué', validation: (r) => r.required().max(40) }),
    defineField({ name: 'url', title: 'Adresse du lien', type: 'string', description: 'Page du site (ex. : /presse/communique-2026) ou lien complet commençant par https://', validation: (r) => r.required().custom((v) => (!v || /^(\/|https:\/\/)/.test(v) ? true : 'Doit commencer par / ou https://')) }),
    defineField({ name: 'external', title: 'S’ouvre dans un nouvel onglet', type: 'boolean', initialValue: false, description: 'À cocher pour un lien vers un autre site.' }),
    defineField({ name: 'order', title: 'Ordre d’affichage', type: 'number', initialValue: 0 }),
    defineField({ name: 'hidden', title: 'Masquer du site', type: 'boolean', initialValue: false }),
  ],
  orderings: [{ title: 'Ordre d’affichage', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'title', subtitle: 'label' } },
});
