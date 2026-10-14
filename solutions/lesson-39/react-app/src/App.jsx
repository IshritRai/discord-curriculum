import { useEffect } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router';
import { useApp } from './state/AppContext.jsx';
import { defaultChannelId, findServer, getChannels } from './state/selectors.js';
import { useSimulation } from './hooks/useSimulation.js';
import { classNames } from './lib/classNames.js';
import { ServerRail } from './components/ServerRail.jsx';
import { ChannelSidebar } from './components/ChannelSidebar.jsx';
import { ChatArea } from './components/ChatArea.jsx';
import { Tooltip } from './components/Tooltip.jsx';
import { ContextMenu } from './components/ContextMenu.jsx';
import { EmojiPicker } from './components/EmojiPicker.jsx';
import { Dialogs } from './components/Dialogs.jsx';

// Sends you to the first server's default channel (used for "/" and unknown URLs).
function GoToDefaultChannel() {
  const { state } = useApp();
  const server = state.servers[0];
  return <Navigate to={`/channels/${server.id}/${defaultChannelId(state, server)}`} replace />;
}

// The chat screen for the URL /channels/:serverId/:channelId
function ChatScreen() {
  const { serverId, channelId } = useParams();
  const { state, dispatch } = useApp();
  const server = findServer(state, serverId);
  const channel = server && getChannels(server).find((c) => c.id === channelId && c.type === 'text');
  const channelExists = Boolean(channel);

  // When the URL changes: remember the channel and mark it as read.
  useEffect(() => {
    if (channelExists) {
      dispatch({ type: 'channelOpened', serverId, channelId });
    }
  }, [serverId, channelId, channelExists, dispatch]);

  if (!channelExists) {
    return <GoToDefaultChannel />;
  }

  return (
    <>
      <div className={classNames('app', state.navOpen && 'is-nav-open')}>
        <div className="nav-drawer">
          <ServerRail activeServerId={server.id} />
          <ChannelSidebar server={server} activeChannelId={channel.id} />
        </div>
        <ChatArea server={server} channel={channel} />
      </div>
      <div className="drawer-backdrop" id="drawer-backdrop" onClick={() => dispatch({ type: 'setNavOpen', open: false })} />
    </>
  );
}

function App() {
  const { dispatch } = useApp();
  useSimulation();

  // Escape closes the drawer; growing the window past the breakpoint does too.
  useEffect(() => {
    const narrowScreen = window.matchMedia('(max-width: 1000px)');
    const closeNav = () => dispatch({ type: 'setNavOpen', open: false });
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        closeNav();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    narrowScreen.addEventListener('change', closeNav);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      narrowScreen.removeEventListener('change', closeNav);
    };
  }, [dispatch]);

  return (
    <>
      <Routes>
        <Route path="/channels/:serverId/:channelId" element={<ChatScreen />} />
        <Route path="*" element={<GoToDefaultChannel />} />
      </Routes>
      {/* Overlays live outside the routes, on top of everything */}
      <Tooltip />
      <ContextMenu />
      <EmojiPicker />
      <Dialogs />
    </>
  );
}

export default App;
