import { useEffect } from 'react';
import { useApp } from '../state/AppContext.jsx';
import { startSimulation } from '../lib/simulation.js';

// Starts the fake chat activity when the app appears, and stops it if it goes away.
export function useSimulation() {
  const { dispatch, getState } = useApp();
  useEffect(() => {
    const stop = startSimulation(getState, dispatch);
    return stop; // React calls this cleanup when the component unmounts
    // getState always reads the latest state, so the effect only needs to run once.
  }, [dispatch]);
}
