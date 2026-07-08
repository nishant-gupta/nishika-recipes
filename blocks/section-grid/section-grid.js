export default function decorate(block) {
  const tiles = [...block.children].map((row) => {
    const cells = [...row.children];
    const linkEl = row.querySelector('a');
    return {
      icon: cells[0]?.textContent.trim() || '',
      title: cells[1]?.textContent.trim() || '',
      description: cells[2]?.textContent.trim() || '',
      linkText: cells[3]?.textContent.trim() || 'Browse →',
      href: linkEl?.href || '#',
    };
  }).filter((t) => t.title);

  block.textContent = '';

  const grid = document.createElement('div');
  grid.className = 'section-grid-inner';

  tiles.forEach((tile) => {
    const item = document.createElement('div');
    item.className = 'section-tile';

    const icon = document.createElement('div');
    icon.className = 'section-tile-icon';
    icon.textContent = tile.icon;

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

    item.append(icon, title, desc, link);
    grid.append(item);
  });

  block.append(grid);
}
