import { useLayoutEffect, useRef } from 'react';
import { useApp } from '../state/AppContext.jsx';
import { CURRENT_USER_ID, findChannel, findMessage, getUser } from '../state/selectors.js';
import { clearSaved } from '../state/storage.js';
import { Icon } from './Icon.jsx';

function copyText(text) {
  navigator.clipboard.writeText(text).catch((error) => {
    console.warn('Could not copy to the clipboard.', error);
  });
}

// Builds the list of menu items for whatever was right-clicked.
function useMenuItems(menu) {
  const { state, dispatch } = useApp();
  if (menu === null) {
    return [];
  }
  const { kind, id } = menu;

  if (kind === 'server') {
    const server = state.servers.find((s) => s.id === id);
    return [
      { label: 'Mark As Read', icon: 'check', run: () => dispatch({ type: 'markServerRead', serverId: id }) },
      { label: 'Copy Server Name', icon: 'copy', run: () => copyText(server.name) },
      'separator',
      { label: 'Leave Server', icon: 'leave', danger: true, run: () => dispatch({ type: 'leaveServer', serverId: id }) },
    ];
  }
  if (kind === 'channel') {
    const channel = findChannel(state, id);
    const items = [];
    if (channel.type === 'voice') {
      items.push({ label: 'Join Voice', icon: 'speaker', run: () => dispatch({ type: 'joinVoice', channelId: id }) });
    } else {
      items.push({ label: 'Mark As Read', icon: 'check', run: () => dispatch({ type: 'markRead', channelId: id }) });
    }
    items.push({ label: 'Copy Channel Name', icon: 'copy', run: () => copyText(channel.name) });
    return items;
  }
  if (kind === 'message') {
    const message = findMessage(state, id);
    const items = [
      {
        label: 'Add Reaction',
        icon: 'reaction-add',
        run: () => {
          const rect = document.querySelector(`[data-message-id="${id}"]`).getBoundingClientRect();
          dispatch({ type: 'openPicker', rect, onPick: (emoji) => dispatch({ type: 'toggleReaction', messageId: id, emoji }) });
        },
      },
      { label: 'Copy Text', icon: 'copy', run: () => copyText(message.content) },
    ];
    if (message.authorId === CURRENT_USER_ID) {
      items.push({ label: 'Edit Message', icon: 'edit', run: () => dispatch({ type: 'startEditing', messageId: id }) });
      items.push('separator');
      items.push({ label: 'Delete Message', icon: 'trash', danger: true, run: () => dispatch({ type: 'openDialog', dialog: { kind: 'delete', id } }) });
    }
    return items;
  }
  if (kind === 'user') {
    const user = getUser(state, id);
    const channelId = state.viewingChannelId;
    return [
      { label: 'Profile', icon: 'user', run: () => dispatch({ type: 'openDialog', dialog: { kind: 'profile', id } }) },
      {
        label: 'Mention',
        icon: 'at',
        run: () => {
          const draft = state.drafts[channelId] ?? '';
          dispatch({ type: 'setDraft', channelId, text: `${draft}@${user.displayName} ` });
          document.querySelector('#composer-input').focus();
        },
      },
    ];
  }
  // kind === 'settings'
  return [
    { label: 'My Profile', icon: 'user', run: () => dispatch({ type: 'openDialog', dialog: { kind: 'profile', id: CURRENT_USER_ID } }) },
    'separator',
    {
      label: 'Reset Demo Data',
      icon: 'trash',
      danger: true,
      run: () => {
        clearSaved();
        location.reload();
      },
    },
  ];
}

export function ContextMenu() {
  const { state, dispatch } = useApp();
  const menuRef = useRef(null);
  const menu = state.menu;
  const items = useMenuItems(menu);

  // Open/close the popover and keep the whole menu inside the window.
  useLayoutEffect(() => {
    const element = menuRef.current;
    if (menu === null) {
      if (element.matches(':popover-open')) {
        element.hidePopover();
      }
      return;
    }
    element.showPopover();
    let left = menu.x;
    let top = menu.y;
    if (left + element.offsetWidth > window.innerWidth - 8) {
      left = menu.x - element.offsetWidth;
    }
    if (top + element.offsetHeight > window.innerHeight - 8) {
      top = menu.y - element.offsetHeight;
    }
    element.style.left = `${Math.max(8, left)}px`;
    element.style.top = `${Math.max(8, top)}px`;
    element.querySelector('.menu-item').focus();
  }, [menu]);

  function handleToggle(event) {
    if (!event.currentTarget.matches(':popover-open')) {
      dispatch({ type: 'closeMenu' });
    }
  }

  return (
    <div className="context-menu" id="context-menu" popover="auto" ref={menuRef} onToggle={handleToggle}>
      {items.map((item, index) =>
        item === 'separator' ? (
          <div key={`separator-${index}`} className="menu-separator" />
        ) : (
          <button
            key={item.label}
            className={item.danger ? 'menu-item danger' : 'menu-item'}
            type="button"
            onClick={() => {
              menuRef.current.hidePopover();
              item.run();
            }}
          >
            <span>{item.label}</span>
            <Icon name={item.icon} />
          </button>
        ),
      )}
    </div>
  );
}
