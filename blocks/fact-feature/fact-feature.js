export default function decorate(block) {
  const [row] = block.children;
  if (!row) return;

  const cells = [...row.children];
  const content = document.createElement('div');
  content.className = 'fact-feature-content';
  while (cells[0].firstChild) content.append(cells[0].firstChild);

  block.textContent = '';

  if (cells.length >= 2) {
    const pictures = [...cells[1].querySelectorAll('picture')];
    const desktopPicture = pictures[0] || null;
    const mobilePicture = pictures[1] || null;

    const visual = document.createElement('div');
    visual.className = 'fact-feature-visual';

    if (desktopPicture) {
      if (mobilePicture) {
        const mobileImg = mobilePicture.querySelector('img');
        if (mobileImg) {
          const source = document.createElement('source');
          source.media = '(max-width: 768px)';
          source.srcset = mobileImg.src;
          desktopPicture.prepend(source);
        }
      }
      visual.appendChild(desktopPicture);
    }

    block.append(content, visual);
  } else {
    block.append(content);
  }
}
