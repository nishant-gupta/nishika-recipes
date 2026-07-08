export default function decorate(block) {
  const rows = [...block.children];

  // Two-column layout: content | postcard
  if (rows.length === 1 && rows[0].children.length === 2) {
    const [contentCell, postcardCell] = [...rows[0].children];

    const content = document.createElement('div');
    content.className = 'hero-content';
    while (contentCell.firstElementChild) content.append(contentCell.firstElementChild);

    const postcard = document.createElement('div');
    postcard.className = 'hero-postcard';
    while (postcardCell.firstChild) postcard.append(postcardCell.firstChild);

    block.textContent = '';
    block.append(content, postcard);
    return;
  }

  // Single-column fallback
  const content = document.createElement('div');
  content.className = 'hero-content';
  rows.forEach((row) => {
    while (row.firstElementChild) content.append(row.firstElementChild);
  });
  block.textContent = '';
  block.append(content);
}
