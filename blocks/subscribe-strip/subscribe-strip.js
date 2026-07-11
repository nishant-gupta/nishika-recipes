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

  // Kit (ConvertKit) inline form embed. The UID/src is hardcoded here rather
  // than read from the authored block content — anyone with edit access to
  // the source document should not be able to point this block at an
  // arbitrary third-party script by editing a table cell.
  const KIT_FORM_UID = '2dfb239125';
  const KIT_SCRIPT_SRC = `https://nishikas-notebook.kit.com/${KIT_FORM_UID}/index.js`;

  const formWrap = document.createElement('div');
  formWrap.className = 'subscribe-form-embed';

  const script = document.createElement('script');
  script.async = true;
  script.dataset.uid = KIT_FORM_UID;
  script.src = KIT_SCRIPT_SRC;
  formWrap.append(script);

  inner.append(formWrap);
  block.append(inner);
}
