export const getFounderOnboardingTasks = ({
  topicsCount = 0,
  activeMemberCount = 0,
  plannedClassesCount = 0,
  classesCount = 0,
  classesWithAttendance = 0
} = {}) => ([
  {
    key: 'topics',
    title: 'Add topics for your curriculum',
    description: 'Add the positions, techniques, and concepts your gym actually teaches.',
    helper: 'Topics are the glue between classes, member progress, Library, and study tools.',
    to: '/index?category=Positions&focusResults=1',
    complete: topicsCount > 0
  },
  {
    key: 'members',
    title: 'Add your members',
    description: 'Add members so attendance and progress tracking become real instead of just structure.',
    helper: 'Once members exist, class logs and attendance start doing useful work for the gym.',
    to: '/members?action=create&onboarding=1',
    complete: activeMemberCount > 0
  },
  {
    key: 'planned',
    title: 'Plan your first class',
    description: 'Build the next real session in Class Planner before class starts.',
    helper: 'This is the first live workflow most founder gyms should use right away.',
    to: '/planned-classes?action=create&onboarding=1',
    complete: plannedClassesCount > 0
  },
  {
    key: 'logged-class',
    title: 'Log your first completed class',
    description: 'Turn one real class into a class log so planning becomes a repeatable coaching record.',
    helper: 'This is the moment Progressory stops feeling like setup and starts feeling like a working system.',
    to: '/classes?workflow=create-class&onboarding=1',
    complete: classesCount > 0
  },
  {
    key: 'attendance',
    title: 'Record attendance for a class',
    description: 'Take attendance after class so the class log, member records, and progress all stay connected.',
    helper: 'This is where Progressory starts feeling like a live coaching workflow instead of setup.',
    to: '/classes?workflow=attendance-ready&onboarding=1',
    complete: classesWithAttendance > 0
  }
]);

export const getFounderOnboardingSummary = (metrics = {}) => {
  const tasks = getFounderOnboardingTasks(metrics);
  const nextTask = tasks.find((task) => !task.complete) || null;
  const completedCount = tasks.filter((task) => task.complete).length;
  const setupComplete = completedCount === tasks.length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return {
    tasks,
    nextTask,
    completedCount,
    setupComplete,
    progressPercent
  };
};
