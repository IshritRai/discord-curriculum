import { getUser } from '../state/selectors.js';
import { classNames } from '../lib/classNames.js';
import { Avatar } from './Avatar.jsx';
import { Icon } from './Icon.jsx';

function VoiceUser({ user }) {
  return (
    <li className="voice-user" data-user-id={user.id}>
      <Avatar user={user} className="tiny" />
      <span className="voice-user-name">{user.displayName}</span>
    </li>
  );
}

function ChannelItem({ channel, isSelected, data }) {
  const voiceUserIds = channel.type === 'voice' ? channel.voiceUserIds : [];
  return (
    <li className={classNames('channel-item', isSelected && 'is-selected', channel.unread && 'is-unread')}>
      <button className="channel-button" type="button">
        <Icon name={channel.type === 'voice' ? 'speaker' : 'hash'} />
        <span className="channel-name">{channel.name}</span>
        {channel.mentions > 0 && <span className="channel-mention-badge">{channel.mentions}</span>}
      </button>
      {voiceUserIds.length > 0 && (
        <ul className="voice-users">
          {voiceUserIds.map((userId) => (
            <VoiceUser key={userId} user={getUser(data, userId)} />
          ))}
        </ul>
      )}
    </li>
  );
}

function Category({ category, activeChannelId, data }) {
  return (
    <section className="category">
      <h3>
        <button className="category-toggle" type="button" aria-expanded={true}>
          <Icon name="chevron-down" />
          {category.name}
        </button>
      </h3>
      <ul>
        {category.channels.map((channel) => (
          <ChannelItem key={channel.id} channel={channel} isSelected={channel.id === activeChannelId} data={data} />
        ))}
      </ul>
    </section>
  );
}

export function ChannelList({ server, activeChannelId, data }) {
  return (
    <nav className="channel-list scroller" id="channel-list" aria-label="Channel list">
      {server.categories.map((category) => (
        <Category key={category.id} category={category} activeChannelId={activeChannelId} data={data} />
      ))}
    </nav>
  );
}
