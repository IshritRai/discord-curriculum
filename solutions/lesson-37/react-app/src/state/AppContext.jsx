// One place that owns the app's state, shared with every component through Context.

import { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { reducer, createInitialState } from './reducer.js';
import { save } from './storage.js';
import users from '../data/users.json';
import servers from '../data/servers.json';
import messages from '../data/messages.json';
import chatter from '../data/chatter.json';

const initialData = { users, servers, messages, chatter };

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // createInitialState runs once, to build the first state (from localStorage or the JSON files).
  const [state, dispatch] = useReducer(reducer, initialData, createInitialState);

  // Timers need the *latest* state, not the state from when they were started.
  // A ref is a box whose .current value survives re-renders without causing one.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });

  // Save the data whenever it changes (not on every UI change).
  useEffect(() => {
    save(state);
  }, [state.users, state.servers, state.messages, state.activeChannelByServer, state.collapsedCategoryIds]);

  const value = { state, dispatch, getState: () => stateRef.current };
  return <AppContext value={value}>{children}</AppContext>;
}

// Any component gets the state and dispatch with: const { state, dispatch } = useApp();
export function useApp() {
  return useContext(AppContext);
}
