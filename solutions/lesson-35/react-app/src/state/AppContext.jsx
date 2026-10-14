// One place that owns the app's state, shared with every component through Context.

import { createContext, useContext, useReducer } from 'react';
import { reducer, createInitialState } from './reducer.js';
import users from '../data/users.json';
import servers from '../data/servers.json';
import messages from '../data/messages.json';

const initialData = { users, servers, messages };

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // createInitialState(initialData) runs once, to build the first state.
  const [state, dispatch] = useReducer(reducer, initialData, createInitialState);
  return <AppContext value={{ state, dispatch }}>{children}</AppContext>;
}

// Any component gets the state and dispatch with: const { state, dispatch } = useApp();
export function useApp() {
  return useContext(AppContext);
}
