import { defineArrayMember, defineField, defineType } from 'sanity';

// Adresses déjà prises par des pages du site : une page libre ne peut pas les reprendre
export const reservedSlugs = [
  '404', 'arabesques-music-forum', 'caravane-arabesques', 'conditions-generales-de-vente', 'contact', 'festival',
  'index', 'informations-pratiques', 'mentions-legales', 'partenaires', 'politique-de-confidentialite',
  'presse', 'programmation', 'l-art-est-public', 'admin', 'studio', 'api', 'sitemap',
];

const corps = defineArrayMember({
  type: 'block',
  styles: [{ title: 'Paragraphe', value: 'normal' }, { title: 'Sous-titre', value: 'h3' }],
  lists: [{ title: 'Liste à puces', value: 'bullet' }],
  marks: {
    decorators: [{ title: 'Gras', value: 'strong' }, { title: 'Italique', value: 'em' }],
    annotations: [{
      name: 'link', type: 'object', title: 'Lien',
      fields: [defineField({
        name: 'href', title: 'Adresse', type: 'string',
        description: 'Page du site (ex. : /contact), lien https://… ou adresse e-mail (mailto:…).',
        validation: (r) => r.required().custom((v) => (!v || /^(\/|https:\/\/|mailto:)/.test(v) ? true : 'Doit commencer par /, https:// ou mailto:')),
      })],
    }],
  },
});

const imageFields = [
  defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true }, validation: (r) => r.required(), description: '1200 px de large minimum.' }),
  defineField({ name: 'alt', title: 'Description de l’image', type: 'string', description: 'Lue par les lecteurs d’écran. Décrire ce qu’on voit.', validation: (r) => r.required().max(140) }),
];

export const pageLibre = defineType({
  name: 'pageLibre',
  title: 'Page libre',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Titre de la page', type: 'string', validation: (r) => r.required().max(80) }),
    defineField({
      name: 'slug', title: 'Adresse de la page', type: 'slug', options: { source: 'title', maxLength: 60 },
      description: 'Ex. : « benevoles » donne festivalarabesques.fr/benevoles. Ne plus la changer une fois la page publiée.',
      validation: (r) => r.required().custom((v) => {
        const s = v?.current;
        if (!s) return true;
        if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s)) return 'Lettres minuscules, chiffres et tirets seulement';
        return reservedSlugs.includes(s) ? 'Cette adresse est déjà utilisée par une page du site' : true;
      }),
    }),
    defineField({ name: 'label', title: 'Petit titre au-dessus', type: 'string', description: 'Ex. : Rejoignez-nous', validation: (r) => r.max(40) }),
    defineField({ name: 'sub', title: 'Phrase sous le titre', type: 'string', validation: (r) => r.max(120) }),
    defineField({
      name: 'description', title: 'Description pour Google', type: 'text', rows: 3,
      description: 'Une ou deux phrases qui résument la page (50 à 160 caractères).',
      validation: (r) => r.required().min(50).max(160),
    }),
    defineField({
      name: 'blocks', title: 'Contenu de la page', type: 'array',
      description: 'Ajoutez les blocs dans l’ordre où ils doivent apparaître. Glissez-déposez pour les réordonner.',
      validation: (r) => r.required().min(1),
      of: [
        defineArrayMember({
          name: 'texte', title: 'Texte', type: 'object',
          fields: [
            defineField({ name: 'heading', title: 'Titre du bloc', type: 'string', validation: (r) => r.max(80) }),
            defineField({ name: 'body', title: 'Texte', type: 'array', of: [corps], validation: (r) => r.required() }),
          ],
          preview: { select: { title: 'heading' }, prepare: ({ title }) => ({ title: title || 'Texte', subtitle: 'Bloc de texte' }) },
        }),
        defineArrayMember({
          name: 'imageSeule', title: 'Image', type: 'object',
          fields: [...imageFields, defineField({ name: 'caption', title: 'Légende', type: 'string', validation: (r) => r.max(140) })],
          preview: { select: { title: 'alt', media: 'image' }, prepare: ({ title, media }) => ({ title, subtitle: 'Image pleine largeur', media }) },
        }),
        defineArrayMember({
          name: 'texteImage', title: 'Texte et image côte à côte', type: 'object',
          fields: [
            defineField({ name: 'heading', title: 'Titre du bloc', type: 'string', validation: (r) => r.required().max(80) }),
            defineField({ name: 'body', title: 'Texte', type: 'array', of: [corps], validation: (r) => r.required() }),
            ...imageFields,
            defineField({
              name: 'side', title: 'Place de l’image', type: 'string', initialValue: 'left',
              options: { list: [{ title: 'À gauche', value: 'left' }, { title: 'À droite', value: 'right' }], layout: 'radio' },
            }),
          ],
          preview: { select: { title: 'heading', media: 'image' }, prepare: ({ title, media }) => ({ title, subtitle: 'Texte et image', media }) },
        }),
        defineArrayMember({
          name: 'bouton', title: 'Bouton', type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Texte du bouton', type: 'string', validation: (r) => r.required().max(40) }),
            defineField({ name: 'url', title: 'Adresse', type: 'string', description: 'Page du site (ex. : /contact) ou lien https://…', validation: (r) => r.required().custom((v) => (!v || /^(\/|https:\/\/)/.test(v) ? true : 'Doit commencer par / ou https://')) }),
          ],
          preview: { select: { title: 'label', subtitle: 'url' } },
        }),
      ],
    }),
    defineField({ name: 'hidden', title: 'Masquer du site', type: 'boolean', initialValue: false, description: 'La page n’est plus en ligne, sans être supprimée.' }),
  ],
  preview: { select: { title: 'title', subtitle: 'slug.current' } },
});
