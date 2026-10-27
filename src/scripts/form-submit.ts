// Envoi des formulaires (contact et newsletter) : un seul envoi à la fois, 3 s minimum entre deux envois,
// délai maximum de 15 s, erreur annoncée à part (role="alert") du succès (role="status").
const DELAI_MAX_MS = 15000;
const PAUSE_MIN_MS = 3000;

interface Options {
  form: HTMLFormElement;
  status: HTMLElement;      // succès et information (role="status")
  error: HTMLElement;       // erreurs (role="alert")
  piege: string;            // nom du champ piège anti-spam
  messages: { envoi: string; succes: string; echec: string; delai: string; patience: string };
  /** Sans point d'envoi : retourne l'URL mailto: à ouvrir (null si l'envoi par mailto n'est pas possible). */
  mailto?: (data: FormData) => string | null;
  messageMailto?: string;
}

export function initForm({ form, status, error, piege, messages, mailto, messageMailto }: Options) {
  const bouton = form.querySelector<HTMLButtonElement>('button[type=submit]');
  if (!bouton) return;
  const libelle = bouton.querySelector('span') ?? bouton;
  const libelleInitial = libelle.textContent ?? '';
  const endpoint = form.dataset.endpoint ?? '';
  let enCours = false;
  let dernierEnvoi = 0;

  const afficher = (cible: HTMLElement, autre: HTMLElement, texte: string, etat: string) => {
    autre.textContent = '';
    autre.removeAttribute('data-state');
    cible.textContent = texte;
    cible.dataset.state = etat;
  };
  const info = (t: string) => afficher(status, error, t, 'info');
  const ok = (t: string) => afficher(status, error, t, 'ok');
  const echec = (t: string) => afficher(error, status, t, 'error');

  const occupe = (oui: boolean) => {
    enCours = oui;
    bouton.disabled = oui;
    if (oui) form.setAttribute('aria-busy', 'true'); else form.removeAttribute('aria-busy');
    libelle.textContent = oui ? 'Envoi en cours' : libelleInitial;
  };

  // Champ invalide : nom lisible pour l'annonce (data-erreur, sinon libellé associé sans « * »)
  type Champ = HTMLInputElement | HTMLTextAreaElement;
  const nomDuChamp = (c: Champ) =>
    c.dataset.erreur || (c.labels?.[0]?.textContent ?? c.name).replace(/\*/g, '').replace(/\s+/g, ' ').trim() || c.name;
  const champs = () => [...form.elements].filter((c): c is Champ => c instanceof HTMLInputElement || c instanceof HTMLTextAreaElement);
  // La correction d'un champ retire son marquage d'erreur
  champs().forEach((c) => {
    const retire = () => { if (c.getAttribute('aria-invalid') && c.checkValidity()) c.removeAttribute('aria-invalid'); };
    c.addEventListener('input', retire);
    c.addEventListener('change', retire);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (enCours) return;
    if ((form.elements.namedItem(piege) as HTMLInputElement | null)?.value) return; // piège anti-spam : on ne répond rien
    if (!form.checkValidity()) {
      // Erreur persistante et annoncée (role="alert") : champs concernés nommés, aria-invalid, focus sur le premier
      const invalides = champs().filter((c) => !c.checkValidity());
      champs().forEach((c) => (c.checkValidity() ? c.removeAttribute('aria-invalid') : c.setAttribute('aria-invalid', 'true')));
      const noms = invalides.map(nomDuChamp);
      echec(`${noms.length > 1 ? 'Merci de corriger ou de compléter les champs suivants' : 'Merci de corriger ou de compléter le champ suivant'} : ${noms.join(', ')}.`);
      invalides[0]?.focus();
      return;
    }
    if (Date.now() - dernierEnvoi < PAUSE_MIN_MS) { info(messages.patience); return; }

    const donnees = new FormData(form);
    if (!endpoint) {
      const lien = mailto?.(donnees);
      if (!lien) { echec(messages.echec); return; }
      dernierEnvoi = Date.now();
      location.href = lien;
      info(messageMailto ?? '');
      return;
    }

    dernierEnvoi = Date.now();
    occupe(true);
    status.textContent = '';
    error.textContent = '';
    info(messages.envoi + '…');
    const ac = new AbortController();
    const minuteur = setTimeout(() => ac.abort(), DELAI_MAX_MS);
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: donnees, signal: ac.signal });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      ok(messages.succes);
    } catch (err) {
      echec((err as Error)?.name === 'AbortError' ? messages.delai : messages.echec);
    } finally {
      clearTimeout(minuteur);
      occupe(false);
    }
  });
}
