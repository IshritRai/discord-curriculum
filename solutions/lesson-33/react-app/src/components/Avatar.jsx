import { classNames } from '../lib/classNames.js';

// A round avatar with the user's first letter on their color.
export function Avatar({ user, withStatus = false, className }) {
  return (
    <span
      className={classNames('avatar', className, withStatus && `status-${user.status}`)}
      style={{ '--avatar-color': user.avatarColor }}
    >
      {user.displayName[0]}
      {withStatus && <span className="status-dot" />}
    </span>
  );
}
