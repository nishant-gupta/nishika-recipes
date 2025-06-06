import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ol');
  [...block.children].forEach((row) => {
    let li = document.createElement('li');
    const link = row.querySelector('a')?.href;
    row.querySelector('a')?.remove();
    if (link) {
      const a = document.createElement('a');
      a.href = link;
      a.append(li);
      li = a;
    }
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'step-image';
      else div.className = 'step-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);
}
