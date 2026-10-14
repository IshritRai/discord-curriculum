import { Fragment } from 'react';
import { useApp } from '../state/AppContext.jsx';
import { groupMembers } from '../state/selectors.js';
import { classNames } from '../lib/classNames.js';
import { Avatar } from './Avatar.jsx';

function Member({ user, role }) {
  const isOffline = user.status === 'offline';
  return (
    <button className={classNames('member', isOffline && 'is-offline')} type="button">
      <Avatar user={user} withStatus />
      <span className="member-names">
        <span className="member-name" style={{ '--author-color': role?.color }}>
          {user.displayName}
        </span>
        {user.customStatus && !isOffline && <span className="member-status-text">{user.customStatus}</span>}
      </span>
    </button>
  );
}

export function MemberList({ server }) {
  const { state } = useApp();
  return (
    <aside className="member-list scroller" id="member-list" aria-label="Members">
      {groupMembers(state, server).map((group) => (
        <Fragment key={group.title}>
          <h3 className="member-group-title">
            {group.title} — {group.members.length}
          </h3>
          {group.members.map((entry) => (
            <Member key={entry.user.id} user={entry.user} role={entry.role} />
          ))}
        </Fragment>
      ))}
    </aside>
  );
}
