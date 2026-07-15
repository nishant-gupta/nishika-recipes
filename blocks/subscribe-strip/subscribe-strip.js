export default function decorate(block) {
  const cells = [...(block.children[0]?.children || [])];
  const heading = cells[0]?.textContent.trim() || 'Get the next issue in your inbox';
  const description = cells[1]?.textContent.trim() || '';

  block.textContent = '';

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

  // Form embed placeholder — the Kit script is injected during the delayed
  // phase (scripts/delayed.js) so reCAPTCHA and third-party assets don't
  // block the lazy render or affect CWV scores.
  const formWrap = document.createElement('div');
  formWrap.className = 'subscribe-form-embed';
  formWrap.dataset.kitUid = '2dfb239125';

  inner.append(formWrap);
  block.append(inner);
}
