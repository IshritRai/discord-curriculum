// The whole app as one component for now. This is the same markup as the
// vanilla app's index.html (Lesson 11), converted to JSX.

function App() {
  return (
    <>
      <div className="app">
        {/* The server rail and channel sidebar together (on phones they slide in as a "drawer") */}
        <div className="nav-drawer">
          {/* 1. Server rail: one button per server */}
          <nav className="server-rail" aria-label="Servers">
            <ul className="server-list">
              <li className="server-item">
                <button className="server-button home-button" type="button" aria-label="Direct Messages">
                  <img className="brand-logo" src="brand/logo.svg" alt="" />
                </button>
              </li>
              <li className="server-separator" role="separator"></li>
            </ul>
            <ul className="server-list" id="server-list">
              <li className="server-item is-active">
                <button className="server-button" type="button" aria-label="Frontend Friends">FF<span className="mention-badge">1</span></button>
              </li>
              <li className="server-item is-unread">
                <button className="server-button is-emoji" type="button" aria-label="Pixel Art Club">🎨</button>
              </li>
              <li className="server-item">
                <button className="server-button is-emoji" type="button" aria-label="Weekend Hikers">🥾</button>
              </li>
              <li className="server-item is-unread">
                <button className="server-button" type="button" aria-label="Study Group">SG<span className="mention-badge">2</span></button>
              </li>
              <li className="server-item is-unread">
                <button className="server-button is-emoji" type="button" aria-label="Game Night">🎲</button>
              </li>
            </ul>
            <ul className="server-list">
              <li className="server-item">
                <button className="server-button add-server-button" type="button" aria-label="Add a Server">
                  <svg className="icon"><use href="icons.svg#plus" /></svg>
                </button>
              </li>
            </ul>
          </nav>
  
          {/* 2. Channel sidebar: server name, channels, and your user panel */}
          <aside className="channel-sidebar" aria-label="Channels">
            <header className="sidebar-header">
              <h1 className="server-name" id="server-name">Frontend Friends</h1>
              <svg className="icon"><use href="icons.svg#chevron-down" /></svg>
            </header>
            <nav className="channel-list scroller" id="channel-list" aria-label="Channel list">
              <section className="category">
                <h3><button className="category-toggle" type="button"><svg className="icon"><use href="icons.svg#chevron-down" /></svg>Text Channels</button></h3>
                <ul>
                  <li className="channel-item is-selected">
                    <button className="channel-button" type="button"><svg className="icon"><use href="icons.svg#hash" /></svg><span className="channel-name">general</span></button>
                  </li>
                  <li className="channel-item is-unread">
                    <button className="channel-button" type="button"><svg className="icon"><use href="icons.svg#hash" /></svg><span className="channel-name">help</span><span className="channel-mention-badge">1</span></button>
                  </li>
                  <li className="channel-item">
                    <button className="channel-button" type="button"><svg className="icon"><use href="icons.svg#hash" /></svg><span className="channel-name">showcase</span></button>
                  </li>
                  <li className="channel-item">
                    <button className="channel-button" type="button"><svg className="icon"><use href="icons.svg#hash" /></svg><span className="channel-name">off-topic</span></button>
                  </li>
                </ul>
              </section>
              <section className="category">
                <h3><button className="category-toggle" type="button"><svg className="icon"><use href="icons.svg#chevron-down" /></svg>Voice Channels</button></h3>
                <ul>
                  <li className="channel-item">
                    <button className="channel-button" type="button"><svg className="icon"><use href="icons.svg#speaker" /></svg><span className="channel-name">Lounge</span></button>
                  </li>
                  <li className="channel-item">
                    <button className="channel-button" type="button"><svg className="icon"><use href="icons.svg#speaker" /></svg><span className="channel-name">Pair Programming</span></button>
                  </li>
                </ul>
              </section>
            </nav>
  
            <section className="user-panel" aria-label="Your account">
              <button className="user-panel-profile" type="button" id="user-panel-profile">
                <span className="avatar status-online" id="user-panel-avatar">S<span className="status-dot"></span></span>
                <span className="user-panel-names">
                  <span className="user-panel-name" id="user-panel-name">Sam</span>
                  <span className="user-panel-tag" id="user-panel-tag">Learning frontend 🚀</span>
                </span>
              </button>
              <button className="icon-button" type="button" id="mute-button" aria-label="Mute">
                <svg className="icon"><use href="icons.svg#mic" /></svg>
              </button>
              <button className="icon-button" type="button" id="deafen-button" aria-label="Deafen">
                <svg className="icon"><use href="icons.svg#headphones" /></svg>
              </button>
              <button className="icon-button" type="button" id="settings-button" aria-label="User Settings">
                <svg className="icon"><use href="icons.svg#settings" /></svg>
              </button>
            </section>
          </aside>
        </div>
  
        {/* 3. Chat: header, messages, message box, and the member list */}
        <main className="chat">
          <header className="chat-header">
            <button className="icon-button menu-button" type="button" id="menu-button" aria-label="Open channels">
              <svg className="icon"><use href="icons.svg#menu" /></svg>
            </button>
            <svg className="icon chat-header-icon"><use href="icons.svg#hash" /></svg>
            <h2 className="chat-title" id="chat-title">general</h2>
            <p className="chat-topic" id="chat-topic">Chat about anything frontend: HTML, CSS, JavaScript, React.</p>
            <div className="chat-toolbar">
              <button className="icon-button" type="button" aria-label="Notification Settings">
                <svg className="icon"><use href="icons.svg#bell" /></svg>
              </button>
              <button className="icon-button" type="button" aria-label="Pinned Messages">
                <svg className="icon"><use href="icons.svg#pin" /></svg>
              </button>
              <button className="icon-button" type="button" id="members-button" aria-label="Member List" aria-pressed="true">
                <svg className="icon"><use href="icons.svg#members" /></svg>
              </button>
              <label className="search">
                <input className="search-input" type="search" placeholder="Search" aria-label="Search" />
                <svg className="icon"><use href="icons.svg#search" /></svg>
              </label>
              <button className="icon-button" type="button" aria-label="Inbox">
                <svg className="icon"><use href="icons.svg#inbox" /></svg>
              </button>
              <button className="icon-button" type="button" aria-label="Help">
                <svg className="icon"><use href="icons.svg#help" /></svg>
              </button>
            </div>
          </header>
  
          <div className="chat-body">
            <section className="chat-main" aria-label="Messages">
              <ol className="message-list scroller" id="message-list">
                {/* Older messages, so there's enough to scroll */}
                <li className="date-divider" role="separator"><span>October 11, 2026</span></li>
                <li className="message is-group-start">
                  <div className="message-gutter"><span className="avatar">P</span></div>
                  <div className="message-body">
                    <h3 className="message-header">
                      <button className="message-author" type="button">Priya</button>
                      <time className="message-time" dateTime="2026-10-11T09:12:00Z">10/11/2026 9:12 AM</time>
                    </h3>
                    <div className="message-content">Morning everyone ☀️ Reminder: the <strong>weekly code review</strong> thread opens at noon.</div>
                  </div>
                </li>
                <li className="message">
                  <div className="message-gutter"><time className="message-hover-time" dateTime="2026-10-11T09:13:10Z">9:13 AM</time></div>
                  <div className="message-body">
                    <div className="message-content">Post a link to your repo and say what kind of feedback you want.</div>
                  </div>
                </li>
                <li className="message is-group-start">
                  <div className="message-gutter"><span className="avatar">L</span></div>
                  <div className="message-body">
                    <h3 className="message-header">
                      <button className="message-author" type="button">Leo</button>
                      <time className="message-time" dateTime="2026-10-11T09:30:00Z">10/11/2026 9:30 AM</time>
                    </h3>
                    <div className="message-content">Quick question: what's the difference between <code>let</code> and <code>const</code>?</div>
                  </div>
                </li>
                <li className="message is-group-start">
                  <div className="message-gutter"><span className="avatar">A</span></div>
                  <div className="message-body">
                    <h3 className="message-header">
                      <button className="message-author" type="button">Ava</button>
                      <time className="message-time" dateTime="2026-10-11T09:32:00Z">10/11/2026 9:32 AM</time>
                    </h3>
                    <div className="message-content"><code>const</code> means the <em>variable</em> can't be reassigned. The object it points to can still change.</div>
                  </div>
                </li>
                <li className="message is-group-start">
                  <div className="message-gutter"><span className="avatar">L</span></div>
                  <div className="message-body">
                    <h3 className="message-header">
                      <button className="message-author" type="button">Leo</button>
                      <time className="message-time" dateTime="2026-10-11T09:35:00Z">10/11/2026 9:35 AM</time>
                    </h3>
                    <div className="message-content">ohhh that makes sense, thanks!</div>
                  </div>
                </li>
  
                <li className="date-divider" role="separator"><span>October 12, 2026</span></li>
                <li className="message is-group-start">
                  <div className="message-gutter"><span className="avatar">M</span></div>
                  <div className="message-body">
                    <h3 className="message-header">
                      <button className="message-author" type="button">Maya</button>
                      <time className="message-time" dateTime="2026-10-12T14:03:00Z">10/12/2026 2:03 PM</time>
                    </h3>
                    <div className="message-content">Finished the hover animation for the server icons: the circle morphs into a rounded square. Way more satisfying than I expected.</div>
                  </div>
                </li>
                <li className="message is-group-start">
                  <div className="message-gutter"><span className="avatar">R</span></div>
                  <div className="message-body">
                    <h3 className="message-header">
                      <button className="message-author" type="button">Ravi</button>
                      <time className="message-time" dateTime="2026-10-12T14:05:00Z">10/12/2026 2:05 PM</time>
                    </h3>
                    <div className="message-content">how did you animate border-radius? I thought you couldn't transition that</div>
                  </div>
                </li>
                <li className="message is-group-start">
                  <div className="message-gutter"><span className="avatar">M</span></div>
                  <div className="message-body">
                    <h3 className="message-header">
                      <button className="message-author" type="button">Maya</button>
                      <time className="message-time" dateTime="2026-10-12T14:06:30Z">10/12/2026 2:06 PM</time>
                    </h3>
                    <div className="message-content">You can! <code>transition: border-radius 0.2s ease</code> works fine.</div>
                  </div>
                </li>
                <li className="message is-group-start">
                  <div className="message-gutter"><span className="avatar">N</span></div>
                  <div className="message-body">
                    <h3 className="message-header">
                      <button className="message-author" type="button">Noah</button>
                      <time className="message-time" dateTime="2026-10-12T14:20:00Z">10/12/2026 2:20 PM</time>
                    </h3>
                    <div className="message-content">Bookmarking the docs for later: <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/transition">https://developer.mozilla.org/en-US/docs/Web/CSS/transition</a></div>
                  </div>
                </li>
                {/* End of the older messages */}
  
                <li className="date-divider" role="separator"><span>October 13, 2026</span></li>
  
                <li className="message is-group-start is-mention">
                  <div className="message-gutter"><span className="avatar">A</span></div>
                  <div className="message-body">
                    <h3 className="message-header">
                      <button className="message-author" type="button">Ava</button>
                      <time className="message-time" dateTime="2026-10-13T10:15:00Z">Yesterday at 10:15 AM</time>
                    </h3>
                    <div className="message-content">Hey @Sam, how's the clone going? Did you get the grid layout working?</div>
                  </div>
                </li>
  
                <li className="message is-group-start">
                  <div className="message-gutter"><span className="avatar">S</span></div>
                  <div className="message-body">
                    <h3 className="message-header">
                      <button className="message-author" type="button">Sam</button>
                      <time className="message-time" dateTime="2026-10-13T10:22:00Z">Yesterday at 10:22 AM</time>
                    </h3>
                    <div className="message-content">Getting there! The four columns line up now. Scrolling each column on its own was the tricky part.</div>
                  </div>
                </li>
  
                <li className="message">
                  <div className="message-gutter"><time className="message-hover-time" dateTime="2026-10-13T10:23:00Z">10:23 AM</time></div>
                  <div className="message-body">
                    <div className="message-content"><code>min-height: 0</code> saved me 😅</div>
                  </div>
                </li>
  
                <li className="message is-group-start">
                  <div className="message-gutter"><span className="avatar">P</span></div>
                  <div className="message-body">
                    <h3 className="message-header">
                      <button className="message-author" type="button">Priya</button>
                      <time className="message-time" dateTime="2026-10-13T10:25:00Z">Yesterday at 10:25 AM</time>
                    </h3>
                    <div className="message-content">Classic. Flex and grid children default to <code>min-height: auto</code>, so they refuse to shrink below their content.</div>
                  </div>
                </li>
  
                <li className="message is-group-start">
                  <div className="message-gutter"><span className="avatar">Z</span></div>
                  <div className="message-body">
                    <h3 className="message-header">
                      <button className="message-author" type="button">Zoe</button>
                      <time className="message-time" dateTime="2026-10-13T11:02:00Z">Yesterday at 11:02 AM</time>
                    </h3>
                    <div className="message-content">anyone up for game night on friday? 🎲</div>
                  </div>
                </li>
  
                <li className="message is-group-start">
                  <div className="message-gutter"><span className="avatar">O</span></div>
                  <div className="message-body">
                    <h3 className="message-header">
                      <button className="message-author" type="button">Omar</button>
                      <time className="message-time" dateTime="2026-10-13T11:03:00Z">Yesterday at 11:03 AM</time>
                    </h3>
                    <div className="message-content"><em>always</em></div>
                  </div>
                </li>
  
                <li className="message">
                  <div className="message-gutter"><time className="message-hover-time" dateTime="2026-10-13T11:03:20Z">11:03 AM</time></div>
                  <div className="message-body">
                    <div className="message-content">brb, lunch</div>
                  </div>
                </li>
              </ol>
  
              <form className="composer" id="composer">
                <button className="icon-button composer-button" type="button" aria-label="Upload a file">
                  <svg className="icon"><use href="icons.svg#plus" /></svg>
                </button>
                <textarea className="composer-input" id="composer-input" rows="1" placeholder="Message #general" aria-label="Message"></textarea>
                <button className="icon-button composer-button" type="button" aria-label="Choose an emoji">
                  <svg className="icon"><use href="icons.svg#emoji" /></svg>
                </button>
              </form>
            </section>
  
            <aside className="member-list scroller" id="member-list" aria-label="Members">
              <h3 className="member-group-title">Admin — 1</h3>
              <button className="member" type="button">
                <span className="avatar status-online">A<span className="status-dot"></span></span>
                <span className="member-names">
                  <span className="member-name">Ava</span>
                  <span className="member-status-text">Refactoring everything</span>
                </span>
              </button>
  
              <h3 className="member-group-title">Online — 4</h3>
              <button className="member" type="button">
                <span className="avatar status-idle">L<span className="status-dot"></span></span>
                <span className="member-names"><span className="member-name">Leo</span></span>
              </button>
              <button className="member" type="button">
                <span className="avatar status-online">N<span className="status-dot"></span></span>
                <span className="member-names"><span className="member-name">Noah</span></span>
              </button>
              <button className="member" type="button">
                <span className="avatar status-online">R<span className="status-dot"></span></span>
                <span className="member-names"><span className="member-name">Ravi</span></span>
              </button>
              <button className="member" type="button">
                <span className="avatar status-online">S<span className="status-dot"></span></span>
                <span className="member-names">
                  <span className="member-name">Sam</span>
                  <span className="member-status-text">Learning frontend 🚀</span>
                </span>
              </button>
  
              <h3 className="member-group-title">Offline — 2</h3>
              <button className="member is-offline" type="button">
                <span className="avatar status-offline">K<span className="status-dot"></span></span>
                <span className="member-names"><span className="member-name">Kenji</span></span>
              </button>
              <button className="member is-offline" type="button">
                <span className="avatar status-offline">N<span className="status-dot"></span></span>
                <span className="member-names"><span className="member-name">Nora</span></span>
              </button>
            </aside>
          </div>
        </main>
      </div>
  
      {/* The dark overlay behind the drawer on small screens */}
      <div className="drawer-backdrop" id="drawer-backdrop"></div>
    
  
    </>
  );
}

export default App;
