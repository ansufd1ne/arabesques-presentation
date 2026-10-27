import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { frFRLocale } from '@sanity/locale-fr-fr';
import { schemaTypes } from './schemaTypes';

const singletons = ['siteSettings', 'pageCaravane'];

export default defineConfig({
  name: 'arabesques',
  title: 'Festival Arabesques',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: 'production',
  // interface du Studio en français (boutons, menus, messages)
  plugins: [
    frFRLocale(),
    structureTool({
      structure: (S) =>
        S.list().title('Contenu').items([
          S.listItem().title('Réglages du site (hero, textes d’accueil)').id('siteSettings')
            .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
          S.divider(),
          S.documentTypeListItem('concert').title('Concerts et artistes'),
          S.documentTypeListItem('section').title('Soirées et lieux'),
          S.divider(),
          S.listItem().title('Caravane : texte de présentation').id('pageCaravane')
            .child(S.document().schemaType('pageCaravane').documentId('pageCaravane')),
          S.documentTypeListItem('caravaneEvent').title('Caravane : événements (à venir et archives)'),
          S.documentTypeListItem('presseItem').title('Page Presse : blocs'),
          S.divider(),
          S.documentTypeListItem('pageLibre').title('Pages libres (nouvelles pages)'),
        ]),
    }),
  ],
  schema: {
    types: schemaTypes,
    // le document « Réglages » est unique : on interdit d'en créer d'autres ou de le supprimer
    templates: (templates) => templates.filter(({ schemaType }) => !singletons.includes(schemaType)),
  },
  document: {
    actions: (prev, { schemaType }) => (singletons.includes(schemaType) ? prev.filter(({ action }) => action !== 'delete' && action !== 'duplicate') : prev),
  },
});
