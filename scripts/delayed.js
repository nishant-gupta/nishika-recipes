const GA_ID = 'G-LJ62YCR276';

// Load GA4 script
const script = document.createElement('script');
script.async = true;
script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
document.head.appendChild(script);

// Init dataLayer
window.dataLayer = window.dataLayer || [];
// eslint-disable-next-line prefer-rest-params
function gtag() { window.dataLayer.push(arguments); }
window.gtag = gtag;
gtag('js', new Date());
gtag('config', GA_ID);

// ── Newsletter form (Kit / ConvertKit) ──────────────────────────────────────
// Inject the Kit embed script into every subscribe-strip placeholder so that
// third-party assets (reCAPTCHA etc.) load after the page is interactive.
// Skip placeholders that already had the script injected early (e.g. #subscribe direct link)
document.querySelectorAll('.subscribe-form-embed[data-kit-uid]').forEach((wrap) => {
  if (wrap.querySelector('script')) return;
  const uid = wrap.dataset.kitUid;
  const kitScript = document.createElement('script');
  kitScript.async = true;
  kitScript.dataset.uid = uid;
  kitScript.src = `https://nishikas-notebook.kit.com/${uid}/index.js`;
  wrap.append(kitScript);
});

// ── Click tracking ───────────────────────────────────────────────────────────

/**
 * Returns the name of the EDS block an element belongs to, or 'page'.
 * Block wrapper divs have a class matching their block name e.g. "storybook".
 */
function getBlock(el) {
  const block = el.closest('[class]')?.className
    .split(' ')
    .find((c) => document.querySelector(`.block.${c}`));
  if (block) return block;
  const blockEl = el.closest('.block');
  if (blockEl) {
    return [...blockEl.classList].find((c) => c !== 'block') || 'block';
  }
  return 'page';
}

/**
 * Returns a human-readable label for a clicked element.
 */
function getLabel(el) {
  return (
    el.getAttribute('aria-label')
    || el.textContent.trim().slice(0, 60)
    || el.className
  );
}

document.addEventListener('click', (e) => {
  if (!window.gtag) return;

  const btn = e.target.closest('button');
  const link = e.target.closest('a');

  if (btn) {
    const block = getBlock(btn);
    window.gtag('event', 'button_click', {
      block,
      label: getLabel(btn),
    });
    return;
  }

  if (link) {
    const href = link.href || '';

    // Hero CTA
    if (link.closest('.hero-buttons')) {
      window.gtag('event', 'cta_click', {
        block: 'hero',
        label: getLabel(link),
        destination: href,
      });
      return;
    }

    // Featured picks card
    if (link.closest('.featured-pick')) {
      window.gtag('event', 'card_click', {
        block: 'featured-picks',
        label: link.querySelector('.featured-pick-title')?.textContent.trim() || getLabel(link),
        destination: href,
      });
      return;
    }

    // Header nav links
    if (link.closest('.nav-sections, .nav-brand')) {
      window.gtag('event', 'nav_click', {
        block: 'header',
        label: getLabel(link),
        destination: href,
      });
      return;
    }

    // Issue cover section links
    if (link.closest('.issue-hero-content-item')) {
      window.gtag('event', 'card_click', {
        block: 'issue-cover',
        label: getLabel(link),
        destination: href,
      });
    }
  }
});
