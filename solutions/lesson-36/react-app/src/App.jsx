import { useEffect } from 'react';
import { useApp } from './state/AppContext.jsx';
import { getActiveServer, getActiveChannel } from './state/selectors.js';
import { useSimulation } from './hooks/useSimulation.js';
import { classNames } from './lib/classNames.js';
import { ServerRail } from './components/ServerRail.jsx';
import { ChannelSidebar } from './components/ChannelSidebar.jsx';
import { ChatArea } from './components/ChatArea.jsx';

function App() {
  const { state, dispatch } = useApp();
  const server = getActiveServer(state);
  const channel = getActiveChannel(state);

  // Fake people typing and sending messages.
  useSimulation();

  // Escape closes the drawer; growing the window past the breakpoint does too.
  // The cleanup function removes the listeners if App ever goes away.
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

export default App;
