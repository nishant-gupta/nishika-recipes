export default function decorate(block) {
  const tiles = [...block.children].map((row) => {
    const cells = [...row.children];
    const linkEl = row.querySelector('a');
    const picture = row.querySelector('picture');
    if (picture) picture.remove();
    // Support EDS :icon-name: syntax — decorateIcons renders it as .icon span before block loads
    const iconSpan = cells[0]?.querySelector('.icon');
    return {
      iconSpan: iconSpan ? iconSpan.cloneNode(true) : null,
      icon: iconSpan ? '' : (cells[0]?.textContent.trim() || ''),
      title: cells[1]?.textContent.trim() || '',
      description: cells[2]?.textContent.trim() || '',
      linkText: cells[3]?.textContent.trim() || 'Browse →',
      href: linkEl?.href || '#',
      picture: picture || null,
    };
  }).filter((t) => t.title);

  block.textContent = '';

  const grid = document.createElement('div');
  grid.className = 'section-grid-inner';

  tiles.forEach((tile) => {
    const item = document.createElement('div');
    item.className = 'section-tile';

    if (tile.picture) {
      const imgWrap = document.createElement('div');
      imgWrap.className = 'section-tile-image';
      imgWrap.appendChild(tile.picture);
      item.append(imgWrap);
    } else {
      const icon = document.createElement('div');
      icon.className = 'section-tile-icon';
      if (tile.iconSpan) {
        icon.appendChild(tile.iconSpan);
      } else {
        icon.textContent = tile.icon;
      }
      item.append(icon);
    }

    const body = document.createElement('div');
    body.className = 'section-tile-body';

    const title = document.createElement('h3');
    title.className = 'section-tile-title';
    title.textContent = tile.title;

    const desc = document.createElement('p');
    desc.className = 'section-tile-desc';
    desc.textContent = tile.description;

    const link = document.createElement('a');
    link.href = tile.href;
    link.className = 'section-tile-link';
    link.textContent = tile.linkText;

    body.append(title, desc, link);
    item.append(body);
    grid.append(item);
  });

  block.append(grid);
}
