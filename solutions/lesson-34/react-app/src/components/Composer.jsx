import { useState } from 'react';
import { Icon } from './Icon.jsx';

// The message box: Enter sends, Shift+Enter adds a new line.
// Its text lives in this component's own state (a "controlled" textarea).
export function Composer({ channel, onSend }) {
  const [text, setText] = useState('');

  function send() {
    const content = text.trim();
    if (content === '') {
      return;
    }
    onSend(content);
    setText('');
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // don't add a new line
      send();
    }
  }

  function handleSubmit(event) {
    event.preventDefault(); // don't reload the page
    send();
  }

  return (
    <form className="composer" id="composer" onSubmit={handleSubmit}>
      <button className="icon-button composer-button" type="button" aria-label="Upload a file">
        <Icon name="plus" />
      </button>
      <textarea
        className="composer-input"
        id="composer-input"
        rows={1}
        aria-label="Message"
        placeholder={`Message #${channel.name}`}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button className="icon-button composer-button" type="button" id="composer-emoji-button" aria-label="Choose an emoji">
        <Icon name="emoji" />
      </button>
    </form>
  );
}
