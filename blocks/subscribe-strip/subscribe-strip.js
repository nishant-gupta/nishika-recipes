export default function decorate(block) {
  const cells = [...(block.children[0]?.children || [])];
  const heading = cells[0]?.textContent.trim() || 'Get the next issue in your inbox';
  const description = cells[1]?.textContent.trim() || '';

  block.textContent = '';

  // Anchor so hero CTAs can deep-link with href="#subscribe"
  const anchor = document.createElement('span');
  anchor.id = 'subscribe';
  anchor.setAttribute('aria-hidden', 'true');
  block.append(anchor);

  const inner = document.createElement('div');
  inner.className = 'subscribe-inner';

  const h2 = document.createElement('h2');
  h2.className = 'subscribe-heading';
  h2.textContent = heading;

  inner.append(h2);

  if (description) {
    const p = document.createElement('p');
    p.className = 'subscribe-desc';
    p.textContent = description;
    inner.append(p);
  }

  // Form embed placeholder — the Kit script is normally injected during the
  // delayed phase (scripts/delayed.js) so reCAPTCHA and third-party assets
  // don't block the lazy render or affect CWV scores.
  // Exception: if the page was opened with #subscribe in the URL, load the
  // Kit script immediately so the form is visible when the browser scrolls
  // to the anchor, then re-scroll once the form has rendered.
  const KIT_UID = '2dfb239125';
  const formWrap = document.createElement('div');
  formWrap.className = 'subscribe-form-embed';
  formWrap.dataset.kitUid = KIT_UID;

  inner.append(formWrap);
  block.append(inner);

  function loadKit() {
    if (formWrap.querySelector('script')) return; // already injected
    const kitScript = document.createElement('script');
    kitScript.async = true;
    kitScript.dataset.uid = KIT_UID;
    kitScript.src = `https://nishikas-notebook.kit.com/${KIT_UID}/index.js`;
    formWrap.append(kitScript);
    // Re-scroll after the Kit form has rendered and expanded the section
    kitScript.addEventListener('load', () => {
      setTimeout(() => anchor.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    });
  }

  // Direct URL load: /#subscribe
  if (window.location.hash === '#subscribe') loadKit();

  // In-page CTA click: hash changes to #subscribe after the footer is already rendered
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#subscribe') loadKit();
  });
}
