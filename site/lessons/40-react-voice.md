---
lesson: 40
title: Voice UI & custom hooks
---

# Lesson 40 — Voice UI & custom hooks

Voice channels have been decoration so far. In this lesson you can join one, mute and deafen yourself, and watch speaking rings light up around people who are "talking". Along the way you'll write your own **custom hooks**, which are how React lets you package an effect (with its cleanup) so any component can reuse it. An optional part lights up your own ring using your real microphone, just like the optional Lesson 30 in the plain-JS half.

## 🎯 Goal

- Click a voice channel (Lounge or Pair Programming) in the channel list: you join it. A "Voice Connected" panel appears above your user panel and you show up in the channel's list.
- The mute and deafen buttons toggle, change icon and label, and show a small muted/deafened icon next to your name in the voice channel.
- People in voice channels get a green ring while they "speak", flickering on and off every moment.
- Disconnect leaves the channel.

![The chat app with the Frontend Friends server; in the Lounge voice channel, Ava's avatar has a green speaking ring while Priya's does not](/screenshots/lesson-40.png){.screenshot}

In the screenshot, Ava is "speaking" at the moment it was taken. The rings change every 400 ms, so yours will differ.

## 🧠 New concepts

<ConceptList />

### Custom hooks

You already use hooks like `useState` and `useEffect`. A **custom hook** is simply *your own function whose name starts with `use` and that calls other hooks*. It lets you give a name to a behavior and reuse it:

```jsx
function useSimulation() {
  const { dispatch, getState } = useApp();
  useEffect(() => {
    const stop = startSimulation(getState, dispatch);
    return stop;
  }, [dispatch]);
}

function App() {
  useSimulation();   // one line in the component
  // ...
}
```

Nothing magical: the hook's code runs as part of the component that calls it, in the same order every render. You wrote `useSimulation` in Lesson 36 and `useTooltips` in Lesson 39; now you'll write two more on purpose.

The **rules of hooks** (react.dev has a page called [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)): call hooks only at the top level of a component or another hook, never inside `if`, loops or after an early `return`. The `use` prefix is how tools (and you) recognize "this function follows those rules".

### Effects that start and stop hardware

Starting a timer or a microphone is a side effect that must be undone when it's no longer wanted. The pattern is always the same:

```jsx
useEffect(() => {
  if (!enabled) {
    return;               // nothing to start, nothing to clean up
  }
  start();                // set up
  return () => stop();    // clean up
}, [enabled]);
```

Here `enabled` is the dependency: when it goes from `false` to `true`, `start()` runs. When it goes back to `false`, or the component disappears, React runs the cleanup first.

`setInterval` calls a function every N milliseconds, until you `clearInterval(timerId)`. Like `setTimeout` and `clearTimeout` from Lesson 36, it must be cleared in the cleanup, or it keeps firing forever (and twice in development with StrictMode).

### Components that are always rendered

`VoicePanel` is **always rendered**; when you aren't connected, it just has the `hidden` attribute (`hidden={channelId === null}`). The alternative, returning `null` when disconnected, would also work. We keep it mounted because it owns the mic checkbox's state and the mic hook, and it is the one place that must turn the mic off when you disconnect.

### Why re-rendering everything every 400 ms is fine here

The speaking simulation dispatches `setSpeaking` with a new array every 400 ms. A new state means the provider re-renders, and every component that calls `useApp()` re-renders with it. That sounds terrible, and in the plain-JS app we avoided it: `renderSpeaking` flipped one CSS class on the right elements and nothing else.

In React it is acceptable here for three reasons:

1. Re-rendering is *calling your component functions*. React then compares the new JSX with the old and changes only the DOM nodes that differ: here, a class name on a few elements.
2. This app has a few hundred small components and does little work in each. I did not measure how long a render takes; you can look at React's profiler or Chrome's **Performance** tab if you are curious.
3. 400 ms between updates is slow compared with a 60 frames-per-second animation.

