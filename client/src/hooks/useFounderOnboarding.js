import { useContext } from 'react';
import { FounderOnboardingContext } from '../context/FounderOnboardingContext';

export function useFounderOnboarding() {
  return useContext(FounderOnboardingContext);
}
