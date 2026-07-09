export default function decorate(block) {
  const rows = [...block.children];

  // Row 0: desktop image | mobile image (optional second cell)
  const imgCells = [...(rows[0]?.children || [])];
  const desktopPicture = imgCells[0]?.querySelector('picture');
  const mobilePicture = imgCells[1]?.querySelector('picture');

  // Row 1: title
  const titleText = rows[1]?.children[0]?.textContent.trim() || '';

  // Row 2: description
  const descText = rows[2]?.children[0]?.textContent.trim() || '';

  // Flush section against nav
  const section = block.closest('.section');
  if (section) section.style.margin = '0';

  block.textContent = '';

  // ── Background ──────────────────────────────────────
  const bg = document.createElement('div');
  bg.className = 'page-hero-bg';

  if (desktopPicture) {
    const desktopImg = desktopPicture.querySelector('img');
    if (desktopImg) desktopImg.loading = 'eager';

    // Inject mobile source into the desktop picture element
    if (mobilePicture) {
      const mobileImg = mobilePicture.querySelector('img');
      if (mobileImg) {
        const source = document.createElement('source');
        source.media = '(max-width: 600px)';
        source.srcset = mobileImg.src;
        desktopPicture.prepend(source);
      }
    }

    bg.append(desktopPicture);
  }

  const overlay = document.createElement('div');
  overlay.className = 'page-hero-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  bg.append(overlay);

  // ── Content ──────────────────────────────────────────
  const content = document.createElement('div');
  content.className = 'page-hero-content';

  if (titleText) {
    const h1 = document.createElement('h1');
    h1.className = 'page-hero-title';
    h1.textContent = titleText;
    content.append(h1);
  }

  if (descText) {
    const p = document.createElement('p');
    p.className = 'page-hero-description';
    p.textContent = descText;
    content.append(p);
  }

  block.append(bg, content);
}
