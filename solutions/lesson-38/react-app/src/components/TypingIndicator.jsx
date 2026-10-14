import { useApp } from '../state/AppContext.jsx';
import { getUser } from '../state/selectors.js';

// "Ava is typing…" under the composer, if they're typing in this channel.
export function TypingIndicator({ channel }) {
  const { state } = useApp();
  const typing = state.typing;
  const isTypingHere = typing !== null && typing.channelId === channel.id;
  return (
    <p className="typing-indicator" id="typing-indicator" aria-live="polite">
      {isTypingHere && (
        <>
          <span className="typing-dots">
            <span />
            <span />
            <span />
          </span>
          <strong>{getUser(state, typing.userId).displayName}</strong> is typing…
        </>
      )}
    </p>
  );
}
