/*
 * Fragment Block
 * Include content on a page as a fragment.
 * https://www.aem.live/developer/block-collection/fragment
 */

import {
  decorateMain,
} from '../../scripts/scripts.js';

import {
  loadSections,
} from '../../scripts/aem.js';

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @param {string|null} blockType Optional block type to extract (e.g. 'idiom-of-week').
 *   When provided, only the section containing that block is kept and loaded.
 * @returns {HTMLElement} The root element of the fragment
 */
export async function loadFragment(path, blockType = null) {
  if (path && path.startsWith('/')) {
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();

      // reset base path for media to fragment base
      const resetAttributeBase = (tag, attr) => {
        main.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((elem) => {
          elem[attr] = new URL(elem.getAttribute(attr), new URL(path, window.location)).href;
        });
      };
      resetAttributeBase('img', 'src');
      resetAttributeBase('source', 'srcset');

      decorateMain(main);

      if (blockType) {
        // Keep only the section that contains the requested block type
        const target = [...main.querySelectorAll(':scope > .section')]
          .find((s) => s.querySelector(`.${blockType}`));
        if (target) main.replaceChildren(target);
      }

      await loadSections(main);
      return main;
    }
  }
  return null;
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();

  // Optional block type variant: Fragment (idiom-of-week) → class 'idiom-of-week'
  const blockType = [...block.classList].find((c) => c !== 'fragment' && c !== 'block') || null;

  const fragment = await loadFragment(path, blockType);
  if (fragment) {
    const fragmentSection = fragment.querySelector(':scope .section');
    if (fragmentSection) {
      block.closest('.section').classList.add(...fragmentSection.classList);
      block.closest('.fragment').replaceWith(...fragment.childNodes);
    }
  }
}
