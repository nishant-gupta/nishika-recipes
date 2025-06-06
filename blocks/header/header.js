import { decorateIcons, getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

// Search functionality
async function fetchSearchData() {
  try {
    const response = await fetch('/query-index.json');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching search data:', error);
    return [];
  }
}

function createSearchResults(results) {
  const resultsContainer = document.createElement('div');
  resultsContainer.className = 'search-results';

  if (results.length === 0) {
    const noResults = document.createElement('div');
    noResults.className = 'search-result-item';
    noResults.textContent = 'No Recipes found';
    resultsContainer.appendChild(noResults);
    return resultsContainer;
  }

  results.forEach((result) => {
    const resultItem = document.createElement('a');
    resultItem.href = result.path;
    resultItem.className = 'search-result-item';
    resultItem.innerHTML = `
      <img src="${result.image}" alt="${result.title}" width="40" height="40">
      <span>${result.title}</span>
    `;
    resultsContainer.appendChild(resultItem);
  });

  return resultsContainer;
}

function setupSearch(navTools) {
  const searchContainer = document.createElement('div');
  searchContainer.className = 'search-container';

  // Create search icon for mobile
  const searchIcon = document.createElement('button');
  searchIcon.className = 'search-icon';
  searchIcon.innerHTML = '<span class="icon icon-search"></span>';
  searchIcon.setAttribute('aria-label', 'Search');

  // Create search input container
  const searchInputContainer = document.createElement('div');
  searchInputContainer.className = 'search-input-container';

  // Create search input wrapper for icon
  const searchInputWrapper = document.createElement('div');
  searchInputWrapper.className = 'search-input-wrapper';

  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.placeholder = 'Search recipes...';
  searchInput.className = 'search-input';

  const inputSearchIcon = document.createElement('span');
  inputSearchIcon.className = 'icon icon-search-dark search-input-icon';

  const clearButton = document.createElement('button');
  clearButton.className = 'search-clear';
  clearButton.innerHTML = '<span class="icon icon-cross"></span>';
  clearButton.setAttribute('aria-label', 'Clear search');
  clearButton.style.display = 'none';

  let searchTimeout;
  let currentResults;

  function handleSearch(e) {
    clearTimeout(searchTimeout);
    const query = e.target.value.toLowerCase();

    // Show/hide clear button and search icon
    clearButton.style.display = query ? 'block' : 'none';
    inputSearchIcon.style.display = query ? 'none' : 'block';

    if (query.length < 2) {
      if (currentResults) {
        currentResults.remove();
        currentResults = null;
      }
      return;
    }

    searchTimeout = setTimeout(async () => {
      if (currentResults) {
        currentResults.remove();
      }

      const searchData = await fetchSearchData();
      const filteredResults = searchData
        .filter((item) => item.title.toLowerCase().includes(query))
        .slice(0, 5);

      currentResults = createSearchResults(filteredResults);
      searchInputContainer.appendChild(currentResults);
    }, 300);
  }

  function clearSearch() {
    searchInput.value = '';
    clearButton.style.display = 'none';
    inputSearchIcon.style.display = 'block';
    if (currentResults) {
      currentResults.remove();
      currentResults = null;
    }
    searchInput.focus();
  }

  searchInput.addEventListener('input', handleSearch);
  clearButton.addEventListener('click', clearSearch);

  // Mobile search toggle
  searchIcon.addEventListener('click', () => {
    if (!isDesktop.matches) {
      searchInputContainer.classList.toggle('active');
      if (searchInputContainer.classList.contains('active')) {
        searchInput.focus();
      }
    }
  });

  // Close search results when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchContainer.contains(e.target) && currentResults) {
      currentResults.remove();
      currentResults = null;
    }
    // Close mobile search when clicking outside
    if (!isDesktop.matches
      && !searchContainer.contains(e.target)
      && searchInputContainer.classList.contains('active')) {
      searchInputContainer.classList.remove('active');
    }
  });

  // Handle escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (currentResults) {
        currentResults.remove();
        currentResults = null;
      }
      if (!isDesktop.matches && searchInputContainer.classList.contains('active')) {
        searchInputContainer.classList.remove('active');
      }
    }
  });

  searchInputWrapper.appendChild(searchInput);
  searchInputWrapper.appendChild(inputSearchIcon);
  searchInputWrapper.appendChild(clearButton);
  searchInputContainer.appendChild(searchInputWrapper);
  searchContainer.appendChild(searchIcon);
  searchContainer.appendChild(searchInputContainer);
  decorateIcons(searchContainer);
  navTools.appendChild(searchContainer);
}

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // Setup search in nav tools
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    setupSearch(navTools);
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
