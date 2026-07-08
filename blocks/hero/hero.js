export default function decorate(block) {
  const [row] = block.children;
  if (!row) return;

  const cells = [...row.children];

  if (cells.length >= 2) {
    const content = document.createElement('div');
    content.className = 'hero-content';
    while (cells[0].firstChild) content.append(cells[0].firstChild);

    const postcard = document.createElement('div');
    postcard.className = 'hero-postcard';
    while (cells[1].firstChild) postcard.append(cells[1].firstChild);

    block.textContent = '';
    block.append(content, postcard);
  } else {
    const content = document.createElement('div');
    content.className = 'hero-content';
    while (cells[0].firstChild) content.append(cells[0].firstChild);
    block.textContent = '';
    block.append(content);
  }
}
