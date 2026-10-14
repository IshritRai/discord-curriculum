import { useApp } from '../state/AppContext.jsx';
import { CURRENT_USER_ID, getUser } from '../state/selectors.js';
import { Avatar } from './Avatar.jsx';
import { Icon } from './Icon.jsx';

export function UserPanel() {
  const { state } = useApp();
  const me = getUser(state, CURRENT_USER_ID);
  return (
    <section className="user-panel" aria-label="Your account">
      <button className="user-panel-profile" type="button" id="user-panel-profile">
        <Avatar user={me} withStatus />
        <span className="user-panel-names">
          <span className="user-panel-name" id="user-panel-name">{me.displayName}</span>
          <span className="user-panel-tag" id="user-panel-tag">{me.customStatus || me.username}</span>
        </span>
      </button>
      <button className="icon-button" type="button" id="mute-button" data-tooltip="Mute" aria-label="Mute">
        <Icon name="mic" />
      </button>
      <button className="icon-button" type="button" id="deafen-button" data-tooltip="Deafen" aria-label="Deafen">
        <Icon name="headphones" />
      </button>
      <button className="icon-button" type="button" id="settings-button" data-tooltip="User Settings" aria-label="User Settings">
        <Icon name="settings" />
      </button>
    </section>
  );
}
