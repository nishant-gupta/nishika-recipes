export default function decorate(block) {
  const tiles = [...block.children].map((row) => {
    const cells = [...row.children];
    // Cell 0: optional image | Cell 1: title | Cell 2: description | Cell 3: link (authored <a>)
    const picture = cells[0]?.querySelector('picture') || null;
    const title = cells[1]?.textContent.trim() || '';
    const description = cells[2]?.textContent.trim() || '';
    const linkEl = cells[3]?.querySelector('a');
    return {
      picture,
      title,
      description,
      linkText: linkEl?.textContent.trim() || 'Browse →',
      href: linkEl?.href || '#',
    };
  }).filter((t) => t.title);

  block.textContent = '';

  const grid = document.createElement('div');
  grid.className = 'section-grid-inner';

  tiles.forEach((tile) => {
    const item = document.createElement('div');
    item.className = 'section-tile';

    if (tile.picture) {
      const img = tile.picture.querySelector('img');
      if (img) img.loading = 'lazy';
      const imgWrap = document.createElement('div');
      imgWrap.className = 'section-tile-image';
      imgWrap.append(tile.picture);
      item.append(imgWrap);
    }

    const body = document.createElement('div');
    body.className = 'section-tile-body';

    const titleEl = document.createElement('h3');
    titleEl.className = 'section-tile-title';
    titleEl.textContent = tile.title;

    const desc = document.createElement('p');
    desc.className = 'section-tile-desc';
    desc.textContent = tile.description;

    const link = document.createElement('a');
    link.href = tile.href;
    link.className = 'section-tile-link';
    link.textContent = tile.linkText;

    body.append(titleEl, desc, link);
    item.append(body);
    grid.append(item);
  });

  block.append(grid);
}
