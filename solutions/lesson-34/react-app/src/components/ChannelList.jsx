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

function ChannelItem({ channel, isSelected, onSelect, data }) {
  const voiceUserIds = channel.type === 'voice' ? channel.voiceUserIds : [];
  return (
    <li className={classNames('channel-item', isSelected && 'is-selected', channel.unread && 'is-unread')}>
      <button className="channel-button" type="button" onClick={() => onSelect(channel.id)}>
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

function Category({ category, activeChannelId, isCollapsed, onSelectChannel, onToggle, data }) {
  // A collapsed category still shows the selected channel and busy voice channels.
  const visibleChannels = category.channels.filter((channel) => {
    const isBusyVoice = channel.type === 'voice' && channel.voiceUserIds.length > 0;
    return !isCollapsed || channel.id === activeChannelId || isBusyVoice;
  });

  return (
    <section className={classNames('category', isCollapsed && 'is-collapsed')}>
      <h3>
        <button className="category-toggle" type="button" aria-expanded={!isCollapsed} onClick={() => onToggle(category.id)}>
          <Icon name="chevron-down" />
          {category.name}
        </button>
      </h3>
      <ul>
        {visibleChannels.map((channel) => (
          <ChannelItem key={channel.id} channel={channel} isSelected={channel.id === activeChannelId} onSelect={onSelectChannel} data={data} />
        ))}
      </ul>
    </section>
  );
}

export function ChannelList({ server, activeChannelId, collapsedCategoryIds, onSelectChannel, onToggleCategory, data }) {
  return (
    <nav className="channel-list scroller" id="channel-list" aria-label="Channel list">
      {server.categories.map((category) => (
        <Category
          key={category.id}
          category={category}
          activeChannelId={activeChannelId}
          isCollapsed={collapsedCategoryIds.includes(category.id)}
          onSelectChannel={onSelectChannel}
          onToggle={onToggleCategory}
          data={data}
        />
      ))}
    </nav>
  );
}
