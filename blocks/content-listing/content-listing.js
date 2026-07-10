const TYPE_META = {
  riddle: { label: 'Riddle' },
  idiom: { label: 'Idiom' },
  science: { label: 'Science' },
  poem: { label: 'Poem' },
  story: { label: 'Story' },
  narrative: { label: 'Narrative' },
  craft: { label: 'Craft' },
};

function getIssueNum(tag) {
  const m = tag && tag.match(/(\d+)$/);
  return m ? parseInt(m[1], 10) : 0;
}

function makeTypePill(typeId) {
  const meta = TYPE_META[typeId] || { label: typeId };

  const pill = document.createElement('span');
  pill.className = `listing-type-pill listing-type-pill-${typeId}`;

  const icon = document.createElement('img');
  icon.src = `/icons/type-${typeId}.svg`;
  icon.width = 12;
  icon.height = 12;
  icon.setAttribute('aria-hidden', 'true');
  icon.alt = '';

  const label = document.createElement('span');
  label.textContent = meta.label;

  pill.append(icon, label);
  return pill;
}

function buildIssueCard(issue, featured) {
  const card = document.createElement('div');
  card.className = `listing-card listing-card-issue${featured ? ' listing-card-featured' : ''}`;

  if (featured) {
    const badge = document.createElement('span');
    badge.className = 'listing-featured-badge';
    badge.textContent = 'Latest Issue';
    card.append(badge);
  }

  const watermark = document.createElement('div');
  watermark.className = 'listing-card-watermark';
  watermark.setAttribute('aria-hidden', 'true');
  watermark.textContent = issue.num;
  card.append(watermark);

  const content = document.createElement('div');
  content.className = 'listing-card-content';

  const eyebrow = document.createElement('div');
  eyebrow.className = 'listing-card-eyebrow';
  const issueBadge = document.createElement('span');
  issueBadge.className = 'listing-issue-badge';
  issueBadge.textContent = `Issue ${issue.num}`;
  eyebrow.append(issueBadge);
  content.append(eyebrow);

  const title = document.createElement('h3');
  title.className = 'listing-card-title';
  title.textContent = issue.title || `Issue ${issue.num}`;
  content.append(title);

  if (issue.types && issue.types.size > 0) {
    const typesRow = document.createElement('div');
    typesRow.className = 'listing-card-types';
    issue.types.forEach((typeId) => typesRow.append(makeTypePill(typeId)));
    content.append(typesRow);
  }

  const meta = document.createElement('div');
  meta.className = 'listing-card-meta';
  const count = issue.count || 0;
  meta.textContent = `${count} piece${count !== 1 ? 's' : ''}`;
  content.append(meta);

  const link = document.createElement('a');
  link.className = 'listing-card-link';
  link.href = issue.path || '#';
  link.textContent = 'Read Issue →';
  content.append(link);

  card.append(content);
  return card;
}

function buildContentCard(item, featured) {
  const card = document.createElement('div');
  card.className = `listing-card listing-card-content${featured ? ' listing-card-featured' : ''}${item.image ? ' listing-card-has-image' : ''}`;

  // Text content wrapped in body so image can sit on the right
  const body = document.createElement('div');
  body.className = 'listing-card-body';

  if (featured) {
    const badge = document.createElement('span');
    badge.className = 'listing-featured-badge';
    badge.textContent = 'Latest';
    body.append(badge);
  }

  const typeRow = document.createElement('div');
  typeRow.className = 'listing-card-type-row';

  if (item.type) {
    typeRow.append(makeTypePill(item.type));
  }

  const issueRef = document.createElement('span');
  issueRef.className = 'listing-card-issue-ref';
  issueRef.textContent = `Issue #${getIssueNum(item.issue)}`;
  typeRow.append(issueRef);

  body.append(typeRow);

  const title = document.createElement('h3');
  title.className = 'listing-card-title';
  title.textContent = item.title || '';
  body.append(title);

  const link = document.createElement('a');
  link.className = 'listing-card-link';
  link.href = item.path || '#';
  link.textContent = 'Read →';
  body.append(link);

  card.append(body);

  if (item.image) {
    const img = document.createElement('img');
    img.className = 'listing-card-image';
    img.src = item.image;
    img.alt = item.title || '';
    img.loading = 'lazy';
    card.append(img);
  }

  return card;
}

