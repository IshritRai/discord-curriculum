import { useLayoutEffect, useRef, useState } from 'react';
import { useApp } from '../state/AppContext.jsx';

// Places the picker next to the button that opened it, inside the window.
function positionPicker(picker, rect) {
  const width = picker.offsetWidth;
  const height = picker.offsetHeight;
  let left = rect.right - width;
  let top = rect.top - height - 8;
  if (top < 8) {
    top = rect.bottom + 8;
  }
  left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
  top = Math.min(top, window.innerHeight - height - 8);
  picker.style.left = `${left}px`;
  picker.style.top = `${top}px`;
}

export function EmojiPicker() {
  const { state, dispatch } = useApp();
  const [query, setQuery] = useState('');
  const pickerRef = useRef(null);
  const searchRef = useRef(null);
  const picker = state.picker;

  // React decides WHAT the picker shows; this effect tells the browser to
  // open or close the popover (something React can't do with JSX alone).
  useLayoutEffect(() => {
    const element = pickerRef.current;
    if (picker === null) {
      if (element.matches(':popover-open')) {
        element.hidePopover();
      }
      return;
    }
    element.showPopover();
    positionPicker(element, picker.rect);
    searchRef.current.focus();
  }, [picker]);

  // The browser closes the popover by itself on Escape or an outside click.
  function handleToggle(event) {
    if (!event.currentTarget.matches(':popover-open')) {
      setQuery('');
      dispatch({ type: 'closePicker' });
    }
  }

  function choose(emoji) {
    picker.onPick(emoji);
    pickerRef.current.hidePopover();
  }

  const search = query.trim().toLowerCase();
  const categories = state.emojiCategories
    .map((category) => ({ ...category, emoji: category.emoji.filter((e) => e.name.includes(search)) }))
    .filter((category) => category.emoji.length > 0);

  return (
    <div className="emoji-picker" id="emoji-picker" popover="auto" ref={pickerRef} onToggle={handleToggle}>
      <input
        ref={searchRef}
        className="emoji-search"
        id="emoji-search"
        type="search"
        placeholder="Find the perfect emoji"
        aria-label="Search emoji"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="emoji-grid scroller" id="emoji-grid">
        {categories.map((category) => (
          <div key={category.category}>
            <h3 className="emoji-category">{category.category}</h3>
            <div className="emoji-options">
              {category.emoji.map((emoji) => (
                <button
                  key={emoji.char}
                  className="emoji-option"
                  type="button"
                  title={`:${emoji.name.split(' ')[0]}:`}
                  onClick={() => choose(emoji.char)}
                >
                  {emoji.char}
                </button>
              ))}
            </div>
          </div>
        ))}
        {categories.length === 0 && <p className="emoji-empty">No emoji match that search.</p>}
      </div>
    </div>
  );
}
