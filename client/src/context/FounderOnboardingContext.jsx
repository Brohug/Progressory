import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { FounderOnboardingContext } from './FounderOnboardingContext';
import { getFounderOnboardingSummary } from '../utils/founderOnboarding';

const buildAttendanceSummary = async (classes, members) => {
  if (!Array.isArray(classes) || classes.length === 0) {
    return 0;
  }

  const attendanceResponses = await Promise.all(
    classes.map(async (classItem) => {
      const response = await api.get(`/classes/${classItem.id}/members`);
      return {
        classItem,
        recordedMembers: response.data
      };
    })
  );

  const getEligibleMembersForClass = (classItem) => {
    const activeMembers = members.filter((member) => member.is_active);

    if (!classItem.program_id) {
      return activeMembers;
    }

    const matchingMembers = activeMembers.filter((member) => (
      member.program_id === null ||
      String(member.program_id) === String(classItem.program_id)
    ));

    return matchingMembers.length > 0 ? matchingMembers : activeMembers;
  };

  return attendanceResponses.filter(({ classItem, recordedMembers }) => {
    const eligibleMembers = getEligibleMembersForClass(classItem);

    if (eligibleMembers.length === 0) {
      return false;
    }

    return recordedMembers.length > 0;
  }).length;
};

export function FounderOnboardingProvider({ children }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [dismissedCompletionKey, setDismissedCompletionKey] = useState('');

  const isManagement = user?.role === 'owner' || user?.role === 'admin';
  const shouldTrackOnboarding = isManagement && !user?.is_platform_admin;
  const completionStorageKey = user?.id ? `progressory-founder-beginner-complete-v1-${user.id}` : '';

  const refreshFounderOnboarding = useCallback(async () => {
    if (!shouldTrackOnboarding) {
      setMetrics(null);
      return null;
    }

    setLoading(true);

    try {
      const [topicsRes, membersRes, plannedClassesRes, classesRes] = await Promise.all([
        api.get('/topics'),
        api.get('/members'),
        api.get('/planned-classes'),
        api.get('/classes')
      ]);

      const nextMetrics = {
        topicsCount: topicsRes.data.length,
        activeMemberCount: membersRes.data.filter((member) => member.is_active).length,
        plannedClassesCount: plannedClassesRes.data.length,
        classesCount: classesRes.data.length,
        classesWithAttendance: await buildAttendanceSummary(classesRes.data, membersRes.data)
      };

      setMetrics(nextMetrics);
      return {
        metrics: nextMetrics,
        ...getFounderOnboardingSummary(nextMetrics)
      };
    } finally {
      setLoading(false);
    }
  }, [shouldTrackOnboarding]);

  useEffect(() => {
    refreshFounderOnboarding().catch((error) => {
      console.error('Refresh founder onboarding error:', error);
    });
  }, [refreshFounderOnboarding]);

  useEffect(() => {
    if (!completionStorageKey || typeof window === 'undefined') {
      setDismissedCompletionKey('');
      return;
    }

    setDismissedCompletionKey(window.localStorage.getItem(completionStorageKey) || '');
  }, [completionStorageKey]);

  const summary = useMemo(
    () => getFounderOnboardingSummary(metrics || {}),
    [metrics]
  );

  useEffect(() => {
    if (!completionStorageKey || typeof window === 'undefined' || !summary.setupComplete) {
      return;
    }

    window.localStorage.setItem(completionStorageKey, 'true');
    setDismissedCompletionKey('true');
  }, [completionStorageKey, summary.setupComplete]);

  const beginnerPhaseActive = shouldTrackOnboarding
    && !summary.setupComplete
    && dismissedCompletionKey !== 'true';

  const value = useMemo(() => ({
    loading,
    beginnerPhaseActive,
    metrics,
    tasks: summary.tasks,
    nextTask: summary.nextTask,
    completedCount: summary.completedCount,
    setupComplete: summary.setupComplete,
    progressPercent: summary.progressPercent,
    refreshFounderOnboarding
  }), [
    beginnerPhaseActive,
    loading,
    metrics,
    refreshFounderOnboarding,
    summary.completedCount,
    summary.nextTask,
    summary.progressPercent,
    summary.setupComplete,
    summary.tasks
  ]);

  return (
    <FounderOnboardingContext.Provider value={value}>
      {children}
    </FounderOnboardingContext.Provider>
  );
}
