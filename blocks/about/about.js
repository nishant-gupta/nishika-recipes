export default function decorate(block) {
  const rows = [...block.children];

  // Row 0: eyebrow  Row 1: heading  Row 2: description (cell 0) | photo (cell 1)
  const eyebrowText = rows[0]?.children[0]?.textContent.trim() || '';
  const headingText = rows[1]?.children[0]?.textContent.trim() || '';
  const descEl = rows[2]?.children[0];
  const photoPicture = rows[2]?.children[1]?.querySelector('picture');

  block.textContent = '';

  const intro = document.createElement('div');
  intro.className = 'about-intro';

  // Inner wrapper constrains content width while background stays full-width
  const introInner = document.createElement('div');
  introInner.className = `about-intro-inner${photoPicture ? ' about-intro-split' : ''}`;

  // ── Text side ────────────────────────────────────────
  const textSide = document.createElement('div');
  textSide.className = 'about-intro-text';

  if (eyebrowText) {
    const eyebrow = document.createElement('span');
    eyebrow.className = 'about-eyebrow';
    eyebrow.textContent = eyebrowText;
    textSide.append(eyebrow);
  }

  if (headingText) {
    const h1 = document.createElement('h1');
    h1.className = 'about-heading';
    h1.textContent = headingText;
    textSide.append(h1);
  }

  if (descEl) {
    const desc = document.createElement('div');
    desc.className = 'about-description';
    desc.innerHTML = descEl.innerHTML;
    textSide.append(desc);
  }

  introInner.append(textSide);

  // ── Photo side ───────────────────────────────────────
  if (photoPicture) {
    const photoImg = photoPicture.querySelector('img');
    if (photoImg) photoImg.loading = 'eager';

    const photoSide = document.createElement('div');
    photoSide.className = 'about-intro-photo';
    photoSide.append(photoPicture);
    introInner.append(photoSide);
  }

  intro.append(introInner);
  block.append(intro);
}
