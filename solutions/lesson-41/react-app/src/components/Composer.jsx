import { useEffect, useRef } from 'react';
import { useApp } from '../state/AppContext.jsx';
import { CURRENT_USER_ID, mentionsMe } from '../state/selectors.js';
import { scheduleReply } from '../lib/simulation.js';
import { Icon } from './Icon.jsx';

// The message box: Enter sends, Shift+Enter adds a new line.
// Its text is kept per channel in state.drafts, so switching channels keeps your draft.
export function Composer({ channel }) {
  const { state, dispatch, getState } = useApp();
  const text = state.drafts[channel.id] ?? '';
  const inputRef = useRef(null);

  const setText = (newText) => dispatch({ type: 'setDraft', channelId: channel.id, text: newText });

  // Keep the box as tall as its text.
  useEffect(() => {
    const input = inputRef.current;
    input.style.height = 'auto';
    input.style.height = `${input.scrollHeight}px`;
  }, [text]);

  function send() {
    const content = text.trim();
    if (content === '') {
      return;
    }
    dispatch({
      type: 'sendMessage',
      channelId: channel.id,
      mentionsMe: mentionsMe(state, content),
      message: { id: crypto.randomUUID(), authorId: CURRENT_USER_ID, content, timestamp: new Date().toISOString(), reactions: [] },
    });
    setText('');
    scheduleReply(getState, dispatch, channel.id);
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
    // Up arrow in an empty box edits your last message
    if (event.key === 'ArrowUp' && text === '') {
      const mine = (state.messages[channel.id] ?? []).filter((m) => m.authorId === CURRENT_USER_ID);
      if (mine.length > 0) {
        event.preventDefault();
        dispatch({ type: 'startEditing', messageId: mine[mine.length - 1].id });
      }
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    send();
  }

  // Puts an emoji where the cursor is.
  function insertEmoji(emoji) {
    const input = inputRef.current;
    const current = getState().drafts[channel.id] ?? '';
    setText(current.slice(0, input.selectionStart) + emoji + current.slice(input.selectionEnd));
    input.focus();
  }

  function openEmojiPicker(event) {
    dispatch({ type: 'openPicker', onPick: insertEmoji, rect: event.currentTarget.getBoundingClientRect() });
  }

  return (
    <form className="composer" id="composer" onSubmit={handleSubmit}>
      <button className="icon-button composer-button" type="button" aria-label="Upload a file">
        <Icon name="plus" />
      </button>
      <textarea
        ref={inputRef}
        className="composer-input"
        id="composer-input"
        rows={1}
        aria-label="Message"
        placeholder={`Message #${channel.name}`}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button className="icon-button composer-button" type="button" id="composer-emoji-button" aria-label="Choose an emoji" onClick={openEmojiPicker}>
        <Icon name="emoji" />
      </button>
    </form>
  );
}
