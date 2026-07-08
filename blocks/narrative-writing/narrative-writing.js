function loadHandwritingFont() {
  if (!document.querySelector('link[href*="Caveat"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap';
    document.head.appendChild(link);
  }
}

function parseNarrative(block) {
  const data = {
    title: '', author: '', date: '', prompt: '', paragraphs: [],
  };

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const key = cells[0].textContent.trim().toLowerCase();
    const value = cells[1].textContent.trim();

    if (key === 'title') {
      data.title = value;
    } else if (key === 'author') {
      data.author = value;
    } else if (key === 'date') {
      data.date = value;
    } else if (key === 'prompt') {
      data.prompt = value;
    } else if (key === 'body') {
      const paras = cells[1].querySelectorAll('p');
      if (paras.length) {
        data.paragraphs = [...paras].map((p) => p.textContent.trim()).filter(Boolean);
      } else {
        data.paragraphs = value.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
      }
    }
  });

  return data;
}

export default function decorate(block) {
  loadHandwritingFont();

  const data = parseNarrative(block);

  if (!data.title && !data.paragraphs.length) {
    block.innerHTML = '<p style="text-align:center;padding:40px">No content found. Add Title / Author / Date / Body rows.</p>';
    return;
  }

  block.textContent = '';

  const notebook = document.createElement('div');
  notebook.className = 'notebook-page';

  // Binding rings
  const rings = document.createElement('div');
  rings.className = 'notebook-rings';
  for (let i = 0; i < 5; i += 1) {
    const ring = document.createElement('div');
    ring.className = 'notebook-ring';
    rings.appendChild(ring);
  }
  notebook.appendChild(rings);

  // Page content
  const page = document.createElement('div');
  page.className = 'notebook-inner';

  if (data.prompt) {
    const promptEl = document.createElement('div');
    promptEl.className = 'notebook-prompt';
    const promptLabel = document.createElement('span');
    promptLabel.className = 'notebook-prompt-label';
    promptLabel.textContent = 'Writing Prompt';
    const promptText = document.createElement('p');
    promptText.textContent = data.prompt;
    promptEl.append(promptLabel, promptText);
    page.appendChild(promptEl);
  }

  if (data.title) {
    const title = document.createElement('h2');
    title.className = 'notebook-title';
    title.textContent = data.title;
    page.appendChild(title);
  }

  const body = document.createElement('div');
  body.className = 'notebook-body';

  data.paragraphs.forEach((para) => {
    const p = document.createElement('p');
    p.textContent = para;
    body.appendChild(p);
  });

  page.appendChild(body);

  if (data.author || data.date) {
    const attribution = document.createElement('div');
    attribution.className = 'notebook-attribution';
    if (data.author) {
      const authorEl = document.createElement('span');
      authorEl.className = 'notebook-author';
      authorEl.textContent = `— ${data.author}`;
      attribution.appendChild(authorEl);
    }
    if (data.date) {
      const dateEl = document.createElement('span');
      dateEl.className = 'notebook-date';
      dateEl.textContent = data.date;
      attribution.appendChild(dateEl);
    }
    page.appendChild(attribution);
  }

  notebook.appendChild(page);
  block.appendChild(notebook);
}
