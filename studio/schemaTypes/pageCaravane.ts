import { defineField, defineType } from 'sanity';

export const pageCaravane = defineType({
  name: 'pageCaravane',
  title: 'Page Caravane : texte de présentation',
  type: 'document',
  fields: [
    defineField({ name: 'intro', title: 'Texte « Le principe »', type: 'text', rows: 8, validation: (r) => r.required().max(900) }),
  ],
  preview: { prepare: () => ({ title: 'Page Caravane : texte de présentation' }) },
});