It would become a problem with a much larger tree or much faster updates. Possible fixes (not needed now): dispatch only when the list actually changed, or keep the speaking state in a smaller context that fewer components read. The plain-JS version didn't need that care because it updated the DOM by hand, which is exactly the work React was designed to do for you.

::: info Vanilla vs React
Plain-JS (`vanilla/js/voice.js`): after each tick, a function walks the DOM and flips one class:

```js
export function renderSpeaking() {
  for (const item of document.querySelectorAll('.voice-user')) {
    item.classList.toggle('is-speaking', state.speakingUserIds.includes(item.dataset.userId));
  }
  profileButton.classList.toggle('is-speaking', state.speakingUserIds.includes(CURRENT_USER_ID));
}
```

React (`react-app/src/components/ChannelList.jsx`): the class is just part of what the component returns for the current state. Nobody walks the DOM:

```jsx
<li className={classNames('voice-user', state.speakingUserIds.includes(userId) && 'is-speaking')} data-user-id={userId} />
```

Same idea as Lesson 16's state-to-render loop; React runs the render step for you.
:::

## 🛠️ Build it

### Step 1 — A selector: everyone in voice

In `state/selectors.js`, add `peopleInVoice` at the bottom. It collects the `voiceUserIds` of every voice channel in every server (you are not included; you aren't in the data).

::: solution
```js [react-app/src/state/selectors.js]

// Everyone in voice channels (except you), across all servers.
export function peopleInVoice(state) {
  const ids = [];
  for (const server of state.servers) {
    for (const channel of getChannels(server)) {
      if (channel.type === 'voice') {
        ids.push(...channel.voiceUserIds);
      }
    }
  }
  return ids;
}
```
:::

### Step 2 — Reducer: voice state and actions

In `state/reducer.js`:

1. Import `findServerOfChannel` too.
2. Add two state fields: `voice: { channelId: null, muted: false, deafened: false }` and `speakingUserIds: []`.
3. Change `leaveServer` so leaving the server you are in voice on also disconnects you.
4. Add a "Voice" section with `joinVoice`, `leaveVoice`, `toggleMute`, `toggleDeafen` and `setSpeaking`. Mute and deafen follow Discord's rules, as in the plain-JS app: un-muting also un-deafens, and deafening also mutes.

::: solution
```js [react-app/src/state/reducer.js]
import { CURRENT_USER_ID, findChannel, findServerOfChannel, getChannels } from './selectors.js';

export function createInitialState(data) {
  const saved = loadSaved();
  return {
    /* ...unchanged... */
    typing: null, // { channelId, userId } while someone is "typing"
    voice: { channelId: null, muted: false, deafened: false },
    speakingUserIds: [],
    picker: null, // { onPick, rect } while the emoji picker is open
    /* ...unchanged... */
  };
}

export function reducer(state, action) {
  switch (action.type) {
    /* ...earlier cases unchanged... */

    // ----- Servers -----
    case 'createServer':
      return { ...state, servers: [...state.servers, action.server], dialog: null };
    case 'leaveServer': {
      if (state.servers.length === 1) {
        return state; // keep at least one server
      }
      // Leaving the server you're talking in also disconnects you from voice
      const voiceServer = state.voice.channelId && findServerOfChannel(state, state.voice.channelId);
      const leavingVoice = voiceServer && voiceServer.id === action.serverId;
      return {
        ...state,
        servers: state.servers.filter((s) => s.id !== action.serverId),
        voice: leavingVoice ? { ...state.voice, channelId: null } : state.voice,
      };
    }

    // ----- Voice -----
    case 'joinVoice':
      return { ...state, voice: { ...state.voice, channelId: action.channelId } };
    case 'leaveVoice':
      return {
        ...state,
        voice: { ...state.voice, channelId: null },
        speakingUserIds: state.speakingUserIds.filter((id) => id !== CURRENT_USER_ID),
      };
    case 'toggleMute': {
      const muted = !state.voice.muted;
      // Un-muting also un-deafens, like the real app.
      return { ...state, voice: { ...state.voice, muted, deafened: muted ? state.voice.deafened : false } };
    }
    case 'toggleDeafen': {
      const deafened = !state.voice.deafened;
      // Deafening also mutes you.
      return { ...state, voice: { ...state.voice, deafened, muted: deafened } };
    }
    case 'setSpeaking':
      return { ...state, speakingUserIds: action.userIds };

    /* ...picker, menu and dialog cases and default unchanged... */
  }
}
```
:::

### Step 3 — Custom hook: the speaking simulation

Create `hooks/useSpeakingSimulation.js`. It's the vanilla `startSpeakingSimulation` as a hook. Every 400 ms: for each person in a voice channel, decide whether they are speaking (if they were speaking, a 75% chance they continue; if not, a 25% chance they start). Your own ring is controlled by the mic, not by chance. Then it dispatches `setSpeaking`.

Two things to notice:

- It reads `getState()` inside the timer, so it always sees the latest state (Lesson 36).
- The effect returns `() => clearInterval(timer)`.

Then in `App.jsx`, import it and call `useSpeakingSimulation();` right after `useSimulation();`.

::: solution
```js [react-app/src/hooks/useSpeakingSimulation.js]
import { useEffect } from 'react';
import { useApp } from '../state/AppContext.jsx';
import { CURRENT_USER_ID, peopleInVoice } from '../state/selectors.js';

// Fake speaking: every 400 ms, each person in a voice channel may start or stop talking.
export function useSpeakingSimulation() {
  const { dispatch, getState } = useApp();
  useEffect(() => {
    const timer = setInterval(() => {
      const state = getState();
      const speaking = [];
      for (const userId of peopleInVoice(state)) {
        const wasSpeaking = state.speakingUserIds.includes(userId);
        if (Math.random() < (wasSpeaking ? 0.75 : 0.25)) {
          speaking.push(userId);
        }
      }
      // Your own light is controlled by your mic, not by chance (and muting turns it off).
      const canSpeak = state.voice.channelId !== null && !state.voice.muted;
      if (state.speakingUserIds.includes(CURRENT_USER_ID) && canSpeak) {
        speaking.push(CURRENT_USER_ID);
      }
      dispatch({ type: 'setSpeaking', userIds: speaking });
    }, 400);
    return () => clearInterval(timer);
  }, [dispatch, getState]);
}
```
```jsx [react-app/src/App.jsx]
import { useSpeakingSimulation } from './hooks/useSpeakingSimulation.js';

/* ...GoToDefaultChannel and ChatScreen unchanged... */

function App() {
  const { dispatch } = useApp();
  useSimulation();
  useSpeakingSimulation();

  /* ...the rest of App is unchanged... */
}
```
:::

### Step 4 — Optional: the microphone

*The microphone feature is optional, but the files in this step are not: `VoicePanel` imports them.* The speaking ring for **you** can follow your real microphone. The code that measures the loudness is the same `mic.js` you wrote in Lesson 30. Copy it from the plain-JS project, from the project root:

```sh
cp vanilla/js/mic.js react-app/src/lib/mic.js
```

If you never wrote it, paste it from the box below. It is not React code; it only talks to the browser's audio APIs (Lesson 30 explains each line).

::: starter 30
<<< @/../solutions/lesson-40/react-app/src/lib/mic.js [react-app/src/lib/mic.js]
:::

Then create the custom hook `hooks/useMicSpeaking.js`. It takes three arguments: whether the mic should be on (`enabled`), a function to call when you start or stop speaking, and a function to call on error. The effect:

- does nothing when `enabled` is false;
- otherwise calls `startMic(...)`, which asks the browser for permission and returns a Promise (`.catch(onError)` handles a refusal);
- returns a cleanup that calls `stopMic()` (turning off the browser's recording indicator) and reports "not speaking".

Only `enabled` is in the dependency array, on purpose: the two callbacks are new functions on every render, and listing them would restart the microphone each time. The comment in the file says so. (A linter configured for React would ask you to list them; the shortcut is safe here because the callbacks only use `dispatch`, `getState` and state setters, which don't change.)

If you skipped Lesson 30, still do this whole step. Nothing touches the microphone until you tick the checkbox in the voice panel, so the app works without it.

::: solution
```js [react-app/src/hooks/useMicSpeaking.js]
import { useEffect } from 'react';
import { startMic, stopMic } from '../lib/mic.js';

// While `enabled` is true, listens to your microphone (locally, nothing is sent
// anywhere) and calls onSpeakingChange(true/false). Turning it off, or the component
// disappearing, stops the microphone.
export function useMicSpeaking(enabled, onSpeakingChange, onError) {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    startMic(onSpeakingChange).catch(onError);
    return () => {
      stopMic();
      onSpeakingChange(false);
    };
    // Only `enabled` is listed: the callbacks are new functions on every render,
    // and we don't want to restart the microphone each time.
  }, [enabled]);
}
```
:::

### Step 5 — The VoicePanel component

Create `components/VoicePanel.jsx`. It shows "Voice Connected", the channel and server names, a checkbox for the mic, and a Disconnect button.

- `micOn` and `micError` are local state (`useState`, Lesson 34): they belong to this panel only.
- `useMicSpeaking(micOn && channelId !== null, onSpeakingChange, onError)` is your custom hook. `onSpeakingChange` adds or removes you from `speakingUserIds` (reading the latest state with `getState()`, and only if you're connected and not muted).
- `channel && ...`: `channelId` is `null` when disconnected, so the lookups are skipped (`null && x` gives `null`, and React renders nothing for it).
- The section always renders, with `hidden={channelId === null}`.
- `disconnect()` turns the mic off and dispatches `leaveVoice`.

::: solution
```jsx [react-app/src/components/VoicePanel.jsx]
import { useState } from 'react';
import { useApp } from '../state/AppContext.jsx';
import { CURRENT_USER_ID, findChannel, findServerOfChannel } from '../state/selectors.js';
import { useMicSpeaking } from '../hooks/useMicSpeaking.js';
import { Icon } from './Icon.jsx';

// The "Voice Connected" panel, shown while you're in a voice channel.
export function VoicePanel() {
  const { state, dispatch, getState } = useApp();
  const [micOn, setMicOn] = useState(false);
  const [micError, setMicError] = useState(false);
  const channelId = state.voice.channelId;

  useMicSpeaking(
    micOn && channelId !== null,
    (isSpeaking) => {
      const current = getState();
      const others = current.speakingUserIds.filter((id) => id !== CURRENT_USER_ID);
      const canSpeak = current.voice.channelId !== null && !current.voice.muted;
      dispatch({ type: 'setSpeaking', userIds: isSpeaking && canSpeak ? [...others, CURRENT_USER_ID] : others });
    },
    (error) => {
      console.warn('Microphone not available:', error);
      setMicOn(false);
      setMicError(true);
    },
  );

  const channel = channelId && findChannel(state, channelId);
  const server = channelId && findServerOfChannel(state, channelId);

  function disconnect() {
    setMicOn(false);
    dispatch({ type: 'leaveVoice' });
  }

  let micLabel = 'Light up when I talk (uses my mic)';
  if (micOn) {
    micLabel = 'Using my mic (stays on this device)';
  } else if (micError) {
    micLabel = 'Mic blocked: check the browser permission';
  }

  return (
    // Always on the page, but hidden while you're not connected
    <section className="voice-panel" id="voice-panel" aria-label="Voice connection" hidden={channelId === null}>
      <div className="voice-panel-info">
        <p className="voice-panel-status">
          <Icon name="signal" />
          Voice Connected
        </p>
        <p className="voice-panel-channel" id="voice-panel-channel">
          {channel && `${channel.name} / ${server.name}`}
        </p>
        <label className="mic-toggle">
          <input type="checkbox" id="mic-toggle" checked={micOn} onChange={(event) => setMicOn(event.target.checked)} />
          <span>{micLabel}</span>
        </label>
      </div>
      <button className="icon-button" type="button" id="disconnect-button" data-tooltip="Disconnect" aria-label="Disconnect" onClick={disconnect}>
        <Icon name="disconnect" />
      </button>
    </section>
  );
}
```
:::

### Step 6 — Place the panel in the sidebar

In `ChannelSidebar.jsx` import `VoicePanel` and render `<VoicePanel />` between `<ChannelList … />` and `<UserPanel />`.

::: solution
```jsx [react-app/src/components/ChannelSidebar.jsx]
import { useApp } from '../state/AppContext.jsx';
import { ChannelList } from './ChannelList.jsx';
import { VoicePanel } from './VoicePanel.jsx';
import { UserPanel } from './UserPanel.jsx';
import { Icon } from './Icon.jsx';

export function ChannelSidebar({ server, activeChannelId }) {
  const { dispatch } = useApp();

  // Clicking the server name opens the server's menu just below it.
  function openServerMenu(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    dispatch({ type: 'openMenu', menu: { kind: 'server', id: server.id, x: rect.left + 10, y: rect.bottom + 4 } });
  }

  return (
    <aside className="channel-sidebar" aria-label="Channels">
      <header className="sidebar-header" onClick={openServerMenu}>
        <h1 className="server-name" id="server-name">
          {server.name}
        </h1>
        <Icon name="chevron-down" />
      </header>
      <ChannelList server={server} activeChannelId={activeChannelId} />
      <VoicePanel />
      <UserPanel />
    </aside>
  );
}
```
:::

### Step 7 — Channel list: join voice, show who's talking

In `ChannelList.jsx`:

1. Import `CURRENT_USER_ID` too.
2. Add the small `useVoiceUserIds(channel)` helper above `VoiceUser`: for a voice channel, the people in it, plus you if `state.voice.channelId` is this channel. (Starts with `use` because it calls `useApp()`.)
3. `VoiceUser`: add the `is-speaking` class when the user's id is in `state.speakingUserIds`, and, for yourself, a muted or deafened icon.
4. `ChannelItem`: use `useVoiceUserIds`, and in `handleClick` a voice channel now dispatches `joinVoice` (a text channel still navigates). The drawer closes either way.
5. `Category`: a collapsed category should still show the voice channel you're connected to.

::: solution
```jsx [react-app/src/components/ChannelList.jsx]
import { useNavigate } from 'react-router';
import { useApp } from '../state/AppContext.jsx';
import { CURRENT_USER_ID, getUser } from '../state/selectors.js';
import { classNames } from '../lib/classNames.js';
import { Avatar } from './Avatar.jsx';
import { Icon } from './Icon.jsx';

// People connected to a voice channel (including you, if you joined it).
function useVoiceUserIds(channel) {
  const { state } = useApp();
  if (channel.type !== 'voice') {
    return [];
  }
  return state.voice.channelId === channel.id ? [...channel.voiceUserIds, CURRENT_USER_ID] : channel.voiceUserIds;
}

function VoiceUser({ userId }) {
  const { state } = useApp();
  const user = getUser(state, userId);
  const isMe = userId === CURRENT_USER_ID;
  return (
    <li className={classNames('voice-user', state.speakingUserIds.includes(userId) && 'is-speaking')} data-user-id={userId}>
      <Avatar user={user} className="tiny" />
      <span className="voice-user-name">{user.displayName}</span>
      {isMe && state.voice.deafened && <Icon name="headphones-off" />}
      {isMe && state.voice.muted && !state.voice.deafened && <Icon name="mic-off" />}
    </li>
  );
}

function ChannelItem({ channel, serverId, isSelected }) {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const voiceUserIds = useVoiceUserIds(channel);

  function handleClick() {
    if (channel.type === 'voice') {
      dispatch({ type: 'joinVoice', channelId: channel.id });
    } else {
      navigate(`/channels/${serverId}/${channel.id}`);
    }
    dispatch({ type: 'setNavOpen', open: false });
  }

  function handleContextMenu(event) {
    event.preventDefault(); // don't show the browser's own menu
    dispatch({ type: 'openMenu', menu: { kind: 'channel', id: channel.id, x: event.clientX, y: event.clientY } });
  }

  return (
    <li className={classNames('channel-item', isSelected && 'is-selected', channel.unread && 'is-unread')}>
      <button className="channel-button" type="button" onClick={handleClick} onContextMenu={handleContextMenu}>
        <Icon name={channel.type === 'voice' ? 'speaker' : 'hash'} />
        <span className="channel-name">{channel.name}</span>
        {channel.mentions > 0 && <span className="channel-mention-badge">{channel.mentions}</span>}
      </button>
      {voiceUserIds.length > 0 && (
        <ul className="voice-users">
          {voiceUserIds.map((userId) => (
            <VoiceUser key={userId} userId={userId} />
          ))}
        </ul>
      )}
    </li>
  );
}

function Category({ category, serverId, activeChannelId }) {
  const { state, dispatch } = useApp();
  const isCollapsed = state.collapsedCategoryIds.includes(category.id);

  // A collapsed category still shows the selected channel and busy voice channels.
  const visibleChannels = category.channels.filter((channel) => {
    const isBusyVoice = channel.type === 'voice' && (channel.voiceUserIds.length > 0 || state.voice.channelId === channel.id);
    return !isCollapsed || channel.id === activeChannelId || isBusyVoice;
  });

  return (
    <section className={classNames('category', isCollapsed && 'is-collapsed')}>
      <h3>
        <button
          className="category-toggle"
          type="button"
          aria-expanded={!isCollapsed}
          onClick={() => dispatch({ type: 'toggleCategory', categoryId: category.id })}
        >
          <Icon name="chevron-down" />
          {category.name}
        </button>
      </h3>
      <ul>
        {visibleChannels.map((channel) => (
          <ChannelItem key={channel.id} channel={channel} serverId={serverId} isSelected={channel.id === activeChannelId} />
        ))}
      </ul>
    </section>
  );
}

export function ChannelList({ server, activeChannelId }) {
  return (
    <nav className="channel-list scroller" id="channel-list" aria-label="Channel list">
      {server.categories.map((category) => (
        <Category key={category.id} category={category} serverId={server.id} activeChannelId={activeChannelId} />
      ))}
    </nav>
  );
}
```
:::

### Step 8 — User panel: toggle buttons and your own ring

In `UserPanel.jsx`:

1. Import `classNames`.
2. Add a tiny `ToggleButton` component (an icon button with `aria-pressed`).
3. Read `{ muted, deafened }` from `state.voice`, replace the two static buttons with `<ToggleButton>`s that dispatch `toggleMute` / `toggleDeafen`, and change their icon and label according to the state.
4. Add `is-speaking` to the profile button when you're in `speakingUserIds`.

::: solution
```jsx [react-app/src/components/UserPanel.jsx]
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
```
:::

### Step 9 — Context menu: Join Voice

In `ContextMenu.jsx`, the `channel` branch of `useMenuItems` now offers **Join Voice** for voice channels and **Mark As Read** for text channels.

::: solution
```jsx [react-app/src/components/ContextMenu.jsx]
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
```
:::

## ✅ Checkpoint

- [ ] No red errors in the Console.
- [ ] Click **Lounge**: a Voice Connected panel appears with `Lounge / Frontend Friends`, and Sam (you) is listed under Lounge.
- [ ] Within a second, green rings flicker around Ava and Priya (the people already in Lounge). Switch to **Pair Programming**: the panel updates, and you move channels.
- [ ] Click the microphone button: it changes to the muted icon and its label to **Unmute**; a small muted icon appears next to your name in the voice list. Click the headphones: both mute and deafen show. Click the microphone again: both are cleared.
- [ ] Right-click a voice channel: the menu offers **Join Voice**.
- [ ] Click Disconnect (the icon on the panel): the panel disappears and you leave the list.
- [ ] Optional: connect, tick **Light up when I talk (uses my mic)**, allow the microphone, and talk: your ring lights up. Untick it or disconnect: the browser's recording indicator goes away.
- [ ] In DevTools → **Network**, nothing is sent while the mic is on (the sound stays in your browser).
- [ ] Reload the page: you are disconnected (voice state isn't saved).

## 🐛 Common mistakes

**The rings flicker twice as fast, or the CPU fan spins up after a while.** A timer isn't cleaned up, so several run at once. Check the `clearInterval(timer)` in the cleanup, and that the effect has a dependency array.

**`Failed to resolve import "../lib/mic.js"`.** `VoicePanel` imports the hook, which imports `mic.js`. Create the file (Step 4) even if you never use the mic.

**The mic indicator stays on after unticking.** The cleanup in `useMicSpeaking` must call `stopMic()`, which stops every track. Check that the effect really returns the cleanup function (`return () => {…}`).

**Mute and deafen get out of sync.** You edited only one of the cases. Deafen sets `muted` to the same value as `deafened`; un-muting always clears `deafened`.

**"Rendered fewer hooks than expected" or similar hooks error.** A hook was called after a condition or early `return`. In `VoicePanel`, all hooks run before the `channel`/`server` lookups; those lookups are plain expressions, not hooks.

**Clicking a voice channel changes the URL or leaves the old channel on screen.** Voice channels don't navigate; only `joinVoice` is dispatched. The text channel you were reading stays open on purpose.

## 📝 Quiz

::: quiz
What makes a function a custom hook?

- [ ] It is exported from a file in a folder named `hooks`
- [x] Its name starts with `use` and it calls other hooks
- [ ] It returns JSX
- [ ] It is wrapped in `useEffect`

> It's only a naming convention plus the rules of hooks. The folder name is just organization, and a hook does not need to return JSX.
:::

::: quiz
Predict what happens:

```jsx
useEffect(() => {
  const timer = setInterval(() => console.log('tick'), 400);
}, []);
```

(no cleanup). You open a page that renders this component in development, with `<StrictMode>`, then it is removed from the page. What happens?

- [ ] The interval stops when the component is removed
- [x] The interval keeps running (two of them, after StrictMode's extra setup) even after the component is gone
- [ ] React throws an error about the missing cleanup
- [ ] Only one interval runs, because StrictMode removes duplicates

> Starting a timer is a side effect; only the returned cleanup can stop it. Without `return () => clearInterval(timer)`, nothing does.
:::

::: quiz
The speaking simulation dispatches a new array every 400 ms and so re-renders much of the app. Why is it acceptable in this app?

- [ ] Because React never re-renders on `dispatch`
- [ ] Because `useEffect` prevents re-rendering
- [x] Because re-rendering only re-runs small component functions, React updates just the DOM nodes that differ (a class name), and 400 ms is slow
- [ ] Because rings are drawn by the browser, not React

> The cost is calling cheap functions and comparing their output; the DOM changes are tiny. It would deserve optimizing in a much larger app or with much faster updates.
:::

## 💾 Commit

```sh
git add .
git commit -m "Add voice channels UI, mute/deafen and speaking rings with custom hooks"
git push
```
