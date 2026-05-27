import { createContext } from 'react';

export const FounderOnboardingContext = createContext({
  loading: false,
  beginnerPhaseActive: false,
  metrics: null,
  tasks: [],
  nextTask: null,
  completedCount: 0,
  setupComplete: false,
  progressPercent: 0,
  refreshFounderOnboarding: async () => null
});
