export default function decorate(block) {
  const rows = [...block.children];

  // Row 0: eyebrow  Row 1: heading  Row 2: description
  // Rows 3+: feature cards (cell 0 = title, cell 1 = body)
  const eyebrowText = rows[0]?.children[0]?.textContent.trim() || '';
  const headingText = rows[1]?.children[0]?.textContent.trim() || '';
  const descEl = rows[2]?.children[0];
  const featureRows = rows.slice(3);

  block.textContent = '';

  // ── Intro section ────────────────────────────────────
  const intro = document.createElement('div');
  intro.className = 'about-intro';

  const introInner = document.createElement('div');
  introInner.className = 'about-intro-inner';

  if (eyebrowText) {
    const eyebrow = document.createElement('span');
    eyebrow.className = 'about-eyebrow';
    eyebrow.textContent = eyebrowText;
    introInner.append(eyebrow);
  }

  if (headingText) {
    const h1 = document.createElement('h1');
    h1.className = 'about-heading';
    h1.textContent = headingText;
    introInner.append(h1);
  }

  if (descEl) {
    const desc = document.createElement('div');
    desc.className = 'about-description';
    desc.innerHTML = descEl.innerHTML;
    introInner.append(desc);
  }

  intro.append(introInner);
  block.append(intro);

  // ── Feature cards ─────────────────────────────────────
  if (featureRows.length > 0) {
    const featuresSection = document.createElement('div');
    featuresSection.className = 'about-features';

    const featuresInner = document.createElement('div');
    featuresInner.className = 'about-features-inner';

    const grid = document.createElement('div');
    grid.className = 'about-features-grid';

    featureRows.forEach((row) => {
      const title = row.children[0]?.textContent.trim() || '';
      const bodyEl = row.children[1];

      const card = document.createElement('div');
      card.className = 'about-feature-card';

      const cardTitle = document.createElement('h3');
      cardTitle.className = 'about-feature-title';
      cardTitle.textContent = title;
      card.append(cardTitle);

      if (bodyEl) {
        const cardBody = document.createElement('div');
        cardBody.className = 'about-feature-body';
        cardBody.innerHTML = bodyEl.innerHTML;
        card.append(cardBody);
      }

      grid.append(card);
    });

    featuresInner.append(grid);
    featuresSection.append(featuresInner);
    block.append(featuresSection);
  }
}
