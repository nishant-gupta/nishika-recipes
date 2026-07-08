export default function decorate(block) {
  const items = [...block.children].map((row) => {
    const cells = [...row.children];
    return {
      day: cells[0]?.textContent.trim() || '',
      content: cells[1]?.textContent.trim() || '',
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
    content.textContent = item.content;

    slot.append(day, content);
    strip.append(slot);
  });

  block.append(strip);
}
