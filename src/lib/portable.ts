import type { CmsBlockText } from './cms';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Seuls ces types d'adresse sont acceptés dans les liens saisis dans Sanity
const safeHref = (h?: string) => (h && /^(\/(?!\/)|https:\/\/|mailto:)/.test(h) ? h : null);

// Rendu minimal du texte riche Sanity : paragraphes, sous-titres, listes à puces, gras, italique, liens.
export function renderBlocks(blocks: CmsBlockText[] = []): string {
  let html = '';
  let inList = false;
  for (const b of blocks) {
    if (b._type !== 'block') continue;
    const inner = b.children.map((c) => {
      let t = esc(c.text).replace(/\n/g, '<br>');
      for (const m of c.marks ?? []) {
        if (m === 'strong') t = `<strong>${t}</strong>`;
        else if (m === 'em') t = `<em>${t}</em>`;
        else {
          const href = safeHref(b.markDefs?.find((d) => d._key === m)?.href);
          if (href) t = `<a href="${esc(href)}"${href.startsWith('https://') ? ' target="_blank" rel="noopener"' : ''}>${t}${href.startsWith('https://') ? '<span class="visually-hidden"> (nouvel onglet)</span>' : ''}</a>`;
        }
      }
      return t;
    }).join('');
    if (!inner.replace(/<[^>]+>/g, '').trim()) continue;
    if (b.listItem === 'bullet') {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${inner}</li>`;
      continue;
    }
    if (inList) { html += '</ul>'; inList = false; }
    html += b.style === 'h3' ? `<h3>${inner}</h3>` : `<p>${inner}</p>`;
  }
  if (inList) html += '</ul>';
  return html;
}
