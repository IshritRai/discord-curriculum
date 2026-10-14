import { useApp } from '../state/AppContext.jsx';
import { ChannelList } from './ChannelList.jsx';
import { VoicePanel } from './VoicePanel.jsx';
import { UserPanel } from './UserPanel.jsx';
import { Icon } from './Icon.jsx';

export function ChannelSidebar({ server, activeChannelId }) {
  const { dispatch } = useApp();

  // Clicking the server name opens the server's menu just below it.
  function openServerMenu(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    dispatch({ type: 'openMenu', menu: { kind: 'server', id: server.id, x: rect.left + 10, y: rect.bottom + 4 } });
  }

  return (
    <aside className="channel-sidebar" aria-label="Channels">
      <header className="sidebar-header" onClick={openServerMenu}>
        <h1 className="server-name" id="server-name">
          {server.name}
        </h1>
        <Icon name="chevron-down" />
      </header>
      <ChannelList server={server} activeChannelId={activeChannelId} />
      <VoicePanel />
      <UserPanel />
    </aside>
  );
}
