// Tooltips: any element with a data-tooltip attribute shows its text on hover or focus.
// One shared tooltip element is moved next to whatever you're pointing at.

const tooltip = document.querySelector('#tooltip');

function showTooltip(target) {
  tooltip.textContent = target.dataset.tooltip;
  tooltip.hidden = false;
  const rect = target.getBoundingClientRect();
  const tipRect = tooltip.getBoundingClientRect();

  // Server icons get the tooltip on their right, everything else above.
  let left;
  let top;
  if (target.closest('.server-rail')) {
    left = rect.right + 12;
    top = rect.top + rect.height / 2 - tipRect.height / 2;
  } else {
    left = rect.left + rect.width / 2 - tipRect.width / 2;
    top = rect.top - tipRect.height - 8;
  }
  left = Math.max(8, Math.min(left, window.innerWidth - tipRect.width - 8));
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${Math.max(8, top)}px`;
}

export function hideTooltip() {
  tooltip.hidden = true;
}

export function setupTooltips() {
  // mouseover bubbles, so one listener on the document is enough.
  document.addEventListener('mouseover', (event) => {
    const target = event.target.closest('[data-tooltip]');
    if (target) {
      showTooltip(target);
    } else {
      hideTooltip();
    }
  });
  document.addEventListener('focusin', (event) => {
    const target = event.target.closest('[data-tooltip]');
    if (target) {
      showTooltip(target);
    }
  });
  document.addEventListener('focusout', hideTooltip);
  document.addEventListener('click', hideTooltip);
}
