import { Icon } from './Icon.jsx';
import { MessageList } from './MessageList.jsx';
import { MemberList } from './MemberList.jsx';
import { Composer } from './Composer.jsx';

// A button with an icon and a tooltip. ...rest passes any other props (id, onClick...) to the <button>.
function HeaderButton({ icon, label, ...rest }) {
  return (
    <button className="icon-button" type="button" data-tooltip={label} aria-label={label} {...rest}>
      <Icon name={icon} />
    </button>
  );
}

function ChatHeader({ channel, showMembers, onToggleMembers, onOpenNav }) {
  return (
    <header className="chat-header">
      <button className="icon-button menu-button" type="button" id="menu-button" aria-label="Open channels" onClick={onOpenNav}>
        <Icon name="menu" />
      </button>
      <svg className="icon chat-header-icon" aria-hidden="true">
        <use href="icons.svg#hash" />
      </svg>
      <h2 className="chat-title" id="chat-title">
        {channel.name}
      </h2>
      <p className="chat-topic" id="chat-topic">
        {channel.topic}
      </p>
      <div className="chat-toolbar">
        <HeaderButton icon="bell" label="Notification Settings" />
        <HeaderButton icon="pin" label="Pinned Messages" />
        <HeaderButton icon="members" label="Member List" id="members-button" aria-pressed={showMembers} onClick={onToggleMembers} />
        <label className="search">
          <input className="search-input" type="search" placeholder="Search" aria-label="Search" />
          <Icon name="search" />
        </label>
        <HeaderButton icon="inbox" label="Inbox" />
        <HeaderButton icon="help" label="Help" />
      </div>
    </header>
  );
}

export function ChatArea({ server, channel, messages, showMembers, onToggleMembers, onOpenNav, onSend, data }) {
  return (
    <main className="chat">
      <ChatHeader channel={channel} showMembers={showMembers} onToggleMembers={onToggleMembers} onOpenNav={onOpenNav} />
      <div className="chat-body">
        <section className="chat-main" aria-label="Messages">
          <MessageList server={server} channel={channel} messages={messages} data={data} />
          <Composer channel={channel} onSend={onSend} />
          <p className="typing-indicator" id="typing-indicator" aria-live="polite"></p>
        </section>
        {showMembers && <MemberList server={server} data={data} />}
      </div>
    </main>
  );
}
