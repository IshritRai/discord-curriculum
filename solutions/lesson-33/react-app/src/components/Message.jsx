import { CURRENT_USER_ID, getUser, getRoleColor, mentionsMe } from '../state/selectors.js';
import { renderMarkdown } from '../lib/markdown.js';
import { formatTime, formatTimestamp } from '../lib/time.js';
import { classNames } from '../lib/classNames.js';
import { Avatar } from './Avatar.jsx';

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

export function Message({ message, server, startsGroup, data }) {
  const author = getUser(data, message.authorId);
  const isMine = message.authorId === CURRENT_USER_ID;

  return (
    <li
      className={classNames('message', startsGroup && 'is-group-start', !isMine && mentionsMe(data, message.content) && 'is-mention')}
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
        <div className="message-content">
          {/* renderMarkdown escapes the text first, so this is safe */}
          <span dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }} />
          {message.editedAt && <span className="edited-label"> (edited)</span>}
        </div>
        {message.reactions.length > 0 && <Reactions message={message} />}
      </div>
    </li>
  );
}
