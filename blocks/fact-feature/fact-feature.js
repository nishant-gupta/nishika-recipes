export default function decorate(block) {
  const [row] = block.children;
  if (!row) return;

  const cells = [...row.children];
  const content = document.createElement('div');
  content.className = 'fact-feature-content';
  while (cells[0].firstChild) content.append(cells[0].firstChild);

  block.textContent = '';

  if (cells.length >= 2) {
    const picture = cells[1].querySelector('picture');
    const visual = document.createElement('div');
    visual.className = 'fact-feature-visual';
    if (picture) {
      visual.appendChild(picture);
    }
    block.append(content, visual);
  } else {
    block.append(content);
  }
}
