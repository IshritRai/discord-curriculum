import users from './data/users.json';
import servers from './data/servers.json';
import messages from './data/messages.json';
import { getChannels } from './state/selectors.js';
import { ServerRail } from './components/ServerRail.jsx';
import { ChannelSidebar } from './components/ChannelSidebar.jsx';
import { ChatArea } from './components/ChatArea.jsx';

// All the data, in one object that components can look things up in.
const data = { users, servers, messages };

function App() {
  // No interactivity yet: always show the first server's first text channel.
  const server = servers[0];
  const channel = getChannels(server).find((c) => c.type === 'text');
  const channelMessages = messages[channel.id] ?? [];

  return (
    <>
      <div className="app">
        <div className="nav-drawer">
          <ServerRail servers={servers} activeServerId={server.id} />
          <ChannelSidebar server={server} activeChannelId={channel.id} data={data} />
        </div>
        <ChatArea server={server} channel={channel} messages={channelMessages} data={data} />
      </div>
      <div className="drawer-backdrop" id="drawer-backdrop" />
    </>
  );
}

export default App;
