export default function decorate(block) {
  const cards = [...block.children].map((row) => {
    const cells = [...row.children];
    const linkEl = row.querySelector('a');
    return {
      tag: cells[0]?.textContent.trim() || '',
      title: cells[1]?.textContent.trim() || '',
      description: cells[2]?.textContent.trim() || '',
      meta: cells[3]?.textContent.trim() || '',
      href: linkEl?.href || '#',
    };
  }).filter((c) => c.title);

  block.textContent = '';

  const grid = document.createElement('div');
  grid.className = 'featured-picks-grid';

  cards.forEach((card) => {
    const a = document.createElement('a');
    a.href = card.href;
    a.className = 'featured-pick';

    const tag = document.createElement('span');
    tag.className = `featured-pick-tag tag-${card.tag.toLowerCase().replace(/[^a-z]/g, '-')}`;
    tag.textContent = card.tag;

    const title = document.createElement('h3');
    title.className = 'featured-pick-title';
    title.textContent = card.title;

    const desc = document.createElement('p');
    desc.className = 'featured-pick-desc';
    desc.textContent = card.description;

    a.append(tag, title, desc);

    if (card.meta) {
      const meta = document.createElement('span');
      meta.className = 'featured-pick-meta';
      meta.textContent = card.meta;
      a.append(meta);
    }

    grid.append(a);
  });

  block.append(grid);
}
