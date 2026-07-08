function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function decorate(block) {
  const cards = [...block.children].map((row) => {
    const cells = [...row.children];
    const linkEl = row.querySelector('a');
    const picture = row.querySelector('picture');
    return {
      tag: cells[0]?.textContent.trim() || '',
      title: cells[1]?.textContent.trim() || '',
      description: cells[2]?.textContent.trim() || '',
      meta: cells[3]?.textContent.trim() || '',
      href: linkEl?.href || '#',
      picture: picture || null,
    };
  }).filter((c) => c.title);

  block.textContent = '';

  const grid = document.createElement('div');
  grid.className = 'featured-picks-grid';

  cards.forEach((card) => {
    const a = document.createElement('a');
    a.href = card.href;
    a.className = `featured-pick cat-${slugify(card.tag)}`;

    if (card.picture) {
      const imgWrap = document.createElement('div');
      imgWrap.className = 'featured-pick-image';
      imgWrap.appendChild(card.picture);
      a.appendChild(imgWrap);
    }

    const body = document.createElement('div');
    body.className = 'featured-pick-body';

    const tag = document.createElement('span');
    tag.className = `featured-pick-tag tag-${slugify(card.tag)}`;
    tag.textContent = card.tag;

    const title = document.createElement('h3');
    title.className = 'featured-pick-title';
    title.textContent = card.title;

    const desc = document.createElement('p');
    desc.className = 'featured-pick-desc';
    desc.textContent = card.description;

    body.append(tag, title, desc);

    if (card.meta) {
      const meta = document.createElement('div');
      meta.className = 'featured-pick-meta';
      meta.textContent = card.meta;
      body.append(meta);
    }

    a.appendChild(body);
    grid.append(a);
  });

  block.append(grid);
}
