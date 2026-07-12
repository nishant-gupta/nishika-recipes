export default function decorate(block) {
  const rows = [...block.children];

  block.textContent = '';

  const inner = document.createElement('div');
  inner.className = 'feature-cards-inner';

  // Row 0: optional authored section heading (1 cell, no picture). Always
  // render an h2 here regardless — without one, the card titles below
  // (h3) would follow the page's h1 directly with no h2 in between.
  let startRow = 0;
  const firstCells = [...(rows[0]?.children || [])];
  const hasAuthoredHeading = firstCells.length === 1 && !firstCells[0].querySelector('picture');
  const heading = document.createElement('h2');
  heading.className = 'feature-cards-heading';
  heading.textContent = hasAuthoredHeading ? firstCells[0].textContent.trim() : 'What You’ll Find Here';
  inner.append(heading);
  if (hasAuthoredHeading) startRow = 1;

  const grid = document.createElement('div');
  grid.className = 'feature-cards-grid';

  rows.slice(startRow).forEach((row) => {
    const cells = [...row.children];
    const picture = cells[0]?.querySelector('picture');
    const title = cells[1]?.textContent.trim() || '';
    const bodyEl = cells[2];

    const card = document.createElement('div');
    card.className = `feature-card${picture ? ' feature-card-has-image' : ''}`;

    if (picture) {
      const img = picture.querySelector('img');
      if (img) img.loading = 'lazy';
      const imageWrap = document.createElement('div');
      imageWrap.className = 'feature-card-image';
      imageWrap.append(picture);
      card.append(imageWrap);
    }

    const body = document.createElement('div');
    body.className = 'feature-card-body';

    if (title) {
      const h3 = document.createElement('h3');
      h3.className = 'feature-card-title';
      h3.textContent = title;
      body.append(h3);
    }

    if (bodyEl) {
      const desc = document.createElement('div');
      desc.className = 'feature-card-desc';
      desc.innerHTML = bodyEl.innerHTML;
      body.append(desc);
    }

    card.append(body);
    grid.append(card);
  });

  inner.append(grid);
  block.append(inner);
}
