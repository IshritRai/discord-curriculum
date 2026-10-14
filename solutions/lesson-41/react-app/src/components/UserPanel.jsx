import { useApp } from '../state/AppContext.jsx';
import { CURRENT_USER_ID, getUser } from '../state/selectors.js';
import { classNames } from '../lib/classNames.js';
import { Avatar } from './Avatar.jsx';
import { Icon } from './Icon.jsx';

function ToggleButton({ id, pressed, icon, label, onClick }) {
  return (
    <button className="icon-button" type="button" id={id} data-tooltip={label} aria-label={label} aria-pressed={pressed} onClick={onClick}>
      <Icon name={icon} />
    </button>
  );
}

export function UserPanel() {
  const { state, dispatch } = useApp();
  const me = getUser(state, CURRENT_USER_ID);
  const { muted, deafened } = state.voice;

  function openSettings(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    dispatch({ type: 'openMenu', menu: { kind: 'settings', x: rect.left, y: rect.top - 4 } });
  }

  return (
    <section className="user-panel" aria-label="Your account">
      <button
        className={classNames('user-panel-profile', state.speakingUserIds.includes(CURRENT_USER_ID) && 'is-speaking')}
        type="button"
        id="user-panel-profile"
        onClick={() => dispatch({ type: 'openDialog', dialog: { kind: 'profile', id: CURRENT_USER_ID } })}
      >
        <Avatar user={me} withStatus />
        <span className="user-panel-names">
          <span className="user-panel-name" id="user-panel-name">{me.displayName}</span>
          <span className="user-panel-tag" id="user-panel-tag">{me.customStatus || me.username}</span>
        </span>
      </button>
      <ToggleButton
        id="mute-button"
        pressed={muted}
        icon={muted ? 'mic-off' : 'mic'}
        label={muted ? 'Unmute' : 'Mute'}
        onClick={() => dispatch({ type: 'toggleMute' })}
      />
      <ToggleButton
        id="deafen-button"
        pressed={deafened}
        icon={deafened ? 'headphones-off' : 'headphones'}
        label={deafened ? 'Undeafen' : 'Deafen'}
        onClick={() => dispatch({ type: 'toggleDeafen' })}
      />
      <button className="icon-button" type="button" id="settings-button" data-tooltip="User Settings" aria-label="User Settings" onClick={openSettings}>
        <Icon name="settings" />
      </button>
    </section>
  );
}
