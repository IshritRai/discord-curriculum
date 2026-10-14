import { CURRENT_USER_ID, getUser } from '../state/selectors.js';
import { ChannelList } from './ChannelList.jsx';
import { UserPanel } from './UserPanel.jsx';
import { Icon } from './Icon.jsx';

export function ChannelSidebar({ server, activeChannelId, collapsedCategoryIds, onSelectChannel, onToggleCategory, data }) {
  return (
    <aside className="channel-sidebar" aria-label="Channels">
      <header className="sidebar-header">
        <h1 className="server-name" id="server-name">
          {server.name}
        </h1>
        <Icon name="chevron-down" />
      </header>
      <ChannelList
        server={server}
        activeChannelId={activeChannelId}
        collapsedCategoryIds={collapsedCategoryIds}
        onSelectChannel={onSelectChannel}
        onToggleCategory={onToggleCategory}
        data={data}
      />
      <UserPanel user={getUser(data, CURRENT_USER_ID)} />
    </aside>
  );
}
