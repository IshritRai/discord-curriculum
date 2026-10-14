import { useEffect } from 'react';

// Shows the tooltip element next to anything with a data-tooltip attribute.
// This is the vanilla tooltips.js code, moved into an effect: React doesn't
// render the tooltip's position, we change the element directly through a ref.
export function useTooltips(tooltipRef) {
  useEffect(() => {
    const tooltip = tooltipRef.current;
    tooltip.hidden = true;

    function show(target) {
      tooltip.textContent = target.dataset.tooltip;
      tooltip.hidden = false;
      const rect = target.getBoundingClientRect();
      const tipRect = tooltip.getBoundingClientRect();
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

    function hide() {
      tooltip.hidden = true;
    }

    function handleMouseOver(event) {
      const target = event.target.closest('[data-tooltip]');
      if (target) {
        show(target);
      } else {
        hide();
      }
    }

    function handleFocusIn(event) {
      const target = event.target.closest('[data-tooltip]');
      if (target) {
        show(target);
      }
    }

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', hide);
    document.addEventListener('click', hide);

    // Cleanup: remove the listeners if the component goes away.
    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', hide);
      document.removeEventListener('click', hide);
    };
  }, [tooltipRef]);
}
