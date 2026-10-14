// ============================================================
//  BRANDING — the only file you need to edit to rebrand the app.
// ============================================================

export const brand = {
  name: 'Hubbub',
  logo: 'brand/logo.svg', // a file in public/
  accentColor: '#0f7b6c',
};

// Applies the parts of the brand that live outside React's components:
// the tab title, the favicon and the accent color CSS variable.
export function applyBrand() {
  document.title = brand.name;
  document.querySelector('link[rel="icon"]').href = brand.logo;
  document.documentElement.style.setProperty('--brand-accent', brand.accentColor);
}
