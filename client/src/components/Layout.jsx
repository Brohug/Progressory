import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AppIcon from './AppIcon';

const getLinkClassName = ({ isActive }) => (
  `app-nav-link${isActive ? ' is-active' : ''}`
);

const getBottomLinkClassName = ({ isActive }) => (
  `app-mobile-nav-link${isActive ? ' is-active' : ''}`
);

const getIconNameForPath = (path) => {
  switch (path) {
    case '/dashboard':
      return 'dashboard';
    case '/planned-classes':
      return 'planner';
    case '/classes':
      return 'logs';
    case '/members':
      return 'members';
    case '/index':
      return 'curriculum';
    case '/library':
      return 'library';
    case '/decision-tree':
      return 'trees';
    case '/reports':
      return 'reports';
    case '/training-scenarios':
      return 'scenarios';
    case '/topics':
      return 'topics';
    case '/programs':
      return 'programs';
    case '/staff':
      return 'staff';
    case '/my-progress':
      return 'progress';
    case '/account':
      return 'account';
    default:
      return 'dashboard';
  }
};

const renderNavLabel = (label, iconName) => (
  <>
    <AppIcon name={iconName} className="app-nav-icon" />
    <span>{label}</span>
  </>
);

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const locationKey = `${location.pathname}${location.search}`;
  const desktopMoreMenuRef = useRef(null);
  const mobileMoreSheetRef = useRef(null);
  const mobileMoreButtonRef = useRef(null);
  const mobileTopNavRef = useRef(null);
  const [menuState, setMenuState] = useState({
    mobile: false,
    more: false,
    user: false,
    routeKey: ''
  });
  const [hasSeenMobileNavScroll, setHasSeenMobileNavScroll] = useState(false);
  const [guidePreference, setGuidePreference] = useState({
    key: '',
    value: null
  });

  const isOwner = user?.role === 'owner';
  const isManagement = user?.role === 'owner' || user?.role === 'admin';
  const isMember = user?.role === 'member';
  const searchParams = new URLSearchParams(location.search);
  const workflow = searchParams.get('workflow') || '';
  const guideStorageKey = user?.id ? `progressory-layout-guide-collapsed-v1-${user.id}` : '';
  const isMobileMenuOpen = menuState.mobile && menuState.routeKey === locationKey;
  const isMoreMenuOpen = menuState.more && menuState.routeKey === locationKey;
  const isUserMenuOpen = menuState.user && menuState.routeKey === locationKey;
  const storedGuidePreference = useMemo(() => {
    if (!guideStorageKey || typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem(guideStorageKey) === 'true';
  }, [guideStorageKey]);
  const isGuideCollapsed = guidePreference.key === guideStorageKey && guidePreference.value !== null
    ? guidePreference.value
    : storedGuidePreference;

  const toggleMobileMenu = () => {
    setMenuState((prev) => ({
      mobile: !(prev.mobile && prev.routeKey === locationKey),
      more: false,
      user: false,
      routeKey: locationKey
    }));
  };

  const toggleMoreMenu = () => {
    setHasSeenMobileNavScroll(true);
    setMenuState((prev) => ({
      mobile: false,
      more: !(prev.more && prev.routeKey === locationKey),
      user: false,
      routeKey: locationKey
    }));
  };

  const closeMoreMenu = useCallback(() => {
    setMenuState((prev) => ({
      ...prev,
      more: false,
      routeKey: locationKey
    }));
  }, [locationKey]);

  const toggleUserMenu = () => {
    setMenuState((prev) => ({
      mobile: false,
      more: false,
      user: !(prev.user && prev.routeKey === locationKey),
      routeKey: locationKey
    }));
  };

  const closeMenus = () => {
    setMenuState({
      mobile: false,
      more: false,
      user: false,
      routeKey: locationKey
    });
  };

  useEffect(() => {
    if (!isMoreMenuOpen) {
      return undefined;
    }

    const handlePointerDownOutside = (event) => {
      const target = event.target;

      if (
        desktopMoreMenuRef.current?.contains(target) ||
        mobileMoreSheetRef.current?.contains(target) ||
        mobileMoreButtonRef.current?.contains(target)
      ) {
        return;
      }

      closeMoreMenu();
    };

    document.addEventListener('mousedown', handlePointerDownOutside);
    document.addEventListener('touchstart', handlePointerDownOutside);

    return () => {
      document.removeEventListener('mousedown', handlePointerDownOutside);
      document.removeEventListener('touchstart', handlePointerDownOutside);
    };
  }, [closeMoreMenu, isMoreMenuOpen]);

  useEffect(() => {
    const navElement = mobileTopNavRef.current;

    if (!navElement || hasSeenMobileNavScroll) {
      return undefined;
    }

    const handleScroll = () => {
      if (navElement.scrollLeft > 8) {
        setHasSeenMobileNavScroll(true);
      }
    };

    navElement.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      navElement.removeEventListener('scroll', handleScroll);
    };
  }, [hasSeenMobileNavScroll, locationKey]);

  useEffect(() => {
    const shouldLockScroll = isMobileMenuOpen || isMoreMenuOpen;

    if (!shouldLockScroll || typeof document === 'undefined') {
      return undefined;
    }

    const { body, documentElement } = document;
    const scrollY = window.scrollY;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyWidth = body.style.width;
    const previousHtmlOverflow = documentElement.style.overflow;
    const previousOverscroll = body.style.overscrollBehavior;

    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    documentElement.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';

    return () => {
      body.style.overflow = previousBodyOverflow;
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.width = previousBodyWidth;
      documentElement.style.overflow = previousHtmlOverflow;
      body.style.overscrollBehavior = previousOverscroll;
      window.scrollTo(0, scrollY);
    };
  }, [isMobileMenuOpen, isMoreMenuOpen]);

  const toggleGuide = () => {
    const nextValue = !isGuideCollapsed;
    setGuidePreference({
      key: guideStorageKey,
      value: nextValue
    });

    if (guideStorageKey && typeof window !== 'undefined') {
      window.localStorage.setItem(guideStorageKey, String(nextValue));
    }
  };

  const coachGuide = (() => {
    if (isMember && location.pathname === '/dashboard') {
      return {
        eyebrow: 'Member guide',
        title: 'Start with your upcoming classes, then review progress, Library, or Decision Trees.',
        description: 'Keep the member side simple: see what is coming up, revisit learning resources, and track what has been logged for you.',
        primary: { label: 'Open my progress', to: '/my-progress' },
        secondary: { label: 'Open Library', to: '/library' }
      };
    }

    if (isMember && location.pathname === '/planned-classes') {
      return {
        eyebrow: 'Member guide',
        title: 'Use this page to see what classes are planned next.',
        description: 'This view is read-only so members can stay focused on the class schedule instead of gym admin.',
        primary: { label: 'Open Curriculum', to: '/index' },
        secondary: { label: 'Open Decision Trees', to: '/decision-tree' }
      };
    }

    if (isMember && location.pathname === '/library') {
      return {
        eyebrow: 'Member guide',
        title: 'Library only shows resources your coaches marked as member visible.',
        description: 'Use this page to revisit videos and notes tied to the curriculum topics your gym wants members to see.',
        primary: { label: 'Open my progress', to: '/my-progress' },
        secondary: { label: 'Open Curriculum', to: '/index' }
      };
    }

    if (isMember && location.pathname === '/my-progress') {
      return {
        eyebrow: 'Member guide',
        title: 'Track what your coaches logged, then use Curriculum and Decision Trees to study it more deeply.',
        description: 'Your progress page is the personal layer. The wider study tools help you explore the map around those topics.',
        primary: { label: 'Open Curriculum', to: '/index' },
        secondary: { label: 'Open Decision Trees', to: '/decision-tree' }
      };
    }

    if (isMember && location.pathname === '/index') {
      return {
        eyebrow: 'Member guide',
        title: 'Use Curriculum as a study map, then jump into Library or Decision Trees for more depth.',
        description: 'This read-only view helps members explore the full curriculum language without changing the gym structure.',
        primary: { label: 'Open Decision Trees', to: '/decision-tree' },
        secondary: { label: 'Open Library', to: '/library' }
      };
    }

    if (isMember && location.pathname === '/decision-tree') {
      return {
        eyebrow: 'Member guide',
        title: 'Use Decision Trees to study options, then go back into Library or My Progress for practical review.',
        description: 'This keeps the member experience focused on learning, not coach/admin setup.',
        primary: { label: 'Open my progress', to: '/my-progress' },
        secondary: { label: 'Open Library', to: '/library' }
      };
    }

    if (location.pathname === '/dashboard') {
      return {
        eyebrow: 'Coach guide',
        title: 'Use Today for right-now work, then Quick Actions when you need a fast jump elsewhere.',
        description: 'This keeps the dashboard practical on mobile and desktop: start with the live coaching queue, then jump straight into the next job.',
        primary: { label: 'Review Attendance', to: '/classes?workflow=attendance-ready', variant: 'attention' },
        secondary: { label: 'Plan a Class', to: '/planned-classes' }
      };
    }

    if (location.pathname === '/programs') {
      return {
        eyebrow: 'Best next move',
        title: 'After programs, add the topics that make those tracks usable.',
        description: 'Programs give structure, but topics connect planning, class logs, Library, and Decision Trees.',
        primary: isManagement
          ? { label: 'Add topic now', to: '/topics?action=create' }
          : { label: 'Go to Curriculum', to: '/index' },
        secondary: isManagement
          ? { label: 'Open Curriculum', to: '/index' }
          : { label: 'Open Class Planner', to: '/planned-classes' }
      };
    }

    if (location.pathname === '/index') {
      return {
        eyebrow: 'Best next move',
        title: 'After topics are in place, use them in planning or attach resources to them.',
        description: 'Curriculum becomes most valuable once coaches are actively planning classes or linking resources around the topics they just added.',
        primary: isManagement
          ? { label: 'Open Topics', to: '/topics' }
          : { label: 'Open Class Planner', to: '/planned-classes' },
        secondary: isManagement
          ? { label: 'Add topic', to: '/topics?action=create' }
          : { label: 'Open Library', to: '/library' }
      };
    }

    if (location.pathname === '/planned-classes') {
      return {
        eyebrow: 'Best next move',
        title: 'Build the class first, then finish it later in Class Logs.',
        description: 'Planning is the setup step. After class happens, use Class Logs to finish attendance, topics, and training entries.',
        primary: { label: 'Log completed class', to: '/classes?workflow=today-completed' },
        secondary: { label: 'Create scenario', to: '/training-scenarios?action=create&source=planned-classes' }
      };
    }

    if (location.pathname === '/classes' && workflow === 'attendance-ready') {
      return {
        eyebrow: 'Coach workflow',
        title: 'Record attendance first, then fill in missing topics or training entries only if needed.',
        description: 'Open the class that still needs attention and finish the session from there.',
        primary: { label: 'Review Attendance', to: '/classes?workflow=attendance-ready', variant: 'attention' },
        secondary: { label: 'View all class logs', to: '/classes' }
      };
    }

    if (location.pathname === '/classes') {
      return {
        eyebrow: 'Best next move',
        title: 'Use this page to finish class admin after training actually happened.',
        description: 'Class Logs work best after planning exists, attendance is recorded, and coaches fill in only the details that still matter.',
        primary: { label: 'Review Attendance', to: '/classes?workflow=attendance-ready', variant: 'attention' },
        secondary: { label: 'View members', to: '/members' }
      };
    }

    if (location.pathname === '/training-scenarios') {
      return {
        eyebrow: 'Best next move',
        title: 'After building a scenario, reuse it in planning or live class logs.',
        description: 'Scenarios help classes feel repeatable instead of rebuilt from scratch every time.',
        primary: { label: 'Use in Class Planner', to: '/planned-classes' },
        secondary: { label: 'Use in Class Logs', to: '/classes?workflow=create-class' }
      };
    }

    if (location.pathname === '/library') {
      return {
        eyebrow: 'Best next move',
        title: 'Library is strongest when resources stay tied to real curriculum topics.',
        description: 'If a resource feels disconnected, link or add the topic first so coaches and members can actually find it later.',
        primary: isManagement
          ? { label: 'Open Topics', to: '/topics' }
          : { label: 'Go to Curriculum', to: '/index' },
        secondary: isManagement
          ? { label: 'Add topic', to: '/topics?action=create' }
          : { label: 'Open Decision Trees', to: '/decision-tree' }
      };
    }

    if (location.pathname === '/reports') {
      return {
        eyebrow: 'Best next move',
        title: 'Use Reports to spot gaps, then jump straight into Topics or planning while the signal is fresh.',
        description: 'Reports are strongest when coaches can immediately act on what is missing, underused, or naturally connected to recent classes.',
        primary: isManagement
          ? { label: 'Add topic', to: '/topics?action=create' }
          : { label: 'Plan a class', to: '/planned-classes?openForm=1' },
        secondary: isManagement
          ? { label: 'Open Topics', to: '/topics' }
          : { label: 'Open Curriculum', to: '/index' }
      };
    }

    if (location.pathname === '/members') {
      return {
        eyebrow: 'Best next move',
        title: 'After members are added, make attendance and progress do the real work.',
        description: 'Members become useful once coaches are checking them in and logging what they are learning over time.',
        primary: { label: 'Review Attendance', to: '/classes?workflow=attendance-ready', variant: 'attention' },
        secondary: { label: 'Open Decision Trees', to: '/decision-tree' }
      };
    }

    if (location.pathname === '/decision-tree') {
      return {
        eyebrow: 'Coach guide',
        title: 'Use Decision Trees to narrow paths, then go back into classes, topics, or Library to operationalize them.',
        description: 'This is the thinking layer. The other pages turn those ideas into real class plans, resources, and recorded progress.',
        primary: { label: 'Open Curriculum', to: '/index' },
        secondary: { label: 'Open Library', to: '/library' }
      };
    }

    return {
      eyebrow: 'Coach guide',
      title: 'Use the app one coaching job at a time.',
      description: 'Keep the next action small and practical so the rest of the system stays easy to manage.',
      primary: { label: 'Dashboard', to: '/dashboard' },
      secondary: null
    };
  })();

  const primaryNavItems = useMemo(() => {
    if (!user) {
      return [];
    }

    if (isMember) {
      return [
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Classes', to: '/planned-classes' },
        { label: 'Progress', to: '/my-progress' },
        { label: 'Curriculum', to: '/index' }
      ];
    }

    return [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Class Planner', to: '/planned-classes' },
      { label: 'Class Logs', to: '/classes' },
      { label: 'Members', to: '/members' },
      { label: 'Curriculum', to: '/index' }
    ];
  }, [isMember, user]);

  const moreNavItems = useMemo(() => {
    if (!user) {
      return [];
    }

    if (isMember) {
      return [
        { label: 'Library', to: '/library' },
        { label: 'Decision Trees', to: '/decision-tree' }
      ];
    }

    const items = [
      { label: 'Class Planner', to: '/planned-classes' },
      { label: 'Reports', to: '/reports' },
      { label: 'Library', to: '/library' },
      { label: 'Decision Trees', to: '/decision-tree' },
      { label: 'Scenarios', to: '/training-scenarios' },
      { label: 'Topics', to: '/topics' }
    ];

    if (isManagement) {
      items.splice(1, 0, { label: 'Programs', to: '/programs' });
    }

    if (isOwner) {
      items.splice(2, 0, { label: 'Staff', to: '/staff' });
    }

    return items;
  }, [isManagement, isMember, isOwner, user]);

  const mobileBottomNavItems = useMemo(() => {
    if (!user) {
      return [];
    }

    if (isMember) {
      return [
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Classes', to: '/planned-classes' },
        { label: 'Progress', to: '/my-progress' },
        { label: 'Curriculum', to: '/index' }
      ];
    }

    return [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Classes', to: '/classes' },
      { label: 'Members', to: '/members' },
      { label: 'Curriculum', to: '/index' }
    ];
  }, [isMember, user]);

  const mobileMenuItems = useMemo(() => (
    [...primaryNavItems, ...moreNavItems.filter((item) => item.to !== '/planned-classes')]
  ), [moreNavItems, primaryNavItems]);

  const isMoreRouteActive = moreNavItems.some((item) => item.to === location.pathname);
  const userMenuLabel = user ? `${user.first_name} ${user.last_name}` : 'Account';

  return (
    <div className="app-shell">
      <div className="app-container">
        <header className="app-header">
          <div className="app-header-top">
            <div className="app-brand-block">
              <h1 className="app-title">Progressory</h1>
              {user ? (
                <p className="app-subtitle">
                  {user.gym_name} | {user.role}
                </p>
              ) : null}
            </div>

            {user ? (
              <div className="app-header-actions">
                <button
                  type="button"
                  className="app-header-menu-toggle"
                  onClick={toggleMobileMenu}
                >
                  <AppIcon name="more" className="app-nav-icon" />
                  <span>Menu</span>
                </button>

                <div className="app-user-menu-shell">
                  <button
                    type="button"
                    className="app-user-menu-toggle"
                    onClick={toggleUserMenu}
                  >
                    <AppIcon name="account" className="app-nav-icon" />
                    <span>{userMenuLabel}</span>
                  </button>
                  {isUserMenuOpen ? (
                    <div className="app-user-menu-panel">
                      <div className="app-user-menu-summary">
                        <strong>{user.first_name} {user.last_name}</strong>
                        <span>{user.gym_name}</span>
                        <span>{user.role}</span>
                      </div>
                      <div className="app-user-menu-actions">
                        <Link className="secondary-button" to="/account" onClick={closeMenus}>
                          <AppIcon name="account" />
                          <span>My Account</span>
                        </Link>
                      </div>
                      <button type="button" className="secondary-button" onClick={() => { closeMenus(); logout(); }}>
                        <AppIcon name="logout" />
                        <span>Logout</span>
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          {user ? (
            <>
              <nav className="app-nav app-nav-desktop" aria-label="Primary">
                {primaryNavItems.map((item) => (
                  <NavLink key={item.to} to={item.to} className={getLinkClassName}>
                    {renderNavLabel(item.label, getIconNameForPath(item.to))}
                  </NavLink>
                ))}

                <div className="app-nav-more-shell" ref={desktopMoreMenuRef}>
                  <button
                    type="button"
                    className={`app-nav-link app-nav-more-toggle${isMoreRouteActive ? ' is-active' : ''}`}
                    onClick={toggleMoreMenu}
                  >
                    {renderNavLabel('More', 'more')}
                  </button>
                  {isMoreMenuOpen ? (
                    <div className="app-nav-more-panel">
                      {moreNavItems.map((item) => (
                        <Link key={item.to} to={item.to} className="app-nav-more-link" onClick={closeMenus}>
                          {renderNavLabel(item.label, getIconNameForPath(item.to))}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              </nav>

              <div className="app-guidance-shell">
                <section className={`coach-next-step-bar${isGuideCollapsed ? ' is-collapsed' : ''}`} aria-label="Coach next step">
                  <div className="coach-next-step-topline">
                    <div className="coach-next-step-copy">
                      <div className="coach-next-step-heading">
                        <span className="eyebrow">{coachGuide.eyebrow}</span>
                        <strong>{coachGuide.title}</strong>
                      </div>
                      {!isGuideCollapsed ? <p>{coachGuide.description}</p> : null}
                    </div>
                    <button type="button" className="coach-guide-toggle" onClick={toggleGuide}>
                      {isGuideCollapsed ? 'Show guide' : 'Hide guide'}
                    </button>
                  </div>

                  {!isGuideCollapsed && (coachGuide.primary || coachGuide.secondary) ? (
                    <div className="coach-next-step-actions">
                      {coachGuide.primary ? (
                        <Link
                          className={`secondary-button${coachGuide.primary.variant === 'attention' ? ' is-attention' : ''}`}
                          to={coachGuide.primary.to}
                        >
                          <AppIcon name={getIconNameForPath(coachGuide.primary.to)} />
                          <span>{coachGuide.primary.label}</span>
                        </Link>
                      ) : null}
                      {coachGuide.secondary ? (
                        <Link className="secondary-button" to={coachGuide.secondary.to}>
                          <AppIcon name={getIconNameForPath(coachGuide.secondary.to)} />
                          <span>{coachGuide.secondary.label}</span>
                        </Link>
                      ) : null}
                    </div>
                  ) : null}
                </section>
              </div>
            </>
          ) : null}
        </header>

        {user ? (
          <div className={`app-mobile-top-nav-shell${hasSeenMobileNavScroll ? ' is-scroll-discovered' : ''}`}>
            <nav className="app-mobile-top-nav" aria-label="Mobile navigation" ref={mobileTopNavRef}>
              {mobileBottomNavItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={getBottomLinkClassName}>
                  {renderNavLabel(item.label, getIconNameForPath(item.to))}
                </NavLink>
              ))}
              <button
                type="button"
                className={`app-mobile-nav-link app-mobile-more-toggle${isMoreRouteActive || isMoreMenuOpen ? ' is-active' : ''}`}
                onClick={toggleMoreMenu}
                ref={mobileMoreButtonRef}
              >
                {renderNavLabel('More', 'more')}
              </button>
            </nav>
            {!hasSeenMobileNavScroll ? (
              <div className="app-mobile-top-nav-hint" aria-hidden="true">
                Swipe right for more
              </div>
            ) : null}
          </div>
        ) : null}

        {user && isMobileMenuOpen ? (
          <>
            <button
              type="button"
              className="app-mobile-overlay"
              aria-label="Close menu"
              onClick={closeMenus}
            />
            <aside className="app-mobile-drawer" aria-label="Mobile menu">
              <div className="app-mobile-drawer-header">
                <strong>Menu</strong>
                <button type="button" className="secondary-button" onClick={closeMenus}>
                  <AppIcon name="close" />
                  <span>Close</span>
                </button>
              </div>
              <div className="app-mobile-drawer-content">
                <div className="app-mobile-drawer-list">
                  {mobileMenuItems.map((item) => (
                    <Link key={item.to} to={item.to} className="app-mobile-drawer-link" onClick={closeMenus}>
                      {renderNavLabel(item.label, getIconNameForPath(item.to))}
                    </Link>
                  ))}
                </div>
                <div className="app-mobile-drawer-account">
                  <strong>{user.first_name} {user.last_name}</strong>
                  <span>{user.gym_name}</span>
                  <span>{user.role}</span>
                  <button type="button" className="secondary-button" onClick={() => { closeMenus(); logout(); }}>
                    <AppIcon name="logout" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </aside>
          </>
        ) : null}

        {user && isMoreMenuOpen ? (
          <>
            <button
              type="button"
              className="app-mobile-overlay app-mobile-more-overlay"
              aria-label="Close more menu"
              onClick={closeMenus}
            />
            <div className="app-mobile-more-sheet" ref={mobileMoreSheetRef}>
              <div className="app-mobile-more-sheet-header">
                <strong>More</strong>
                <button type="button" className="secondary-button" onClick={closeMenus}>
                  <AppIcon name="close" />
                  <span>Close</span>
                </button>
              </div>
              <div className="app-mobile-more-sheet-list">
                {moreNavItems.map((item) => (
                  <Link key={item.to} to={item.to} className="app-mobile-more-link" onClick={closeMenus}>
                    {renderNavLabel(item.label, getIconNameForPath(item.to))}
                  </Link>
                ))}
              </div>
            </div>
          </>
        ) : null}

        <main>{children}</main>
      </div>
    </div>
  );
}
