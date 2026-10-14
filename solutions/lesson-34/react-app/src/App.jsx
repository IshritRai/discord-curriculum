import { useState } from 'react';
import users from './data/users.json';
import initialServers from './data/servers.json';
import initialMessages from './data/messages.json';
import { CURRENT_USER_ID, getChannels } from './state/selectors.js';
import { updateChannel, toggleInList } from './state/updates.js';
import { classNames } from './lib/classNames.js';
import { ServerRail } from './components/ServerRail.jsx';
import { ChannelSidebar } from './components/ChannelSidebar.jsx';
import { ChatArea } from './components/ChatArea.jsx';

// The channel to open for a server: the one you looked at last, or its first text channel.
function pickChannel(server, activeChannelByServer) {
  const channels = getChannels(server);
  return channels.find((c) => c.id === activeChannelByServer[server.id]) ?? channels.find((c) => c.type === 'text');
}

function App() {
  // ---------- State: everything that can change ----------
  const [servers, setServers] = useState(initialServers);
  const [messages, setMessages] = useState(initialMessages);
  const [activeServerId, setActiveServerId] = useState(initialServers[0].id);
  const [activeChannelByServer, setActiveChannelByServer] = useState({});
  const [collapsedCategoryIds, setCollapsedCategoryIds] = useState([]);
  const [showMembers, setShowMembers] = useState(true);
  const [navOpen, setNavOpen] = useState(false);

  // ---------- Values computed from the state on every render ----------
  const data = { users, servers, messages };
  const server = servers.find((s) => s.id === activeServerId);
  const channel = pickChannel(server, activeChannelByServer);

  // ---------- Event handlers: they change the state ----------
  function markRead(channelId) {
    setServers(updateChannel(servers, channelId, { unread: false, mentions: 0 }));
  }

  function selectServer(serverId) {
    const nextServer = servers.find((s) => s.id === serverId);
    setActiveServerId(serverId);
    markRead(pickChannel(nextServer, activeChannelByServer).id);
  }

  function selectChannel(channelId) {
    const clicked = getChannels(server).find((c) => c.id === channelId);
    if (clicked.type === 'voice') {
      return; // joining voice channels comes in Lesson 40
    }
    setActiveChannelByServer({ ...activeChannelByServer, [server.id]: channelId });
    markRead(channelId);
    setNavOpen(false);
  }

  function toggleCategory(categoryId) {
    setCollapsedCategoryIds(toggleInList(collapsedCategoryIds, categoryId));
  }

  function sendMessage(content) {
    const message = {
      id: crypto.randomUUID(),
      authorId: CURRENT_USER_ID,
      content,
      timestamp: new Date().toISOString(),
      reactions: [],
    };
    const list = messages[channel.id] ?? [];
    setMessages({ ...messages, [channel.id]: [...list, message] });
  }

  return (
    <>
      <div className={classNames('app', navOpen && 'is-nav-open')}>
        <div className="nav-drawer">
          <ServerRail servers={servers} activeServerId={server.id} onSelectServer={selectServer} />
          <ChannelSidebar
            server={server}
            activeChannelId={channel.id}
            collapsedCategoryIds={collapsedCategoryIds}
            onSelectChannel={selectChannel}
            onToggleCategory={toggleCategory}
            data={data}
          />
        </div>
        <ChatArea
          server={server}
          channel={channel}
          messages={messages[channel.id] ?? []}
          showMembers={showMembers}
          onToggleMembers={() => setShowMembers(!showMembers)}
          onOpenNav={() => setNavOpen(true)}
          onSend={sendMessage}
          data={data}
        />
      </div>
      <div className="drawer-backdrop" id="drawer-backdrop" onClick={() => setNavOpen(false)} />
    </>
  );
}

export default App;
