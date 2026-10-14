// ============================================================
//  BRANDING — the only file you need to edit to rebrand the app.
// ============================================================

export const brand = {
  name: 'Hubbub',
  logo: 'assets/brand/logo.svg',
  accentColor: '#0f7b6c',
};

// Applies the brand to the page: tab title, favicon, logo and accent color.
export function applyBrand() {
  document.title = brand.name;
  document.querySelector('link[rel="icon"]').href = brand.logo;
  document.querySelector('.brand-logo').src = brand.logo;
  document.documentElement.style.setProperty('--brand-accent', brand.accentColor);
}
