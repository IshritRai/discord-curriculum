import { useEffect, useRef, useState } from 'react';
import { useApp } from '../state/AppContext.jsx';
import { CURRENT_USER_ID, getUser, getRoleColor, mentionsMe } from '../state/selectors.js';
import { renderMarkdown } from '../lib/markdown.js';
import { formatTime, formatTimestamp } from '../lib/time.js';
import { classNames } from '../lib/classNames.js';
import { Avatar } from './Avatar.jsx';
import { Icon } from './Icon.jsx';

function autoResize(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
}

// The edit box. Its text lives in this component's own state: React keeps it
// even when the rest of the app re-renders.
function MessageEditor({ message }) {
  const { dispatch } = useApp();
  const [draft, setDraft] = useState(message.content);
  const inputRef = useRef(null);

  // Runs once, after the editor first appears: focus it, cursor at the end.
  useEffect(() => {
    const input = inputRef.current;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }, []);

  // Keep the box as tall as its text.
  useEffect(() => {
    autoResize(inputRef.current);
  }, [draft]);

  function save() {
    const content = draft.trim();
    if (content === '') {
      dispatch({ type: 'deleteMessage', messageId: message.id });
    } else {
      dispatch({ type: 'saveEdit', messageId: message.id, content, editedAt: new Date().toISOString() });
    }
    document.querySelector('#composer-input').focus();
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      dispatch({ type: 'cancelEditing' });
      document.querySelector('#composer-input').focus();
    } else if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      save();
    }
  }

  return (
    <div className="editor">
      <textarea
        ref={inputRef}
        className="edit-input"
        rows={1}
        aria-label="Edit message"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <p className="edit-hint">
        escape to{' '}
        <button type="button" onClick={() => dispatch({ type: 'cancelEditing' })}>
          cancel
        </button>{' '}
        • enter to{' '}
        <button type="button" onClick={save}>
          save
        </button>
      </p>
    </div>
  );
}

function Reactions({ message }) {
  return (
    <div className="reactions">
      {message.reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          className={classNames('reaction', reaction.userIds.includes(CURRENT_USER_ID) && 'is-mine')}
          type="button"
          data-emoji={reaction.emoji}
        >
          <span className="reaction-emoji">{reaction.emoji}</span>
          <span className="reaction-count">{reaction.userIds.length}</span>
        </button>
      ))}
    </div>
  );
}

function ActionButton({ action, icon, label, className, onClick }) {
  return (
    <button
      className={classNames('icon-button', className)}
      type="button"
      data-action={action}
      data-tooltip={label}
      aria-label={label}
      onClick={onClick}
    >
      <Icon name={icon} />
    </button>
  );
}

export function Message({ message, server, startsGroup }) {
  const { state, dispatch } = useApp();
  const author = getUser(state, message.authorId);
  const isMine = message.authorId === CURRENT_USER_ID;
  const isEditing = state.editingMessageId === message.id;

  function handleDelete(event) {
    // Shift+click deletes right away; otherwise ask first. (Lesson 39 replaces confirm() with a dialog.)
    if (event.shiftKey || window.confirm('Delete this message?')) {
      dispatch({ type: 'deleteMessage', messageId: message.id });
    }
  }

  return (
    <li
      className={classNames(
        'message',
        startsGroup && 'is-group-start',
        !isMine && mentionsMe(state, message.content) && 'is-mention',
        isEditing && 'is-editing',
      )}
      data-message-id={message.id}
    >
      <div className="message-gutter">
        {startsGroup ? (
          <button className="avatar-button" type="button" data-user-id={author.id} aria-label={`${author.displayName}'s profile`}>
            <Avatar user={author} />
          </button>
        ) : (
          <time className="message-hover-time" dateTime={message.timestamp}>
            {formatTime(message.timestamp)}
          </time>
        )}
      </div>

      <div className="message-body">
        {startsGroup && (
          <h3 className="message-header">
            <button className="message-author" type="button" data-user-id={author.id} style={{ '--author-color': getRoleColor(server, author.id) }}>
              {author.displayName}
            </button>
            {author.bot && <span className="bot-tag">Bot</span>}
            <time className="message-time" dateTime={message.timestamp}>
              {formatTimestamp(message.timestamp)}
            </time>
          </h3>
        )}

        {isEditing ? (
          <MessageEditor message={message} />
        ) : (
          <div className="message-content">
            {/* renderMarkdown escapes the text first, so this is safe */}
            <span dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }} />
            {message.editedAt && <span className="edited-label"> (edited)</span>}
          </div>
        )}

        {message.reactions.length > 0 && <Reactions message={message} />}
      </div>

      {isMine && (
        <div className="message-actions">
          <ActionButton action="edit" icon="edit" label="Edit" onClick={() => dispatch({ type: 'startEditing', messageId: message.id })} />
          <ActionButton action="delete" icon="trash" label="Delete" className="danger" onClick={handleDelete} />
        </div>
      )}
    </li>
  );
}
