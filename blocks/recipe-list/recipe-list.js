import { createOptimizedPicture, decorateIcons } from '../../scripts/aem.js';

async function fetchRecipes() {
  try {
    const response = await fetch('/query-index.json');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return [];
  }
}

function createViewToggle() {
  const toggleDiv = document.createElement('div');
  toggleDiv.className = 'view-toggle';

  const gridButton = document.createElement('div');
  gridButton.className = 'view-toggle-btn active';
  gridButton.innerHTML = '<span class="icon icon-grid"></span>';
  gridButton.setAttribute('aria-label', 'Grid View');

  const listButton = document.createElement('div');
  listButton.className = 'view-toggle-btn';
  listButton.innerHTML = '<span class="icon icon-list"></span>';
  listButton.setAttribute('aria-label', 'List View');

  toggleDiv.appendChild(gridButton);
  toggleDiv.appendChild(listButton);

  decorateIcons(toggleDiv);

  return toggleDiv;
}

function createRecipeCard(recipe) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = recipe.path;

  // Create image container
  const imageDiv = document.createElement('div');
  imageDiv.className = 'cards-card-image';
  const picture = createOptimizedPicture(recipe.image, recipe.title, false, [{ width: '750' }]);
  imageDiv.appendChild(picture);

  // Create body container
  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'cards-card-body';
  const title = document.createElement('strong');
  title.textContent = recipe.title;
  bodyDiv.appendChild(title);

  // Add description if available
  if (recipe.description) {
    const description = document.createElement('p');
    description.textContent = recipe.description;
    bodyDiv.appendChild(description);
  }

  // Add category if available
  if (recipe.category) {
    const category = document.createElement('span');
    category.className = 'recipe-category';
    category.textContent = recipe.category;
    bodyDiv.appendChild(category);
  }

  a.appendChild(imageDiv);
  a.appendChild(bodyDiv);
  li.appendChild(a);

  return li;
}

export default async function decorate(block) {
  const recipes = await fetchRecipes();

  // Create view toggle
  const viewToggle = createViewToggle();
  block.appendChild(viewToggle);

  // Create cards container
  const ul = document.createElement('ul');
  ul.className = 'cards grid-view';

  // Add each recipe as a card
  recipes.forEach((recipe) => {
    const card = createRecipeCard(recipe);
    ul.appendChild(card);
  });

  // Add view toggle functionality
  const gridButton = viewToggle.querySelector('.view-toggle-btn:first-child');
  const listButton = viewToggle.querySelector('.view-toggle-btn:last-child');

  gridButton.addEventListener('click', () => {
    ul.className = 'cards grid-view';
    gridButton.classList.add('active');
    listButton.classList.remove('active');
  });

  listButton.addEventListener('click', () => {
    ul.className = 'cards list-view';
    listButton.classList.add('active');
    gridButton.classList.remove('active');
  });

  // Clear and append the cards
  block.appendChild(ul);
}