export default async function decorate(block) {
  const rows = [...block.children];
  const listingType = rows[0]?.children[0]?.textContent.trim().toLowerCase() || 'issues';
  const authoredHeading = rows[1]?.children[0]?.textContent.trim() || '';

  block.textContent = '';

  let data = [];
  try {
    const resp = await fetch('/query-index.json');
    if (resp.ok) ({ data } = await resp.json());
  } catch {
    // query-index unavailable — render empty state
  }

  let items = [];
  let featuredCard = null;
  let gridHeadingText = authoredHeading || 'All Issues';

  if (listingType === 'issues') {
    // Build a map of issueTag → issue aggregate
    const issueMap = new Map();

    data.forEach((item) => {
      if (item.issue && item.type && TYPE_META[item.type]) {
        // Content piece: accumulate known types + count (skip 'issue' and unknown types)
        if (!issueMap.has(item.issue)) {
          issueMap.set(item.issue, {
            tag: item.issue,
            num: getIssueNum(item.issue),
            path: null,
            title: null,
            types: new Set(),
            count: 0,
          });
        }
        const entry = issueMap.get(item.issue);
        entry.types.add(item.type);
        entry.count += 1;
      }

      // Issue index page: path like /issues/issue-3 or /issues/issue-3/
      if (item.path && /^\/issues\/issue-\d+\/?$/.test(item.path)) {
        const tag = item.path.replace(/^\/issues\//, '').replace(/\/$/, '');
        if (!issueMap.has(tag)) {
          issueMap.set(tag, {
            tag,
            num: getIssueNum(tag),
            path: item.path,
            title: item.title || null,
            types: new Set(),
            count: 0,
          });
        } else {
          const entry = issueMap.get(tag);
          if (!entry.path) entry.path = item.path;
          if (!entry.title) entry.title = item.title || null;
        }
      }
    });

    // Sort descending by issue number
    items = [...issueMap.values()].sort((a, b) => b.num - a.num);
    if (!authoredHeading) gridHeadingText = 'All Issues';
  } else {
    // Content type listing — listingType is a comma-separated list of type ids
    const types = listingType.split(',').map((t) => t.trim()).filter(Boolean);

    items = data
      .filter((item) => item.type && types.includes(item.type))
      .sort((a, b) => getIssueNum(b.issue) - getIssueNum(a.issue));

    if (!authoredHeading) gridHeadingText = 'All Content';
  }

  if (items.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'No content found.';
    block.append(empty);
    return;
  }

  const [firstItem, ...restItems] = items;

  // Featured wrap
  const featuredWrap = document.createElement('div');
  featuredWrap.className = 'listing-featured-wrap';

  if (listingType === 'issues') {
    featuredCard = buildIssueCard(firstItem, true);
  } else {
    featuredCard = buildContentCard(firstItem, true);
  }
  featuredWrap.append(featuredCard);
  block.append(featuredWrap);

  if (restItems.length > 0) {
    const gridHeading = document.createElement('h3');
    gridHeading.className = 'listing-grid-heading';
    gridHeading.textContent = gridHeadingText;
    block.append(gridHeading);

    const grid = document.createElement('div');
    grid.className = 'listing-grid';

    restItems.forEach((item) => {
      let card;
      if (listingType === 'issues') {
        card = buildIssueCard(item, false);
      } else {
        card = buildContentCard(item, false);
      }
      grid.append(card);
    });

    block.append(grid);
  }
}
