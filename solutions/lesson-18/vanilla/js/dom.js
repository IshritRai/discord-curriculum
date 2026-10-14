// Small helpers for building elements, used by every render function.

// el('li', 'channel-item', 'general') → <li class="channel-item">general</li>
export function el(tag, className, text) {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

// icon('hash') → <svg class="icon"><use href="assets/icons.svg#hash"></use></svg>
// innerHTML is safe here because the markup is ours, not something a user typed.
export function icon(name) {
  const wrapper = document.createElement('span');
  wrapper.innerHTML = `<svg class="icon" aria-hidden="true"><use href="assets/icons.svg#${name}"></use></svg>`;
  return wrapper.firstElementChild;
}

// A round avatar with the user's first letter on their color.
// withStatus = true adds the status dot.
export function avatar(user, withStatus) {
  const element = el('span', 'avatar', user.displayName[0]);
  element.style.setProperty('--avatar-color', user.avatarColor);
  if (withStatus) {
    element.classList.add(`status-${user.status}`);
    element.append(el('span', 'status-dot'));
  }
  return element;
}
