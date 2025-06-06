export default function decorate(block) {
  // do nothing
  block.classList.add('ingredients');
  block.children.forEach((child) => {
    child.classList.add('ingredient-item');
  });
}
