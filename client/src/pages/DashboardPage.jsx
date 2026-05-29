import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import AppIcon from '../components/AppIcon';
import Layout from '../components/Layout';
import ExpandableSection from '../components/ExpandableSection';
import curriculumIndexSeed from '../data/curriculumIndexSeed';
import { findRelatedSetupFamilies } from '../data/entrySetupFamilies';
import { useAuth } from '../hooks/useAuth';
import { useFounderOnboarding } from '../hooks/useFounderOnboarding';
import { formatLabel } from '../utils/formatLabel';

const DASHBOARD_FEEDBACK_EMAIL = 'owner.progressory@gmail.com';
const normalizeValue = (value) => (
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
);

const getLocalIsoDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    tasks: setupTasks,
    nextTask: nextSetupTask,
    completedCount: completedSetupCount,
    setupComplete,
    progressPercent: setupProgressPercent
  } = useFounderOnboarding();
  const isMember = user?.role === 'member';
  const isManagement = user?.role === 'owner' || user?.role === 'admin';
  const [searchParams, setSearchParams] = useSearchParams();
  const onboardingCompleteBannerRef = useRef(null);
  const [recentClasses, setRecentClasses] = useState([]);
  const [recentTopicSignals, setRecentTopicSignals] = useState([]);
  const [neglectedTopics, setNeglectedTopics] = useState([]);
  const [topicCoverage, setTopicCoverage] = useState([]);
  const [trainingMethodUsage, setTrainingMethodUsage] = useState([]);
  const [classes, setClasses] = useState([]);
  const [plannedClasses, setPlannedClasses] = useState([]);
  const [libraryEntries, setLibraryEntries] = useState([]);
  const [memberProgress, setMemberProgress] = useState([]);
  const [attendanceSnapshot, setAttendanceSnapshot] = useState({
    classesNeedingAttendance: 0,
    classesWithAttendance: 0
  });
  const [tutorialState, setTutorialState] = useState('prompt');
  const [isMinimizedTutorialExpanded, setIsMinimizedTutorialExpanded] = useState(false);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
  const [hideSetupChecklist, setHideSetupChecklist] = useState(false);
  const [showOnboardingCompleteBanner, setShowOnboardingCompleteBanner] = useState(
    searchParams.get('onboardingComplete') === '1'
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const tutorialStorageKey = user?.id ? `progressory-dashboard-tutorial-state-v8-${user.id}` : '';
  const setupStorageKey = user?.id ? `progressory-dashboard-setup-hidden-v2-${user.id}` : '';
  const onboardingCompleteStorageKey = user?.id ? `progressory-founder-onboarding-complete-v1-${user.id}` : '';

  const loadDashboardData = useCallback(async () => {
    if (isMember) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const [
        recentClassesRes,
        recentTopicSignalsRes,
        neglectedTopicsRes,
        topicCoverageRes,
        trainingMethodUsageRes,
        classesRes,
        plannedClassesRes,
        libraryEntriesRes,
        membersRes
      ] = await Promise.all([
        api.get('/reports/recent-classes?limit=5'),
        api.get('/reports/recent-topic-signals?limit=12'),
        api.get('/reports/neglected-topics?days=30'),
        api.get('/reports/topic-coverage'),
        api.get('/reports/training-method-usage'),
        api.get('/classes'),
        api.get('/planned-classes'),
        api.get('/library'),
        api.get('/members')
      ]);

      const allClasses = classesRes.data;
      const allMembers = membersRes.data;
      const attendanceResponses = await Promise.all(
        allClasses.map(async (classItem) => {
          const response = await api.get(`/classes/${classItem.id}/members`);
          return {
            classItem,
            recordedMembers: response.data
          };
        })
      );

      const getEligibleMembersForClass = (classItem) => {
        const activeMembers = allMembers.filter((member) => member.is_active);

        if (!classItem.program_id) {
          return activeMembers;
        }

        const matchingMembers = activeMembers.filter((member) => (
          member.program_id === null ||
          String(member.program_id) === String(classItem.program_id)
        ));

        return matchingMembers.length > 0 ? matchingMembers : activeMembers;
      };

      const classesNeedingAttendance = attendanceResponses.filter(({ classItem, recordedMembers }) => {
        const eligibleMembers = getEligibleMembersForClass(classItem);

        if (eligibleMembers.length === 0) {
          return false;
        }

        return recordedMembers.length < eligibleMembers.length;
      }).length;

      const classesWithAttendance = attendanceResponses.filter(({ recordedMembers }) => recordedMembers.length > 0).length;

      setRecentClasses(recentClassesRes.data);
      setRecentTopicSignals(recentTopicSignalsRes.data);
      setNeglectedTopics(neglectedTopicsRes.data);
      setTopicCoverage(topicCoverageRes.data);
      setTrainingMethodUsage(trainingMethodUsageRes.data);
      setClasses(allClasses);
      setPlannedClasses(plannedClassesRes.data);
      setLibraryEntries(libraryEntriesRes.data);
      setAttendanceSnapshot({
        classesNeedingAttendance,
        classesWithAttendance
      });
    } catch (err) {
      console.error('Load dashboard error:', err);
      setError(err.response?.data?.message || 'Couldn\'t load the dashboard right now.');
    } finally {
      setLoading(false);
    }
  }, [isMember]);

  useEffect(() => {
    if (!isMember) {
      loadDashboardData();
    }
  }, [isMember, loadDashboardData]);

  const todayIsoDate = getLocalIsoDate();
  const todayClassCount = classes.filter((classItem) => classItem.class_date === todayIsoDate).length;
  const todayPlannedCount = plannedClasses.filter((classItem) => classItem.class_date === todayIsoDate).length;
  const activeLibraryVideoCount = libraryEntries.filter((entry) => entry.is_active && entry.video_url).length;
  const memberReadyLibraryEntries = libraryEntries.filter((entry) => (
    entry.is_active && (entry.visibility === 'members' || entry.visibility === 'members_and_parents')
  ));

  const upcomingSetupTasks = nextSetupTask
    ? setupTasks.filter((task) => !task.complete && task.key !== nextSetupTask.key).slice(0, 3)
    : [];

  const recentTopicSignalGroups = useMemo(() => {
    const seenTopicIds = new Set();

    return recentTopicSignals.filter((item) => {
      const topicId = Number(item.topic_id);
      if (seenTopicIds.has(topicId)) {
        return false;
      }

      seenTopicIds.add(topicId);
      return true;
    });
  }, [recentTopicSignals]);

  const curriculumSeedByName = useMemo(() => (
    new Map(curriculumIndexSeed.map((entry) => [normalizeValue(entry.name), entry]))
  ), []);

  const existingTopicTitles = useMemo(() => (
    new Set(topicCoverage.map((item) => normalizeValue(item.topic_title)))
  ), [topicCoverage]);

  const managementWeeklyWinCards = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const classesLoggedThisWeek = classes.filter((classItem) => {
      const classDate = classItem.class_date ? new Date(classItem.class_date) : null;
      return classDate && !Number.isNaN(classDate.getTime()) && classDate >= sevenDaysAgo;
    }).length;

    const topicsInRotation = topicCoverage.filter((item) => Number(item.total_times_used || 0) > 0).length;
    const memberReviewResources = memberReadyLibraryEntries.length;

    return [
      { label: 'Classes logged this week', value: classesLoggedThisWeek },
      { label: 'Topics in rotation', value: topicsInRotation },
      { label: 'Member review resources', value: memberReviewResources },
      { label: 'Attendance completed', value: attendanceSnapshot.classesWithAttendance }
    ];
  }, [attendanceSnapshot.classesWithAttendance, classes, memberReadyLibraryEntries.length, topicCoverage]);

  const recentlyTaughtTopics = useMemo(() => (
    recentTopicSignalGroups.slice(0, 4)
  ), [recentTopicSignalGroups]);

  const topicsNotTaughtRecently = useMemo(() => (
    neglectedTopics.slice(0, 4)
  ), [neglectedTopics]);

  const suggestedNextTopics = useMemo(() => {
    if (recentTopicSignalGroups.length === 0 || topicCoverage.length === 0) {
      return [];
    }

    const relationshipDetails = new Map();

    recentTopicSignalGroups.forEach((recentTopic, index) => {
      const seedEntry = curriculumSeedByName.get(normalizeValue(recentTopic.topic_title));
      if (!seedEntry) {
        return;
      }

      [
        ['commonFollowUps', 'Natural follow-up'],
        ['commonTransitions', 'Natural transition'],
        ['commonAttacks', 'Natural attack'],
        ['relatedPositions', 'Close positional neighbor']
      ].forEach(([key, label]) => {
        (seedEntry[key] || []).forEach((relatedName) => {
          const normalizedName = normalizeValue(relatedName);
          if (!normalizedName) {
            return;
          }

          const existing = relationshipDetails.get(normalizedName) || {
            score: 0,
            reasons: new Set(),
            recentTopics: new Set(),
            sourceIndex: Number.POSITIVE_INFINITY
          };

          existing.score += index === 0 ? 4 : 3;
          existing.reasons.add(label);
          existing.recentTopics.add(recentTopic.topic_title);
          existing.sourceIndex = Math.min(existing.sourceIndex, index);
          relationshipDetails.set(normalizedName, existing);
        });
      });
    });

    return topicCoverage
      .filter((item) => !recentTopicSignalGroups.some((signal) => Number(signal.topic_id) === Number(item.topic_id)))
      .map((item) => {
        const relationshipMatch = relationshipDetails.get(normalizeValue(item.topic_title));
        const totalUses = Number(item.total_times_used || 0);
        let score = relationshipMatch?.score || 0;
        const reasons = relationshipMatch ? Array.from(relationshipMatch.reasons) : [];

        if (topicsNotTaughtRecently.some((topic) => Number(topic.topic_id) === Number(item.topic_id))) {
          score += 3;
          reasons.push('Not used recently');
        }

        if (totalUses <= 1) {
          score += 2;
          reasons.push(totalUses === 0 ? 'Still unused in class logs' : 'Only used once so far');
        }

        return {
          ...item,
          score,
          reasons: [...new Set(reasons)],
          recentSources: relationshipMatch ? Array.from(relationshipMatch.recentTopics) : []
        };
      })
      .filter((item) => item.score > 0)
      .sort((left, right) => {
        if (right.score !== left.score) return right.score - left.score;
        return Number(left.total_times_used || 0) - Number(right.total_times_used || 0);
      })
      .slice(0, 4);
  }, [curriculumSeedByName, recentTopicSignalGroups, topicCoverage, topicsNotTaughtRecently]);

  const suggestedFollowUps = useMemo(() => {
    const lastTopic = recentTopicSignalGroups[0];
    if (!lastTopic) {
      return [];
    }

    const seedEntry = curriculumSeedByName.get(normalizeValue(lastTopic.topic_title));
    if (!seedEntry) {
      return [];
    }

    const followUpNames = [
      ...(seedEntry.commonFollowUps || []),
      ...(seedEntry.commonTransitions || []),
      ...(seedEntry.commonAttacks || [])
    ];

    return followUpNames
      .map((name) => {
        const existingCoverage = topicCoverage.find((item) => normalizeValue(item.topic_title) === normalizeValue(name));
        return {
          name,
          existsInGym: Boolean(existingCoverage || existingTopicTitles.has(normalizeValue(name))),
          sourceTopic: lastTopic.topic_title
        };
      })
      .filter((item, index, array) => array.findIndex((candidate) => normalizeValue(candidate.name) === normalizeValue(item.name)) === index)
      .slice(0, 4);
  }, [curriculumSeedByName, existingTopicTitles, recentTopicSignalGroups, topicCoverage]);

  const dashboardNextMoveCards = useMemo(() => {
    const cards = [];
    const latestClass = recentClasses[0] || null;
    const nextTopic = suggestedNextTopics[0] || null;
    const nextFollowUp = suggestedFollowUps[0] || null;
    const latestMemberResource = memberReadyLibraryEntries[0] || null;

    if (latestClass) {
      cards.push({
        title: 'Recently taught',
        eyebrow: 'What changed since last class',
        body: `${latestClass.title || 'Untitled Class'} was the latest logged class. Use it to plan the cleanest follow-up instead of guessing from memory.`,
        primaryLabel: 'Open class log',
        primaryTo: `/classes?openClassId=${latestClass.id}`,
        secondaryLabel: 'Plan follow-up',
        secondaryTo: '/planned-classes?action=create'
      });
    }

    if (nextTopic) {
      cards.push({
        title: 'Suggested next topic to teach',
        eyebrow: 'Next best move',
        body: `${nextTopic.topic_title} keeps the sequence moving naturally${nextTopic.reasons.length ? ` because it is a ${nextTopic.reasons[0].toLowerCase()}` : ''}.`,
        primaryLabel: 'Open topic',
        primaryTo: `/topics?topicId=${nextTopic.topic_id}`,
        secondaryLabel: 'Plan this class',
        secondaryTo: `/planned-classes?openForm=1&reportTopicId=${nextTopic.topic_id}&reportTopicTitle=${encodeURIComponent(nextTopic.topic_title)}`
      });
    }

    if (nextFollowUp) {
      cards.push({
        title: 'Suggested follow-up after the last class',
        eyebrow: 'Bridge to the next session',
        body: `${nextFollowUp.name} is a clean next branch after ${nextFollowUp.sourceTopic}.`,
        primaryLabel: 'Study in Tree',
        primaryTo: `/decision-tree?search=${encodeURIComponent(nextFollowUp.name)}`,
        secondaryLabel: nextFollowUp.existsInGym ? 'Open Curriculum' : 'Add topic',
        secondaryTo: nextFollowUp.existsInGym
          ? `/index?search=${encodeURIComponent(nextFollowUp.name)}`
          : `/topics?action=create&suggestedTitle=${encodeURIComponent(nextFollowUp.name)}`
      });
    }

    if (latestMemberResource) {
      cards.push({
        title: 'Member-ready review resource',
        eyebrow: 'Library payoff',
        body: `${latestMemberResource.title} is already ready for members, so coaches can point people back to it after class.`,
        primaryLabel: 'Open Library',
        primaryTo: '/library',
        secondaryLabel: 'Open resource',
        secondaryTo: latestMemberResource.video_url || '/library'
      });
    }

    return cards.slice(0, 4);
  }, [memberReadyLibraryEntries, recentClasses, suggestedFollowUps, suggestedNextTopics]);

  const recentSetupFamilySuggestions = useMemo(() => {
    const titles = recentTopicSignalGroups.map((item) => item.topic_title);
    return titles
      .flatMap((title) => findRelatedSetupFamilies(title))
      .filter((family, index, array) => array.findIndex((candidate) => candidate.title === family.title) === index)
      .slice(0, 3);
  }, [recentTopicSignalGroups]);

  const tutorialSteps = useMemo(() => {
    const steps = [
      {
        key: 'dashboard-quick-actions',
        title: 'Quick Actions',
        description: 'Start here when you already know the coaching job you need to handle right now.'
      },
      {
        key: 'dashboard-coaching-queue',
        title: 'Today',
        description: 'Use this to spot the classes or library items that still need follow-through.'
      },
      {
        key: 'dashboard-start-here',
        title: 'Start Here',
        description: 'This checklist is the founder week-one flow: set up the minimum, then get one real gym workflow moving.'
      }
    ];

    if (setupComplete) {
      steps.push({
        key: 'dashboard-helpful-extras',
        title: 'Helpful Extras',
        description: 'Once the gym is already flowing, add videos and other deeper support tools here.'
      });
    }

    return steps;
  }, [setupComplete]);

  const activeTutorialStep = tutorialSteps[currentTutorialStep] || null;
  const isTutorialActive = tutorialState === 'active';

  useEffect(() => {
    if (!tutorialStorageKey || typeof window === 'undefined') {
      return;
    }

    const storedState = window.localStorage.getItem(tutorialStorageKey);
    setTutorialState(storedState || 'prompt');
  }, [tutorialStorageKey]);

  useEffect(() => {
    if (!setupStorageKey || typeof window === 'undefined') {
      return;
    }

    const storedHidden = window.localStorage.getItem(setupStorageKey) === 'true';
    setHideSetupChecklist(storedHidden);
  }, [setupStorageKey]);

  useEffect(() => {
    if (setupComplete) {
      setHideSetupChecklist(true);
      if (setupStorageKey && typeof window !== 'undefined') {
        window.localStorage.setItem(setupStorageKey, 'true');
      }
      return;
    }

    if (!setupComplete) {
      setHideSetupChecklist(false);
      if (setupStorageKey && typeof window !== 'undefined') {
        window.localStorage.removeItem(setupStorageKey);
      }
    }
  }, [setupComplete, setupStorageKey]);

  useEffect(() => {
    const shouldShowFromParams = searchParams.get('onboardingComplete') === '1';
    const shouldShowFromStorage = (
      onboardingCompleteStorageKey
      && typeof window !== 'undefined'
      && window.sessionStorage.getItem(onboardingCompleteStorageKey) === 'true'
    );
    const shouldShowCompletion = shouldShowFromParams || shouldShowFromStorage;
    setShowOnboardingCompleteBanner(shouldShowCompletion);
  }, [onboardingCompleteStorageKey, searchParams]);

  useEffect(() => {
    if (!showOnboardingCompleteBanner) {
      return;
    }

    window.setTimeout(() => {
      const target = onboardingCompleteBannerRef.current;

      if (!target) {
        return;
      }

      const targetTop = target.getBoundingClientRect().top + window.scrollY - 112;
      window.scrollTo({
        top: Math.max(targetTop, 0),
        behavior: 'smooth'
      });
    }, 120);
  }, [showOnboardingCompleteBanner]);

  useEffect(() => {
    if (!isTutorialActive || !activeTutorialStep || typeof window === 'undefined') {
      return;
    }

    const element = window.document.getElementById(activeTutorialStep.key);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeTutorialStep, isTutorialActive]);

  const persistTutorialState = (nextState) => {
    setTutorialState(nextState);
    if (tutorialStorageKey && typeof window !== 'undefined') {
      window.localStorage.setItem(tutorialStorageKey, nextState);
    }
  };

  const handleShowSetupChecklist = () => {
    setHideSetupChecklist(false);
    if (setupStorageKey && typeof window !== 'undefined') {
      window.localStorage.removeItem(setupStorageKey);
    }
  };

  const handleHideSetupChecklist = () => {
    setHideSetupChecklist(true);
    if (setupStorageKey && typeof window !== 'undefined') {
      window.localStorage.setItem(setupStorageKey, 'true');
    }
  };

  const handleDismissOnboardingCompleteBanner = () => {
    setShowOnboardingCompleteBanner(false);
    if (onboardingCompleteStorageKey && typeof window !== 'undefined') {
      window.sessionStorage.removeItem(onboardingCompleteStorageKey);
    }
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('onboardingComplete');
    setSearchParams(nextParams, { replace: true });
  };

  const startTutorial = () => {
    handleShowSetupChecklist();
    setIsMinimizedTutorialExpanded(false);
    setCurrentTutorialStep(0);
    persistTutorialState('active');
  };

  const minimizeTutorial = () => {
    setIsMinimizedTutorialExpanded(false);
    persistTutorialState(setupComplete ? 'completed' : 'minimized');
  };

  const advanceTutorial = () => {
    if (currentTutorialStep >= tutorialSteps.length - 1) {
      persistTutorialState('completed');
      return;
    }

    setCurrentTutorialStep((prev) => prev + 1);
  };

  const rewindTutorial = () => {
    setCurrentTutorialStep((prev) => Math.max(prev - 1, 0));
  };

  const expandMinimizedTutorial = () => {
    setIsMinimizedTutorialExpanded(true);
  };

  const collapseMinimizedTutorial = () => {
    setIsMinimizedTutorialExpanded(false);
  };

  const getTutorialSectionClass = (sectionKey) => {
    if (!isTutorialActive) {
      return '';
    }

    return activeTutorialStep?.key === sectionKey
      ? ' dashboard-tutorial-highlight'
      : ' dashboard-tutorial-dimmed';
  };

  const helpfulExtras = [
    {
      key: 'libraryVideos',
      icon: 'library',
      title: 'Add videos to your Library',
      description: 'Save coach notes, video links, and member-facing references so people can revisit what they learned.',
      helper: activeLibraryVideoCount > 0
        ? `${activeLibraryVideoCount} video resource${activeLibraryVideoCount === 1 ? '' : 's'} already linked.`
        : 'This is a strong next step once your classes, topics, scenarios, members, and attendance are already flowing.',
      to: '/library',
      cta: 'Open Library',
      complete: activeLibraryVideoCount > 0
    },
    {
      key: 'setupStudy',
      icon: 'trees',
      title: 'Explore setups and sequences',
      description: 'Learn a new setup, follow a sequence, and see how opponents can respond before the next class.',
      helper: 'Use Entry Setups when you want positional starter ideas, then continue the branch in Decision Trees.',
      to: '/entry-setups',
      cta: 'Open Entry Setups',
      complete: false
    }
  ];

  const memberVisibleLibraryEntries = libraryEntries.filter(
    (entry) => entry.is_active && (entry.visibility === 'members' || entry.visibility === 'members_and_parents')
  );
  const upcomingMemberClasses = plannedClasses
    .filter((item) => item.status === 'planned')
    .sort((a, b) => {
      const left = `${a.class_date || ''} ${a.start_time || '00:00:00'}`;
      const right = `${b.class_date || ''} ${b.start_time || '00:00:00'}`;
      return left.localeCompare(right);
    });
  const nextPlannedClass = upcomingMemberClasses[0] || null;
  const recentMemberLibraryEntries = [...memberVisibleLibraryEntries]
    .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
    .slice(0, 3);

  const memberSummaryCards = [
    { label: 'Upcoming planned classes', value: upcomingMemberClasses.length },
    { label: 'Library resources', value: memberVisibleLibraryEntries.length },
    { label: 'Tracked topics', value: memberProgress.length },
    {
      label: 'Competent topics',
      value: memberProgress.filter((item) => item.status === 'competent').length
    }
  ];

  const memberRecentProgress = useMemo(() => (
    [...memberProgress]
      .sort((a, b) => new Date(b.updated_at || b.last_reviewed_at || 0) - new Date(a.updated_at || a.last_reviewed_at || 0))
      .slice(0, 4)
  ), [memberProgress]);

  const memberSuggestedReview = useMemo(() => (
    memberProgress
      .filter((item) => item.status !== 'competent')
      .sort((a, b) => new Date(b.updated_at || b.last_reviewed_at || 0) - new Date(a.updated_at || a.last_reviewed_at || 0))
      .slice(0, 3)
  ), [memberProgress]);

  const memberVisibleWins = useMemo(() => {
    const statusCounts = memberProgress.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    return [
      { label: 'Topics introduced', value: statusCounts.introduced || 0 },
      { label: 'Topics developing', value: statusCounts.developing || 0 },
      { label: 'Topics competent', value: statusCounts.competent || 0 },
      { label: 'Resources ready to review', value: recentMemberLibraryEntries.length }
    ];
  }, [memberProgress, recentMemberLibraryEntries.length]);

  const memberNextStudyPath = useMemo(() => {
    const focusTopic = memberSuggestedReview[0] || memberRecentProgress[0] || null;
    if (!focusTopic) {
      return null;
    }

    const seedEntry = curriculumSeedByName.get(normalizeValue(focusTopic.topic_title));
    const nextBranch = seedEntry?.commonFollowUps?.[0] || seedEntry?.commonTransitions?.[0] || seedEntry?.commonAttacks?.[0] || '';

    return {
      topicTitle: focusTopic.topic_title,
      topicType: focusTopic.topic_type,
      status: focusTopic.status,
      nextBranch
    };
  }, [curriculumSeedByName, memberRecentProgress, memberSuggestedReview]);

  const memberFollowThroughCards = useMemo(() => {
    const cards = [];
    const latestProgressItem = memberRecentProgress[0] || null;
    const latestSharedResource = recentMemberLibraryEntries[0] || null;

    if (latestProgressItem) {
      cards.push({
        title: `Reopen ${latestProgressItem.topic_title}`,
        body: `Your last tracked update was ${formatLabel(latestProgressItem.status)}. Open the topic again, check the bigger map, or follow the next branch while it is still fresh.`,
        primaryLabel: 'Open my progress',
        primaryTo: '/my-progress',
        secondaryLabel: 'Open Curriculum',
        secondaryTo: `/index?search=${encodeURIComponent(latestProgressItem.topic_title)}&source=dashboard`
      });
    }

    if (memberNextStudyPath) {
      cards.push({
        title: memberNextStudyPath.nextBranch
          ? `Next branch: ${memberNextStudyPath.nextBranch}`
          : `Keep building ${memberNextStudyPath.topicTitle}`,
        body: memberNextStudyPath.nextBranch
          ? `${memberNextStudyPath.nextBranch} is the cleanest next study step after ${memberNextStudyPath.topicTitle}.`
          : `Use Decision Trees and Library to keep ${memberNextStudyPath.topicTitle} moving instead of stopping at the last logged update.`,
        primaryLabel: 'Study in Tree',
        primaryTo: `/decision-tree?search=${encodeURIComponent(memberNextStudyPath.topicTitle)}&source=dashboard`,
        secondaryLabel: 'Open Library',
        secondaryTo: `/library?search=${encodeURIComponent(memberNextStudyPath.topicTitle)}&source=dashboard`
      });
    }

    if (latestSharedResource) {
      cards.push({
        title: `Shared resource: ${latestSharedResource.title}`,
        body: 'A coach already shared something you can review right now. Reopen it before the next class instead of waiting until the last minute.',
        primaryLabel: 'Open Library',
        primaryTo: `/library?search=${encodeURIComponent(latestSharedResource.title)}&source=dashboard`,
        secondaryLabel: 'Open classes',
        secondaryTo: '/planned-classes'
      });
    }

    return cards.slice(0, 3);
  }, [memberNextStudyPath, memberRecentProgress, recentMemberLibraryEntries]);

  const staffPageIntro = isManagement
    ? 'New founder gym? Use the setup guide once to get the first real workflow live, then come back to Today and Quick Actions for normal use.'
    : 'Start with today\'s class work, then jump into planning, logs, members, or study support.';

  useEffect(() => {
    if (!isMember) {
      return;
    }

    const loadMemberDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        const [plannedClassesRes, libraryEntriesRes, myProgressRes] = await Promise.all([
          api.get('/planned-classes'),
          api.get('/library'),
          api.get('/me/progress').catch((err) => {
            if (err.response?.status === 404) {
              return { data: { progress: [] } };
            }

            throw err;
          })
        ]);

        setPlannedClasses(plannedClassesRes.data || []);
        setLibraryEntries(libraryEntriesRes.data || []);
        setMemberProgress(myProgressRes.data?.progress || []);
      } catch (err) {
        console.error('Load member dashboard error:', err);
        setError(err.response?.data?.message || 'Couldn\'t load the member dashboard right now.');
      } finally {
        setLoading(false);
      }
    };

    loadMemberDashboardData();
  }, [isMember]);

  if (isMember) {
    return (
      <Layout>
        <div className="dashboard-page">
          <h2 className="page-title">Dashboard</h2>
        <p className="page-intro">
          Use this page to see what is coming up, review your progress, and reopen the study tools that actually help next.
        </p>

          {error && <p className="error-text">{error}</p>}

          {loading ? (
            <p className="empty-state">Loading your dashboard...</p>
          ) : (
            <>
              <section className="stats-grid dashboard-stats-grid">
                {memberSummaryCards.map((card) => (
                  <div key={card.label} className="stat-card">
                    <div className="stat-label">{card.label}</div>
                    <div className="stat-value">{card.value}</div>
                  </div>
                ))}
              </section>

              <section className="page-section dashboard-momentum-section">
                <div className="section-header">
                  <div>
                    <h3>What changed for you</h3>
                    <p className="section-note">A quick pulse on your progress, study wins, and what is ready to review right now.</p>
                  </div>
                </div>
                <div className="dashboard-momentum-grid">
                  {memberVisibleWins.map((card) => (
                    <div key={`member-win-${card.label}`} className="dashboard-momentum-card">
                      <span className="eyebrow">Visible win</span>
                      <strong>{card.label}</strong>
                      <div className="dashboard-momentum-value">{card.value}</div>
                    </div>
                  ))}
                </div>
              </section>

              {memberFollowThroughCards.length > 0 ? (
                <section className="page-section dashboard-recommendation-section">
                  <div className="section-header">
                    <div>
                      <h3>Turn the last update into a next step</h3>
                      <p className="section-note">This is the follow-through layer: take the last thing that moved and turn it into one clear next action.</p>
                    </div>
                  </div>
                  <div className="dashboard-recommendation-grid">
                    {memberFollowThroughCards.map((card) => (
                      <article key={card.title} className="dashboard-next-move-highlight">
                        <div className="dashboard-next-move-copy">
                          <span className="eyebrow">Follow-through</span>
                          <strong>{card.title}</strong>
                          <p className="meta-text">{card.body}</p>
                        </div>
                        <div className="inline-actions">
                          <Link className="secondary-button" to={card.primaryTo}>
                            {card.primaryLabel}
                          </Link>
                          <Link className="secondary-button" to={card.secondaryTo}>
                            {card.secondaryLabel}
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="page-section dashboard-hero-section">
                <div className="section-header">
                  <div>
                  <h3>Today</h3>
                  <p className="section-note">Open the next class, your progress, or the study tool you need right now.</p>
                </div>
              </div>
                <div className="action-grid">
                  <Link to="/planned-classes" className="action-card dashboard-action-card">
                    <span className="dashboard-card-icon"><AppIcon name="planner" /></span>
                    <strong>See upcoming classes</strong>
                    <p className="dashboard-card-copy">Review the classes your gym has planned next.</p>
                    <span className="dashboard-card-cta">Open classes</span>
                  </Link>
                  <Link to="/my-progress" className="action-card dashboard-action-card">
                    <span className="dashboard-card-icon"><AppIcon name="progress" /></span>
                    <strong>Open my progress</strong>
                    <p className="dashboard-card-copy">See the topics your coaches have already logged for you.</p>
                    <span className="dashboard-card-cta">Open progress</span>
                  </Link>
                  <Link to="/library" className="action-card dashboard-action-card">
                    <span className="dashboard-card-icon"><AppIcon name="library" /></span>
                    <strong>Open Library</strong>
                    <p className="dashboard-card-copy">Revisit videos and notes your gym marked as member visible.</p>
                    <span className="dashboard-card-cta">Open Library</span>
                  </Link>
                  <Link to="/decision-tree" className="action-card dashboard-action-card">
                    <span className="dashboard-card-icon"><AppIcon name="trees" /></span>
                    <strong>Use Decision Trees</strong>
                    <p className="dashboard-card-copy">Study routes and options around the positions and topics you are learning.</p>
                    <span className="dashboard-card-cta">Open Decision Trees</span>
                  </Link>
                </div>
              </section>

              <section className="page-section dashboard-recommendation-section">
                <div className="section-header">
                  <div>
                    <h3>Suggested review before next class</h3>
                    <p className="section-note">This keeps the next study step obvious instead of making you hunt around the app.</p>
                  </div>
                </div>
                {memberNextStudyPath ? (
                  <div className="dashboard-next-move-highlight">
                    <div className="dashboard-next-move-copy">
                      <span className="eyebrow">Next study path</span>
                      <strong>
                        {memberNextStudyPath.nextBranch
                          ? `${memberNextStudyPath.topicTitle} -> ${memberNextStudyPath.nextBranch}`
                          : memberNextStudyPath.topicTitle}
                      </strong>
                      <p className="meta-text">
                        Start with {memberNextStudyPath.topicTitle}, then use Curriculum, Library, or Decision Trees to keep moving without guessing what should come next.
                      </p>
                    </div>
                    <div className="inline-actions">
                      <Link className="secondary-button" to={`/index?search=${encodeURIComponent(memberNextStudyPath.topicTitle)}&source=dashboard`}>
                        Open Curriculum
                      </Link>
                      <Link className="secondary-button" to={`/decision-tree?search=${encodeURIComponent(memberNextStudyPath.topicTitle)}&source=dashboard`}>
                        Study in Tree
                      </Link>
                      <Link className="secondary-button" to={`/library?search=${encodeURIComponent(memberNextStudyPath.topicTitle)}&source=dashboard`}>
                        Open Library
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="dashboard-next-move-highlight">
                    <div className="dashboard-next-move-copy">
                      <span className="eyebrow">No study path yet</span>
                      <strong>Your gym has not logged enough member progress yet to suggest a clear next study path.</strong>
                      <p className="meta-text">
                        Library, Curriculum, and Decision Trees are still ready to use. This section gets smarter as coaches log more real progress.
                      </p>
                    </div>
                  </div>
                )}
              </section>

              <section className="page-section dashboard-onboarding-section">
                <div className="section-header">
                  <div>
                    <h3>What to study next</h3>
                    <p className="section-note">Keep this simple: what class is next, what to study, and what resources your coaches already shared.</p>
                  </div>
                </div>
                <div className="dashboard-setup-grid">
                  <div className="dashboard-setup-current">
                    <strong>{nextPlannedClass ? 'Next planned class' : 'No planned classes yet'}</strong>
                    <div className="detail-block">
                      {nextPlannedClass ? (
                        <>
                          <div className="meta-text">
                            {nextPlannedClass.title || 'Planned class'} | {new Date(nextPlannedClass.class_date).toLocaleDateString()}
                          </div>
                          <div className="meta-text">
                            {nextPlannedClass.start_time || 'Time not added'} - {nextPlannedClass.end_time || 'Time not added'}
                          </div>
                          <div className="dashboard-setup-helper">
                            Open Classes to review the notes and linked topics before class.
                          </div>
                        </>
                      ) : (
                        <div className="dashboard-setup-helper">
                          Your gym has not shared an upcoming planned class yet. Library and Decision Trees are still ready to use.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="dashboard-setup-upcoming">
                    <strong>Study focus</strong>
                    <div className="dashboard-setup-list">
                      <Link to="/my-progress" className="dashboard-setup-item">
                        <span>Review tracked topics</span>
                        <small>{memberProgress.length} topic{memberProgress.length === 1 ? '' : 's'} already logged for you.</small>
                      </Link>
                      <Link to="/decision-tree" className="dashboard-setup-item">
                        <span>Use Decision Trees</span>
                        <small>Work through likely branches before class instead of guessing what comes next.</small>
                      </Link>
                      <Link to="/index" className="dashboard-setup-item">
                        <span>Browse Curriculum</span>
                        <small>Use the full map when you want a cleaner overview of positions, sweeps, and submissions.</small>
                      </Link>
                    </div>
                  </div>
                </div>
              </section>

              <ExpandableSection
                title="What changed lately"
                note="Use this when you want the short version of your latest progress updates."
                summary={`${memberRecentProgress.length} recent update${memberRecentProgress.length === 1 ? '' : 's'} ready to reopen.`}
              >
                {memberRecentProgress.length === 0 ? (
                  <p className="empty-state">No progress updates have been logged for you yet.</p>
                ) : (
                  <ul className="card-list">
                    {memberRecentProgress.map((item) => (
                      <li key={`member-recent-${item.id}`} className="card-item compact-topic-card">
                        <div className="compact-topic-header">
                          <div>
                            <strong>{item.topic_title}</strong>
                            <div className="meta-text">
                              {formatLabel(item.topic_type)} | {formatLabel(item.status)}
                            </div>
                          </div>
                          <Link className="secondary-button" to={`/decision-tree?search=${encodeURIComponent(item.topic_title)}&source=dashboard`}>
                            Study next
                          </Link>
                        </div>
                        <div className="detail-block">
                          {item.updated_at ? (
                            <div className="meta-text">
                              Updated: {new Date(item.updated_at).toLocaleString()}
                            </div>
                          ) : null}
                          {item.notes ? <div>{item.notes}</div> : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </ExpandableSection>

              <section className="page-section dashboard-queue-section">
                <div className="section-header">
                  <div>
                    <h3>Keep moving</h3>
                    <p className="section-note">Keep the member experience simple: class schedule, progress, and study tools.</p>
                  </div>
                </div>
                <div className="action-grid">
                  <Link to="/planned-classes" className="action-card dashboard-action-card dashboard-queue-card">
                    <span className="dashboard-card-icon"><AppIcon name="planner" /></span>
                    <strong>Upcoming planned classes</strong>
                    <div className="dashboard-queue-value">
                      {plannedClasses.filter((item) => item.status === 'planned').length}
                    </div>
                    <div className="detail-block">
                      <div className="meta-text">See what your gym has planned next.</div>
                    </div>
                  </Link>
                  <Link to="/my-progress" className="action-card dashboard-action-card dashboard-queue-card">
                    <span className="dashboard-card-icon"><AppIcon name="progress" /></span>
                    <strong>Tracked curriculum topics</strong>
                    <div className="dashboard-queue-value">{memberProgress.length}</div>
                    <div className="detail-block">
                      <div className="meta-text">Review what has already been logged for you.</div>
                    </div>
                  </Link>
                  <Link to="/library" className="action-card dashboard-action-card dashboard-queue-card">
                    <span className="dashboard-card-icon"><AppIcon name="library" /></span>
                    <strong>Member-visible library entries</strong>
                    <div className="dashboard-queue-value">{memberVisibleLibraryEntries.length}</div>
                    <div className="detail-block">
                      <div className="meta-text">Open the videos and notes your coaches have shared with members.</div>
                    </div>
                  </Link>
                </div>
              </section>

              <ExpandableSection
                title="Recently Shared Library Resources"
                note="Open this when you want a quick study list instead of the full Library page."
                summary={`${recentMemberLibraryEntries.length} recent member-visible resource${recentMemberLibraryEntries.length === 1 ? '' : 's'} ready to revisit.`}
              >
                {recentMemberLibraryEntries.length === 0 ? (
                  <p className="empty-state">No member-visible resources have been shared yet.</p>
                ) : (
                  <ul className="card-list">
                    {recentMemberLibraryEntries.map((entry) => (
                      <li key={entry.id} className="card-item compact-topic-card">
                        <div className="compact-topic-header">
                          <div>
                            <strong>{entry.title}</strong>
                            <div className="meta-text">
                              {formatLabel(entry.entry_type)}
                              {entry.program_name ? ` | ${entry.program_name}` : ''}
                              {entry.topic_title ? ` | ${entry.topic_title}` : ''}
                            </div>
                          </div>
                          {entry.video_url ? (
                            <a
                              href={entry.video_url}
                              target="_blank"
                              rel="noreferrer"
                              className="secondary-button"
                            >
                              Open resource
                            </a>
                          ) : null}
                        </div>
                        {entry.description ? <div className="detail-block">{entry.description}</div> : null}
                      </li>
                    ))}
                  </ul>
                )}
              </ExpandableSection>

              <section className="page-section dashboard-feedback-section">
                <div className="section-header">
                  <div>
                    <h3>Thank you for using Progressory</h3>
                    <p className="section-note">
                      Updates will keep coming to improve the gym and member experience over time.
                    </p>
                  </div>
                </div>
                <div className="detail-block">
                  <p className="dashboard-card-copy" style={{ marginBottom: 0 }}>
                    If anything feels confusing, missing, or especially helpful, feel free to email me directly.
                  </p>
                  <a className="library-resource-link" href={`mailto:${DASHBOARD_FEEDBACK_EMAIL}`}>
                    {DASHBOARD_FEEDBACK_EMAIL}
                  </a>
                </div>
              </section>
            </>
          )}
        </div>
      </Layout>
    );
  }

  const quickActions = isManagement ? [
    {
      title: 'Review Attendance',
      icon: 'attendance',
      description: 'Finish today\'s attendance work.',
      cta: 'Open attendance',
      to: '/classes?workflow=attendance-ready&focus=review',
      featured: true
    },
    {
      title: 'Plan a Class',
      icon: 'planner',
      description: 'Build the next session.',
      cta: 'Open planner',
      to: '/planned-classes?action=create'
    },
    {
      title: 'Check / Complete Today\'s Class Logs',
      icon: 'logs',
      description: todayClassCount > 0
        ? `Check and finish ${todayClassCount} class${todayClassCount === 1 ? '' : 'es'} from today.`
        : 'Open today\'s class logs and finish anything still incomplete.',
      cta: 'Open class logs',
      to: `/classes?workflow=today-completed&classDate=${todayIsoDate}&focus=review`
    },
    {
      title: 'Create Scenario',
      icon: 'scenarios',
      description: 'Build reusable class templates.',
      cta: 'Open builder',
      to: '/training-scenarios?action=create&source=dashboard&focus=create'
    },
    {
      title: 'Add Curriculum Topic',
      icon: 'topics',
      description: 'Add the next curriculum topic.',
      cta: 'Open topics',
      to: '/topics?action=create'
    },
    {
      title: 'Open Library',
      icon: 'library',
      description: 'Review teaching resources.',
      cta: 'Open resources',
      to: '/library'
    },
    {
      title: 'View Members',
      icon: 'members',
      description: 'Check roster and progress.',
      cta: 'Open members',
      to: '/members'
    },
    {
      title: 'Run Reports',
      icon: 'reports',
      description: 'Review gaps and trends.',
      cta: 'Open reports',
      to: '/reports'
    }
  ] : [
    {
      title: 'Review Attendance',
      icon: 'attendance',
      description: 'Finish today\'s attendance work.',
      cta: 'Open attendance',
      to: '/classes?workflow=attendance-ready&focus=review',
      featured: true
    },
    {
      title: 'Plan a Class',
      icon: 'planner',
      description: 'Build the next session.',
      cta: 'Open planner',
      to: '/planned-classes?action=create'
    },
    {
      title: 'Check / Complete Today\'s Class Logs',
      icon: 'logs',
      description: todayClassCount > 0
        ? `Check and finish ${todayClassCount} class${todayClassCount === 1 ? '' : 'es'} from today.`
        : 'Open today\'s class logs and finish anything still incomplete.',
      cta: 'Open class logs',
      to: `/classes?workflow=today-completed&classDate=${todayIsoDate}&focus=review`
    },
    {
      title: 'Create Scenario',
      icon: 'scenarios',
      description: 'Reuse class structures faster.',
      cta: 'Open builder',
      to: '/training-scenarios?action=create&source=dashboard&focus=create'
    },
    {
      title: 'Open Curriculum',
      icon: 'curriculum',
      description: 'Review the curriculum map.',
      cta: 'Open map',
      to: '/index'
    },
    {
      title: 'Open Library',
      icon: 'library',
      description: 'Review teaching resources.',
      cta: 'Open resources',
      to: '/library'
    },
    {
      title: 'View Members',
      icon: 'members',
      description: 'Check roster and progress.',
      cta: 'Open members',
      to: '/members'
    }
  ];

  const coachingQueue = [
    {
      title: 'Classes planned today',
      icon: 'planner',
      value: todayPlannedCount,
      description: todayPlannedCount > 0
        ? `${todayPlannedCount} class${todayPlannedCount === 1 ? '' : 'es'} scheduled today.`
        : 'Nothing planned yet for today.',
      to: '/planned-classes?action=create',
      cta: 'Open planner'
    },
    {
      title: 'Attendance to review',
      icon: 'attendance',
      value: attendanceSnapshot.classesNeedingAttendance,
      description: attendanceSnapshot.classesNeedingAttendance > 0
        ? `${attendanceSnapshot.classesNeedingAttendance} class${attendanceSnapshot.classesNeedingAttendance === 1 ? '' : 'es'} still need attention.`
        : 'Nothing waiting on attendance right now.',
      to: '/classes?workflow=attendance-ready&focus=review',
      cta: 'Open attendance',
      featured: true
    }
  ];

  const topTopic = topicCoverage
    .slice()
    .sort((a, b) => Number(b.total_times_used) - Number(a.total_times_used))[0];

  const topMethod = trainingMethodUsage
    .slice()
    .sort((a, b) => Number(b.total_segments) - Number(a.total_segments))[0];

  return (
    <Layout>
      <div className="dashboard-page">
        <h2 className="page-title">Dashboard</h2>
        <p className="page-intro">
          {staffPageIntro}
        </p>

        {error && <p className="error-text">{error}</p>}

        {loading ? (
          <p className="empty-state">Loading your dashboard...</p>
        ) : (
          <>
            {isManagement && tutorialState === 'prompt' ? (
              <section className="page-section dashboard-guide-section">
                <div className="section-header">
                  <div>
                    <h3>New to Progressory?</h3>
                    <p className="section-note">
                      Use this once to get your first real workflow live, then come back to Today and Quick Actions for normal use.
                    </p>
                  </div>
                  <div className="inline-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={startTutorial}
                    >
                      Start walkthrough
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={minimizeTutorial}
                    >
                      Skip for now
                    </button>
                  </div>
                </div>
                <div className="dashboard-guide-grid">
                  <div className="dashboard-guide-highlight">
                    <span className="eyebrow">How the app works</span>
                    <strong>
                      Set up the minimum once, then start running the gym from planning, class logs, and attendance.
                    </strong>
                    <p className="meta-text">
                      Progressory works best when you first add the topics and people your gym actually need this week. After that, move one real class through planning, logging, and attendance before worrying about extras.
                    </p>
                  </div>
                  <div className="dashboard-guide-steps">
                    <div className="dashboard-guide-step">
                      <strong>1. Add the minimum structure</strong>
                      <span>Add curriculum topics and members so the first workflow is built on real gym data.</span>
                    </div>
                    <div className="dashboard-guide-step">
                      <strong>2. Plan one real class</strong>
                      <span>Use Class Planner to build the next session you are actually going to teach.</span>
                    </div>
                    <div className="dashboard-guide-step">
                      <strong>3. Finish the class workflow</strong>
                      <span>After class, log it, take attendance, and let Progressory start connecting what was taught to real people.</span>
                    </div>
                    <div className="dashboard-guide-step">
                      <strong>4. Add support tools later</strong>
                      <span>Library, Entry Setups, Decision Trees, and scenarios help more once the main workflow is already alive.</span>
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            {isManagement && tutorialState === 'minimized' && !setupComplete ? (
              <section className="page-section dashboard-guide-mini">
                <div className="section-header">
                  <div>
                    <h3>Want the app guide later?</h3>
                    <p className="section-note">
                      Keep this tucked away for now and bring it back whenever you want the guided owner walkthrough again.
                    </p>
                  </div>
                  <div className="inline-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={isMinimizedTutorialExpanded ? collapseMinimizedTutorial : expandMinimizedTutorial}
                    >
                      {isMinimizedTutorialExpanded ? 'Hide tutorial prompt' : 'Expand tutorial'}
                    </button>
                  </div>
                </div>

                {isMinimizedTutorialExpanded ? (
                  <div className="dashboard-guide-mini-expanded">
                    <div className="dashboard-guide-grid">
                      <div className="dashboard-guide-highlight">
                        <span className="eyebrow">How the app works</span>
                        <strong>
                          Set up the minimum once, then start running the gym from planning, class logs, and attendance.
                        </strong>
                        <p className="meta-text">
                          Progressory works best when you first add the topics and people your gym actually need this week. After that, move one real class through planning, logging, and attendance before worrying about extras.
                        </p>
                      </div>
                      <div className="dashboard-guide-steps">
                        <div className="dashboard-guide-step">
                          <strong>1. Add the minimum structure</strong>
                          <span>Add curriculum topics and members so the first workflow is built on real gym data.</span>
                        </div>
                        <div className="dashboard-guide-step">
                          <strong>2. Plan one real class</strong>
                          <span>Use Class Planner to build the next session you are actually going to teach.</span>
                        </div>
                        <div className="dashboard-guide-step">
                          <strong>3. Finish the class workflow</strong>
                          <span>After class, log it, take attendance, and let Progressory start connecting what was taught to real people.</span>
                        </div>
                        <div className="dashboard-guide-step">
                          <strong>4. Add support tools later</strong>
                          <span>Library, Entry Setups, Decision Trees, and scenarios help more once the main workflow is already alive.</span>
                        </div>
                      </div>
                    </div>
                    <div className="inline-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={startTutorial}
                      >
                        Yes, walk me through it
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={collapseMinimizedTutorial}
                      >
                        Keep it minimized
                      </button>
                    </div>
                  </div>
                ) : null}
              </section>
            ) : null}

            {isManagement && isTutorialActive && activeTutorialStep ? (
              <div className="dashboard-tutorial-overlay" role="dialog" aria-live="polite">
                <div className="dashboard-tutorial-card">
                  <span className="eyebrow">
                    Tutorial step {currentTutorialStep + 1} of {tutorialSteps.length}
                  </span>
                  <strong>{activeTutorialStep.title}</strong>
                  <p>{activeTutorialStep.description}</p>
                  <div className="inline-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={minimizeTutorial}
                    >
                      Exit tutorial
                    </button>
                    {currentTutorialStep > 0 ? (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={rewindTutorial}
                      >
                        Back
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={advanceTutorial}
                    >
                      {currentTutorialStep === tutorialSteps.length - 1 ? 'Finish tutorial' : 'Next'}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {isManagement && showOnboardingCompleteBanner ? (
              <section
                ref={onboardingCompleteBannerRef}
                className="page-section dashboard-onboarding-complete-banner"
              >
                <div className="section-header">
                  <div>
                    <span className="eyebrow">First workflow complete</span>
                    <h3>Your first workflow is live</h3>
                    <p className="section-note">
                      You moved a real class through topics, members, planning, class logs, and attendance. Beginner Phase is complete, and you can use Progressory normally from here.
                    </p>
                  </div>
                  <div className="inline-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={handleDismissOnboardingCompleteBanner}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
                <div className="dashboard-guide-grid">
                  <div className="dashboard-guide-highlight">
                    <span className="eyebrow">What to do next</span>
                    <strong>Repeat the class workflow, then expand the gym setup only when it helps real coaching work.</strong>
                    <p className="meta-text">
                      You do not need to build everything today. Keep planning, logging, and attendance consistent first, then add programs, Library support, scenarios, and deeper tools as the gym starts using them.
                    </p>
                  </div>
                  <div className="dashboard-guide-steps">
                    <div className="dashboard-guide-step">
                      <strong>Keep planning classes</strong>
                      <span>Use Class Planner for the next sessions you are actually going to teach.</span>
                    </div>
                    <div className="dashboard-guide-step">
                      <strong>Finish the logs after class</strong>
                      <span>Keep attendance and topics connected so Progressory builds a real coaching history.</span>
                    </div>
                    <div className="dashboard-guide-step">
                      <strong>Add structure when it earns its place</strong>
                      <span>Programs, Library resources, and scenarios matter more now that the main workflow is already alive.</span>
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            <section id="dashboard-coaching-queue" className={`page-section dashboard-today-section${getTutorialSectionClass('dashboard-coaching-queue')}`}>
              <div className="section-header">
                <div>
                  <h3>Today</h3>
                  <p className="section-note">{isManagement ? 'Start here first.' : 'Handle the live coaching work first.'}</p>
                </div>
              </div>
              <div className="action-grid">
                {coachingQueue.map((item) => (
                  <Link
                    key={item.title}
                    to={item.to}
                    className={`action-card dashboard-action-card dashboard-queue-card${item.featured ? ' is-featured' : ''}`}
                  >
                    <span className="dashboard-card-icon"><AppIcon name={item.icon} /></span>
                    <strong>{item.title}</strong>
                    <div className="dashboard-queue-value">{item.value}</div>
                    <p className="dashboard-card-copy">{item.description}</p>
                    <span className="dashboard-card-cta">{item.cta}</span>
                  </Link>
                ))}
              </div>
            </section>

            <section className={`page-section dashboard-momentum-section${isTutorialActive ? ' dashboard-tutorial-dimmed' : ''}`}>
              <div className="section-header">
                <div>
                  <h3>What changed</h3>
                  <p className="section-note">This is the quick pulse on what moved, what is fading, and what looks ready for the next teaching decision.</p>
                </div>
              </div>
              <div className="dashboard-momentum-grid">
                {managementWeeklyWinCards.map((card) => (
                  <div key={`management-win-${card.label}`} className="dashboard-momentum-card">
                    <span className="eyebrow">Visible win</span>
                    <strong>{card.label}</strong>
                    <div className="dashboard-momentum-value">{card.value}</div>
                  </div>
                ))}
              </div>
            </section>

            <section id="dashboard-quick-actions" className={`page-section dashboard-hero-section${getTutorialSectionClass('dashboard-quick-actions')}`}>
              <div className="section-header">
                <div>
                  <h3>Quick Actions</h3>
                  <p className="section-note">{isManagement ? 'Jump straight to the next job.' : 'Use these when you already know the coaching job you need next.'}</p>
                </div>
              </div>
              <div className="action-grid">
                {quickActions.map((action) => (
                  <Link
                    key={action.title}
                    to={action.to}
                    className={`action-card dashboard-action-card${action.featured ? ' is-featured' : ''}`}
                  >
                    <span className="dashboard-card-icon"><AppIcon name={action.icon} /></span>
                    <strong>{action.title}</strong>
                    <p className="dashboard-card-copy">{action.description}</p>
                    <span className="dashboard-card-cta">{action.cta}</span>
                  </Link>
                ))}
              </div>
            </section>

            <section className={`page-section dashboard-recommendation-section${isTutorialActive ? ' dashboard-tutorial-dimmed' : ''}`}>
              <div className="section-header">
                <div>
                  <h3>Next best moves</h3>
                  <p className="section-note">Use this when you want the app to suggest the next coaching move instead of opening pages cold.</p>
                </div>
              </div>
              {dashboardNextMoveCards.length === 0 ? (
                <div className="dashboard-next-move-highlight">
                  <div className="dashboard-next-move-copy">
                    <span className="eyebrow">Not enough signal yet</span>
                    <strong>Once the gym logs more classes, topics, and resources, this section will start suggesting smarter next moves.</strong>
                    <p className="meta-text">
                      For now, keep using planning, class logs, attendance, and topics. Those are the signals that make the coaching suggestions stronger.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="dashboard-recommendation-grid">
                  {dashboardNextMoveCards.map((card) => (
                    <article key={card.title} className="dashboard-next-move-highlight">
                      <div className="dashboard-next-move-copy">
                        <span className="eyebrow">{card.eyebrow}</span>
                        <strong>{card.title}</strong>
                        <p className="meta-text">{card.body}</p>
                      </div>
                      <div className="inline-actions">
                        <Link className="secondary-button" to={card.primaryTo}>
                          {card.primaryLabel}
                        </Link>
                        {String(card.secondaryTo || '').startsWith('http') ? (
                          <a className="secondary-button" href={card.secondaryTo} target="_blank" rel="noreferrer">
                            {card.secondaryLabel}
                          </a>
                        ) : (
                          <Link className="secondary-button" to={card.secondaryTo}>
                            {card.secondaryLabel}
                          </Link>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {isManagement && !hideSetupChecklist ? (
              <section id="dashboard-start-here" className={`page-section dashboard-onboarding-section${getTutorialSectionClass('dashboard-start-here')}`}>
                <div className="section-header">
                  <div>
                    <h3>Start Here</h3>
                    <p className="section-note">Use this when setting up the gym or onboarding a coach.</p>
                  </div>
                  <div className="inline-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={handleHideSetupChecklist}
                    >
                      Hide setup guide
                    </button>
                  </div>
                </div>

                <div className="dashboard-setup-progress">
                  <div className="dashboard-setup-progress-header">
                    <strong>Week-one founder flow</strong>
                    <span className="meta-text">{completedSetupCount} of {setupTasks.length} steps complete</span>
                  </div>
                  <div className="dashboard-setup-progress-bar" aria-hidden="true">
                    <span style={{ width: `${setupProgressPercent}%` }} />
                  </div>
                  <div className="dashboard-setup-progress-checklist">
                    {setupTasks.map((task) => (
                      <div
                        key={task.key}
                        className={`dashboard-setup-progress-item${task.complete ? ' is-complete' : ''}`}
                      >
                        <span>{task.complete ? 'Complete' : 'Next'}</span>
                        <strong>{task.title}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dashboard-setup-grid">
                  <div className="dashboard-setup-card dashboard-setup-current">
                    {nextSetupTask ? (
                      <>
                        <strong>{nextSetupTask.title}</strong>
                        <p className="dashboard-card-copy">{nextSetupTask.description}</p>
                        <div className="dashboard-setup-helper">{nextSetupTask.helper}</div>
                        <div className="inline-actions">
                          <Link to={nextSetupTask.to} className="secondary-button">
                            Open this step
                          </Link>
                        </div>
                      </>
                    ) : (
                      <>
                        <strong>Your first workflow is live</strong>
                        <p className="dashboard-card-copy">The gym has enough structure to keep using Progressory this week. Focus on repeating the class workflow and refining from there.</p>
                      </>
                    )}
                  </div>

                  <div className="dashboard-setup-upcoming">
                    <strong>Coming up after this</strong>
                    <div className="dashboard-setup-list">
                      {upcomingSetupTasks.length > 0 ? (
                        upcomingSetupTasks.map((task) => (
                          <Link key={task.key} to={task.to} className="dashboard-setup-item">
                            <span>{task.title}</span>
                            <small>{task.description}</small>
                          </Link>
                        ))
                      ) : (
                        <div className="dashboard-setup-helper">
                          The core setup is done. Use Helpful Extras when you want to make the app even stronger for coaches and members.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            ) : isManagement && !setupComplete ? (
              <section className="page-section dashboard-onboarding-collapsed">
                <div className="section-header">
                  <div>
                    <h3>Setup guide hidden</h3>
                    <p className="section-note">Bring it back any time.</p>
                  </div>
                  <div className="inline-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={handleShowSetupChecklist}
                    >
                      Show setup guide
                    </button>
                  </div>
                </div>
              </section>
            ) : null}

            {isManagement && setupComplete ? (
              <section id="dashboard-helpful-extras" className={`page-section dashboard-extras-section${getTutorialSectionClass('dashboard-helpful-extras')}`}>
                <div className="section-header">
                  <div>
                    <h3>Helpful Extras</h3>
                    <p className="section-note">Use these once the core workflow is already running.</p>
                  </div>
                </div>
                <div className="action-grid">
                    {helpfulExtras.map((item) => (
                      <Link key={item.key} to={item.to} className="action-card dashboard-action-card dashboard-extra-card">
                        <span className="dashboard-card-icon"><AppIcon name={item.icon} /></span>
                        <strong>{item.title}</strong>
                      <p className="dashboard-card-copy">{item.description}</p>
                      <div className="dashboard-setup-helper">{item.helper}</div>
                      <span className="dashboard-card-cta">{item.cta || 'Open'}</span>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            <ExpandableSection
              title="Momentum signals"
              note="Use this when you want the app to tell you what feels active, neglected, or ready to teach next."
              summary="Recently taught topics, neglected topics, member-ready review resources, and likely follow-ups all live here."
              className={`dashboard-primary-section${isTutorialActive ? ' dashboard-tutorial-dimmed' : ''}`}
              defaultOpen={false}
            >
              <div className="two-column-grid dashboard-insights-grid">
                <div className="card-item dashboard-compact-card">
                  <strong>Recently taught</strong>
                  {recentlyTaughtTopics.length === 0 ? (
                    <p className="empty-state">No recent topic signals yet.</p>
                  ) : (
                    <div className="dashboard-signal-list">
                      {recentlyTaughtTopics.map((item) => (
                        <div key={`recent-topic-${item.topic_id}`} className="dashboard-signal-row">
                          <div>
                            <strong>{item.topic_title}</strong>
                            <div className="meta-text">{item.program_name || 'No program'} | {formatLabel(item.topic_type)}</div>
                          </div>
                          <Link className="secondary-button" to={`/topics?topicId=${item.topic_id}`}>
                            Open
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card-item dashboard-compact-card">
                  <strong>Topics not taught in a while</strong>
                  {topicsNotTaughtRecently.length === 0 ? (
                    <p className="empty-state">Nothing is falling behind right now.</p>
                  ) : (
                    <div className="dashboard-signal-list">
                      {topicsNotTaughtRecently.map((item) => (
                        <div key={`neglected-topic-${item.topic_id}`} className="dashboard-signal-row">
                          <div>
                            <strong>{item.topic_title}</strong>
                            <div className="meta-text">
                              {item.last_used_date ? `Last used ${new Date(item.last_used_date).toLocaleDateString()}` : 'Not yet used in class'}
                            </div>
                          </div>
                          <Link
                            className="secondary-button"
                            to={`/planned-classes?openForm=1&reportTopicId=${item.topic_id}&reportTopicTitle=${encodeURIComponent(item.topic_title)}`}
                          >
                            Plan it
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card-item dashboard-compact-card">
                  <strong>Member-ready review resources</strong>
                  {memberReadyLibraryEntries.length === 0 ? (
                    <p className="empty-state">No member-ready Library resources yet.</p>
                  ) : (
                    <div className="dashboard-signal-list">
                      {memberReadyLibraryEntries.slice(0, 4).map((entry) => (
                        <div key={`member-library-${entry.id}`} className="dashboard-signal-row">
                          <div>
                            <strong>{entry.title}</strong>
                            <div className="meta-text">{entry.topic_title || 'Unlinked resource'} | {formatLabel(entry.visibility)}</div>
                          </div>
                          <Link className="secondary-button" to="/library">
                            Open
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card-item dashboard-compact-card">
                  <strong>Suggested follow-up after the last class</strong>
                  {suggestedFollowUps.length === 0 ? (
                    <p className="empty-state">Log a few more topic-driven classes and this will start suggesting follow-ups.</p>
                  ) : (
                    <div className="dashboard-signal-list">
                      {suggestedFollowUps.map((item) => (
                        <div key={`follow-up-${item.name}`} className="dashboard-signal-row">
                          <div>
                            <strong>{item.name}</strong>
                            <div className="meta-text">Flows after {item.sourceTopic}</div>
                          </div>
                          <Link className="secondary-button" to={`/decision-tree?search=${encodeURIComponent(item.name)}`}>
                            Study next
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ExpandableSection>

            <ExpandableSection
              title="Recent Classes"
              note="Recent sessions logged by your team."
              summary="Open this when you want a quick look at the latest class logs."
              className={`dashboard-primary-section${isTutorialActive ? ' dashboard-tutorial-dimmed' : ''}`}
              actions={<Link to="/classes" className="secondary-button">Open Class Logs</Link>}
            >
              {recentClasses.length === 0 ? (
                <p className="empty-state">No classes have been logged yet.</p>
              ) : (
                <ul className="card-list">
                  {recentClasses.map((item) => (
                    <li key={item.id} className="card-item dashboard-compact-card">
                      <strong>{item.title || 'Untitled Class'}</strong>
                      <div className="detail-block">
                        <div className="meta-text">Program: {item.program_name}</div>
                        <div className="meta-text">
                          Coach: {item.head_coach_first_name} {item.head_coach_last_name}
                        </div>
                        <div className="meta-text">
                          Date: {new Date(item.class_date).toLocaleDateString()}
                        </div>
                        <div className="meta-text">
                          Time: {item.start_time || 'N/A'} - {item.end_time || 'N/A'}
                        </div>
                        <div>{item.notes || 'No notes added yet.'}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </ExpandableSection>

            <ExpandableSection
              title="Insights"
              note="Open this when you want topic and training-method trends."
              summary="Keep this collapsed unless you want a deeper read than the main dashboard actions."
              className={`dashboard-cta-section${isTutorialActive ? ' dashboard-tutorial-dimmed' : ''}`}
              defaultOpen={false}
              actions={<Link to="/reports" className="secondary-button">Open Reports</Link>}
            >
              <div className="two-column-grid dashboard-insights-grid">
                {!topTopic ? (
                  <div className="card-item dashboard-compact-card">
                    <strong>Top Topic</strong>
                    <p className="empty-state">No topic usage has been logged yet.</p>
                  </div>
                ) : (
                  <div className="card-item dashboard-compact-card">
                    <strong>Top Topic</strong>
                    <div className="detail-block">
                      <div>{topTopic.topic_title}</div>
                      <div className="meta-text">Type: {formatLabel(topTopic.topic_type)}</div>
                      <div className="meta-text">Program: {topTopic.program_name || 'None'}</div>
                      <div className="meta-text">Total Uses: {Number(topTopic.total_times_used)}</div>
                      <div className="meta-text">Focus Count: {Number(topTopic.focus_count)}</div>
                    </div>
                  </div>
                )}

                {!topMethod ? (
                  <div className="card-item dashboard-compact-card">
                    <strong>Top Training Method</strong>
                    <p className="empty-state">No training method usage has been logged yet.</p>
                  </div>
                ) : (
                  <div className="card-item dashboard-compact-card">
                    <strong>Top Training Method</strong>
                    <div className="detail-block">
                      <div>{topMethod.training_method_name}</div>
                      <div className="meta-text">{topMethod.description || 'No description added yet.'}</div>
                      <div className="meta-text">Total Segments: {Number(topMethod.total_segments)}</div>
                      <div className="meta-text">Total Duration: {Number(topMethod.total_duration_minutes)} minutes</div>
                    </div>
                  </div>
                )}

                <div className="card-item dashboard-compact-card">
                  <strong>Bridge into setups and trees</strong>
                  {recentSetupFamilySuggestions.length === 0 ? (
                    <p className="empty-state">Recent topic signals have not suggested a setup family yet.</p>
                  ) : (
                    <div className="dashboard-signal-list">
                      {recentSetupFamilySuggestions.map((family) => (
                        <div key={`setup-family-${family.title}`} className="dashboard-signal-row">
                          <div>
                            <strong>{family.title}</strong>
                            <div className="meta-text">{family.summary}</div>
                          </div>
                          <Link className="secondary-button" to={`/entry-setups?family=${encodeURIComponent(family.title)}`}>
                            Open
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ExpandableSection>

            <section className="page-section dashboard-feedback-section">
              <div className="section-header">
                <div>
                  <h3>Thank you for using Progressory</h3>
                  <p className="section-note">
                    Updates will keep coming to improve your gym and user experience over time.
                  </p>
                </div>
              </div>
              <div className="detail-block">
                <p className="dashboard-card-copy" style={{ marginBottom: 0 }}>
                  If you have feedback, ideas, or anything that would make the workflow smoother for your gym, feel free to email me directly.
                </p>
                <a className="library-resource-link" href={`mailto:${DASHBOARD_FEEDBACK_EMAIL}`}>
                  {DASHBOARD_FEEDBACK_EMAIL}
                </a>
              </div>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}



