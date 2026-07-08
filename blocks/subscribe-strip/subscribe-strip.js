export default function decorate(block) {
  const cells = [...(block.children[0]?.children || [])];
  const heading = cells[0]?.textContent.trim() || 'Get the next issue in your inbox';
  const description = cells[1]?.textContent.trim() || '';

  block.textContent = '';

  const inner = document.createElement('div');
  inner.className = 'subscribe-inner';

  const h2 = document.createElement('h2');
  h2.className = 'subscribe-heading';
  h2.textContent = heading;

  inner.append(h2);

  if (description) {
    const p = document.createElement('p');
    p.className = 'subscribe-desc';
    p.textContent = description;
    inner.append(p);
  }

  const form = document.createElement('div');
  form.className = 'subscribe-form';

  const input = document.createElement('input');
  input.type = 'email';
  input.placeholder = 'your email address';
  input.className = 'subscribe-input';
  input.setAttribute('aria-label', 'Email address');

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'subscribe-btn';
  btn.textContent = 'Subscribe →';

  // Placeholder handler — wire up to real provider later
  btn.addEventListener('click', () => {
    const email = input.value.trim();
    if (!email || !email.includes('@')) {
      input.classList.remove('shake');
      requestAnimationFrame(() => input.classList.add('shake'));
      input.addEventListener('animationend', () => input.classList.remove('shake'), { once: true });
      return;
    }
    btn.textContent = 'Thanks! ✓';
    btn.disabled = true;
    input.disabled = true;
  });

  form.append(input, btn);
  inner.append(form);
  block.append(inner);
}
