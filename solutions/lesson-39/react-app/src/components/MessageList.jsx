import { useLayoutEffect, useRef } from 'react';
import { useApp } from '../state/AppContext.jsx';
import { isSameDay, minutesBetween, formatDate } from '../lib/time.js';
import { Message } from './Message.jsx';
import { Icon } from './Icon.jsx';

// A new group starts when the author changes, after 7 minutes, or on a new day.
function startsNewGroup(previous, message) {
  return (
    !previous ||
    previous.authorId !== message.authorId ||
    minutesBetween(previous.timestamp, message.timestamp) > 7 ||
    !isSameDay(previous.timestamp, message.timestamp)
  );
}

export function MessageList({ server, channel }) {
  const { state } = useApp();
  const messages = state.messages[channel.id] ?? [];
  const listRef = useRef(null);
  const wasNearBottom = useRef(true);
  const renderedChannelId = useRef(null);

  // Remember, while you scroll, whether you're near the newest messages.
  function handleScroll() {
    const list = listRef.current;
    wasNearBottom.current = list.scrollHeight - list.scrollTop - list.clientHeight < 80;
  }

  // After React has updated the list: jump to the newest message if you
  // switched channels or were already near the bottom.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (renderedChannelId.current !== channel.id || wasNearBottom.current) {
      list.scrollTop = list.scrollHeight;
      wasNearBottom.current = true;
    }
    renderedChannelId.current = channel.id;
  }, [channel.id, messages.length, state.editingMessageId]);

  // Build the list: date dividers between days, and grouped messages.
  const items = [];
  let previous = null;
  for (const message of messages) {
    if (!previous || !isSameDay(previous.timestamp, message.timestamp)) {
      items.push(
        <li key={`day-${message.id}`} className="date-divider" role="separator">
          <span>{formatDate(message.timestamp)}</span>
        </li>,
      );
    }
    items.push(<Message key={message.id} message={message} server={server} startsGroup={startsNewGroup(previous, message)} />);
    previous = message;
  }

  return (
    <ol className="message-list scroller" id="message-list" ref={listRef} onScroll={handleScroll}>
      <li className="channel-welcome">
        <div className="channel-welcome-icon">
          <Icon name="hash" />
        </div>
        <h3 className="channel-welcome-title">Welcome to #{channel.name}!</h3>
        <p className="channel-welcome-text">This is the start of the #{channel.name} channel.</p>
      </li>
      {items}
    </ol>
  );
}
