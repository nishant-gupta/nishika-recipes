export default function decorate(block) {
  const items = [...block.children].map((row) => {
    const cells = [...row.children];
    // Support EDS :icon-name: syntax in the content cell
    const contentCell = cells[1];
    const iconSpan = contentCell?.querySelector('.icon');
    if (iconSpan) iconSpan.remove();
    return {
      day: cells[0]?.textContent.trim() || '',
      content: contentCell?.textContent.trim() || '',
      iconSpan: iconSpan ? iconSpan.cloneNode(true) : null,
    };
  }).filter((item) => item.day);

  block.textContent = '';

  const strip = document.createElement('div');
  strip.className = 'schedule-strip-inner';

  items.forEach((item) => {
    const slot = document.createElement('div');
    slot.className = 'schedule-slot';

    const day = document.createElement('div');
    day.className = 'schedule-day';
    day.textContent = item.day;

    const content = document.createElement('div');
    content.className = 'schedule-content';

    if (item.iconSpan) {
      const iconWrap = document.createElement('span');
      iconWrap.className = 'schedule-icon';
      iconWrap.appendChild(item.iconSpan);
      content.append(iconWrap);
    }

    const text = document.createElement('span');
    text.textContent = item.content;
    content.append(text);

    slot.append(day, content);
    strip.append(slot);
  });

  block.append(strip);
}
