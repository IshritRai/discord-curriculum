import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../state/AppContext.jsx';
import { CURRENT_USER_ID, findMessage, findServerOfChannel, getUser } from '../state/selectors.js';
import { classNames } from '../lib/classNames.js';
import { Avatar } from './Avatar.jsx';
import { Icon } from './Icon.jsx';

// A <dialog> that opens as a modal as soon as it appears on screen.
// Closing it (Escape, a button, a backdrop click) tells the app with onClose.
function Modal({ id, className, onClose, children, style }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    dialogRef.current.showModal();
  }, []);

  function handleClick(event) {
    // A click on the dialog element itself is a click on the dark backdrop.
    if (event.target === dialogRef.current) {
      dialogRef.current.close();
    }
  }

  return (
    <dialog ref={dialogRef} id={id} className={classNames('modal', className)} style={style} onClose={onClose} onClick={handleClick}>
      {children}
    </dialog>
  );
}

function CreateServerDialog({ onClose }) {
  const { dispatch } = useApp();
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = form.get('serverName').trim();
    const iconText = form.get('serverIcon').trim();
    const id = crypto.randomUUID();
    const initials = name
      .split(/\s+/)
      .map((word) => word[0].toUpperCase())
      .join('')
      .slice(0, 3);
    dispatch({
      type: 'createServer',
      server: {
        id,
        name,
        icon: iconText || initials,
        iconIsEmoji: iconText !== '',
        roles: [],
        members: [{ userId: CURRENT_USER_ID, roleId: null }],
        categories: [
          {
            id: `${id}-text`,
            name: 'Text Channels',
            channels: [{ id: `${id}-general`, name: 'general', type: 'text', topic: '', unread: false, mentions: 0 }],
          },
          {
            id: `${id}-voice`,
            name: 'Voice Channels',
            channels: [{ id: `${id}-voice-general`, name: 'General', type: 'voice', voiceUserIds: [] }],
          },
        ],
      },
    });
    navigate(`/channels/${id}/${id}-general`);
  }

  return (
    <Modal id="create-server-dialog" onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <h2 className="modal-title">Customize your server</h2>
        <p className="modal-text">Give your new server a personality with a name and an icon. You can always change it later.</p>
        <label className="field">
          <span className="field-label">Server name</span>
          <input className="field-input" name="serverName" required maxLength={40} autoComplete="off" />
        </label>
        <label className="field">
          <span className="field-label">Icon (an emoji, or leave empty for initials)</span>
          <input className="field-input" name="serverIcon" maxLength={2} autoComplete="off" />
        </label>
        <div className="modal-actions">
          <button className="button button-secondary" type="button" onClick={onClose}>
            Back
          </button>
          <button className="button button-primary" type="submit">
            Create
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ProfileDialog({ userId, onClose }) {
  const { state } = useApp();
  const user = getUser(state, userId);
  // Their role in the server you're looking at
  const server = findServerOfChannel(state, state.viewingChannelId);
  const member = server.members.find((m) => m.userId === userId);
  const role = member && server.roles.find((r) => r.id === member.roleId);

  return (
    <Modal id="profile-dialog" className="profile-modal" onClose={onClose} style={{ '--avatar-color': user.avatarColor }}>
      <div className="profile-banner" />
      <Avatar user={user} withStatus className="profile-avatar" />
      <div className="profile-body">
        <h2 className="profile-name">{user.displayName}</h2>
        <p className="profile-username">{user.username}</p>
        <p className="profile-custom-status">{user.customStatus}</p>
        <h3 className="profile-heading">About me</h3>
        <p className="profile-bio">{user.bio}</p>
        <h3 className="profile-heading">Role</h3>
        <p className="profile-role">{role ? role.name : 'No roles'}</p>
      </div>
      <button className="icon-button modal-close" type="button" aria-label="Close" onClick={onClose}>
        <Icon name="close" />
      </button>
    </Modal>
  );
}

function DeleteDialog({ messageId, onClose }) {
  const { state, dispatch } = useApp();
  const message = findMessage(state, messageId);
  return (
    <Modal id="delete-dialog" onClose={onClose}>
      <div className="modal-form">
        <h2 className="modal-title">Delete Message</h2>
        <p className="modal-text">Are you sure you want to delete this message?</p>
        <blockquote className="delete-preview">{message.content}</blockquote>
        <div className="modal-actions">
          <button className="button button-secondary" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="button button-danger" type="button" onClick={() => dispatch({ type: 'deleteMessage', messageId })}>
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Shows whichever dialog state.dialog asks for (or nothing).
export function Dialogs() {
  const { state, dispatch } = useApp();
  const dialog = state.dialog;
  const close = () => dispatch({ type: 'closeDialog' });
  if (dialog === null) {
    return null;
  }
  if (dialog.kind === 'createServer') {
    return <CreateServerDialog onClose={close} />;
  }
  if (dialog.kind === 'profile') {
    return <ProfileDialog key={dialog.id} userId={dialog.id} onClose={close} />;
  }
  return <DeleteDialog messageId={dialog.id} onClose={close} />;
}
