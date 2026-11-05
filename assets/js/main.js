const menuButton = document.querySelector('nav button[aria-controls="primary-menu"]');
const primaryMenu = document.getElementById('primary-menu');

if (menuButton && primaryMenu) {
  menuButton.addEventListener('click', () => {
    const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isExpanded));
    primaryMenu.classList.toggle('is-open', !isExpanded);
  });

  primaryMenu.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      menuButton.setAttribute('aria-expanded', 'false');
      primaryMenu.classList.remove('is-open');
    }
  });
}
