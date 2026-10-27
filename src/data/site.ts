export const site = {
  name: 'Festival Arabesques',
  url: 'https://www.festivalarabesques.fr',
  edition: '8 au 20 septembre 2026',
  city: 'Montpellier',
  org: 'UNi’SONS',
  address: ['475 Avenue du Comté de Nice', '34080 Montpellier FRANCE'],
  phone: '04 99 77 00 17',
  hours: '10h - 18h en semaine & 12h - 21h en week-end',
  // Adresse e-mail publique (celle de l'administration UNi'SONS, déjà publiée sur unisons.fr). PUBLIC_CONTACT_EMAIL la remplace au build.
  contactEmail: (import.meta.env.PUBLIC_CONTACT_EMAIL ?? '').trim() || 'administration@unisons.fr',
};

export const nav = [
  { label: 'Le festival', href: '/festival' },
  { label: 'Programmation', href: '/programmation' },
  { label: 'Infos pratiques', href: '/informations-pratiques' },
  { label: 'Contact', href: '/contact' },
];

export const menu = [
  { label: 'Accueil', href: '/' },
  { label: 'Le festival', href: '/festival' },
  { label: 'Programmation 2026', href: '/programmation' },
  { label: 'Arabesques Music Forum', href: '/arabesques-music-forum' },
  { label: 'Caravane Arabesques', href: '/caravane-arabesques' },
  { label: 'Infos pratiques', href: '/informations-pratiques' },
  { label: 'Partenaires', href: '/partenaires' },
  { label: 'Presse', href: '/presse' },
  { label: 'Contact', href: '/contact' },
];

export const social = [
  { label: 'Instagram', href: 'https://www.instagram.com/festivalarabesques' },
  { label: 'Facebook', href: 'https://www.facebook.com/pages/Festival-Arabesques/183927939750' },
  { label: 'YouTube', href: 'https://www.youtube.com/user/unisons34' },
];

export const footerCols = [
  { title: 'Festival Arabesques', links: [
    { label: 'UNi’SONS', href: 'https://unisons-presentation.vercel.app/' },
    { label: 'La programmation', href: '/programmation' },
    { label: 'Caravane Arabesques', href: '/caravane-arabesques' },
    { label: 'Nos partenaires', href: '/partenaires' },
  ]},
  { title: 'Retrouvez-nous', links: [
    { label: 'Contactez-nous', href: '/contact' },
    { label: 'Presse', href: '/presse' },
    { label: 'Infos pratiques', href: '/informations-pratiques' },
  ]},
  { title: 'Informations', links: [
    { label: 'Mentions légales', href: '/mentions-legales' },
    { label: 'Conditions générales de vente', href: '/conditions-generales-de-vente' },
    { label: 'Politique de confidentialité', href: '/politique-de-confidentialite' },
  ]},
];

// Chiffres : communiqué de presse 2026 (festivalarabesques.fr)
export const stats = [
  { value: '54 rendez-vous', note: 'dont 36 événements gratuits', who: 'Édition 2026' },
  { value: 'Plus de 65 000 spectateurs', note: 'sur deux semaines à Montpellier', who: 'Édition 2026' },
  { value: 'Près de 300 artistes', note: 'accueillis du 8 au 20 septembre', who: 'Édition 2026' },
];

export const marquee = ['Musique', 'Danse', 'Cinéma', 'Littérature', 'Montpellier', '8 au 20 sept. 2026'];

// Identifiants stables des entités schema.org (JSON-LD) : l'organisation est définie une fois dans le gabarit (Base.astro),
// le festival 2026 sur l'accueil ; les fiches concerts s'y rattachent par `superEvent` et `organizer`.
export const ids = {
  org: `${site.url}/#org`,
  festival2026: `${site.url}/#festival-2026`,
};

// Adresses réelles des lieux (les mêmes que sur l'accueil, section « Où ça se passe »).
export const lieux: Record<string, { name: string; street: string; postal: string }> = {
  'Opéra Comédie': { name: 'Opéra Comédie', street: '11 Boulevard Victor Hugo', postal: '34000' },
  'Domaine d’O': { name: 'Domaine d’O', street: '178 Rue de la Carrierasse', postal: '34090' },
  'Halle Tropisme': { name: 'Halle Tropisme', street: '121 Rue Fontcouverte', postal: '34000' },
};
export const lieuPour = (venue: string) => lieux[venue.replace(/'/g, '’').trim()];
