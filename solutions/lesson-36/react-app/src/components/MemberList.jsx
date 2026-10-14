import { useApp } from '../state/AppContext.jsx';
import { getUser } from '../state/selectors.js';
import { classNames } from '../lib/classNames.js';
import { Avatar } from './Avatar.jsx';

function Member({ user }) {
  const isOffline = user.status === 'offline';
  return (
    <button className={classNames('member', isOffline && 'is-offline')} type="button">
      <Avatar user={user} withStatus />
      <span className="member-names">
        <span className="member-name">{user.displayName}</span>
        {user.customStatus && !isOffline && <span className="member-status-text">{user.customStatus}</span>}
      </span>
    </button>
  );
}

export function MemberList({ server }) {
  const { state } = useApp();
  const users = server.members.map((member) => getUser(state, member.userId));
  return (
    <aside className="member-list scroller" id="member-list" aria-label="Members">
      <h3 className="member-group-title">Members — {users.length}</h3>
      {users.map((user) => (
        <Member key={user.id} user={user} />
      ))}
    </aside>
  );
}
