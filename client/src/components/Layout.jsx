import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isOwner = user?.role === 'owner';
  const searchParams = new URLSearchParams(location.search);
  const workflow = searchParams.get('workflow') || '';

  const coachGuide = (() => {
    if (location.pathname === '/dashboard') {
      return {
        eyebrow: 'Coach guide',
        title: 'Use Start Here for setup, or Quick Actions for today’s work.',
        description: 'This stays flexible on purpose so owners can either keep onboarding the gym or jump straight into the job that matters right now.',
        primary: null,
        secondary: { label: 'Need attendance?', to: '/classes?workflow=attendance-ready' }
      };
    }

    if (location.pathname === '/programs') {
      return {
        eyebrow: 'Best next move',
        title: 'After programs, add the topics that make those tracks usable.',
        description: 'Programs give structure, but topics are what connect planning, classes, Library, and the Decision Tree.',
        primary: { label: 'Go to Curriculum Index', to: '/index' },
        secondary: { label: 'Plan classes', to: '/planned-classes' }
      };
    }

    if (location.pathname === '/index') {
      return {
        eyebrow: 'Best next move',
        title: 'After topics are in place, use them in planning or attach resources to them.',
        description: 'The Index becomes most valuable once coaches are actively planning classes or linking resources around the topics they just added.',
        primary: { label: 'Plan classes', to: '/planned-classes' },
        secondary: { label: 'Open Library', to: '/library' }
      };
    }

    if (location.pathname === '/planned-classes') {
      return {
        eyebrow: 'Best next move',
        title: 'Build the class first, then finish it later in Completed Classes.',
        description: 'Planning is the setup step. After class happens, use Classes to clean up attendance, topics, and training entries.',
        primary: { label: 'Finished a class?', to: '/classes?workflow=today-completed' },
        secondary: { label: 'Add scenarios', to: '/training-scenarios' }
      };
    }

    if (location.pathname === '/classes' && workflow === 'attendance-ready') {
      return {
        eyebrow: 'Coach workflow',
        title: 'Record attendance first, then fill in missing topics or training entries only if needed.',
        description: 'This workflow is meant to reduce clutter. Open the class that still needs attention and finish the session from there.',
        primary: null,
        secondary: { label: 'View all classes', to: '/classes' }
      };
    }

    if (location.pathname === '/classes') {
      return {
        eyebrow: 'Best next move',
        title: 'Use this page to finish class admin after training actually happened.',
        description: 'Classes work best after planning exists, attendance is recorded, and coaches are filling in only the details that still matter.',
        primary: { label: 'Need attendance?', to: '/classes?workflow=attendance-ready' },
        secondary: { label: 'View members', to: '/members' }
      };
    }

    if (location.pathname === '/training-scenarios') {
      return {
        eyebrow: 'Best next move',
        title: 'After building a scenario, reuse it in planning or live class logs.',
        description: 'Scenarios help classes feel repeatable instead of rebuilt from scratch every time.',
        primary: { label: 'Use in Planned Classes', to: '/planned-classes' },
        secondary: { label: 'Use in Classes', to: '/classes?workflow=create-class' }
      };
    }

    if (location.pathname === '/library') {
      return {
        eyebrow: 'Best next move',
        title: 'Library is strongest when resources stay tied to real curriculum topics.',
        description: 'If a resource feels disconnected, go link or add the topic first so coaches and members can actually find it later.',
        primary: { label: 'Go to Curriculum Index', to: '/index' },
        secondary: { label: 'Open Decision Tree', to: '/decision-tree' }
      };
    }

    if (location.pathname === '/members') {
      return {
        eyebrow: 'Best next move',
        title: 'After members are added, make attendance and progress do the real work.',
        description: 'Members become useful once coaches are checking them in and logging what they are learning over time.',
        primary: { label: 'Need attendance?', to: '/classes?workflow=attendance-ready' },
        secondary: { label: 'Open Decision Tree', to: '/decision-tree' }
      };
    }

    if (location.pathname === '/decision-tree') {
      return {
        eyebrow: 'Coach guide',
        title: 'Use the Tree to narrow paths, then go back into classes, topics, or Library when you want to operationalize it.',
        description: 'This is the thinking layer. The other pages turn those ideas into real class plans, resources, and recorded progress.',
        primary: { label: 'Open Curriculum Index', to: '/index' },
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

  return (
    <div className="app-shell">
      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">Progressory</h1>

          {user && (
            <>
              <p className="app-subtitle">
                Logged in as {user.first_name} {user.last_name} ({user.gym_name}) — {user.role}
              </p>

              <nav className="app-nav">
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/programs">Programs</Link>
                <Link to="/index">Curriculum Index</Link>
                <Link to="/decision-tree">Decision Tree</Link>
                <Link to="/planned-classes">Planned Classes</Link>
                <Link to="/classes">Classes</Link>
                <Link to="/training-scenarios">Training Scenarios</Link>
                <Link to="/reports">Reports</Link>
                <Link to="/library">Library</Link>
                <Link to="/members">Members</Link>
                {isOwner && <Link to="/staff">Staff</Link>}
              </nav>

              <div className="app-guidance-row">
                <section className="coach-next-step-bar" aria-label="Coach next step">
                  <div className="coach-next-step-copy">
                    <div className="coach-next-step-heading">
                      <span className="eyebrow">{coachGuide.eyebrow}</span>
                      <strong>{coachGuide.title}</strong>
                    </div>
                    <p>{coachGuide.description}</p>
                  </div>
                  {(coachGuide.primary || coachGuide.secondary) ? (
                    <div className="coach-next-step-actions">
                      {coachGuide.primary ? (
                        <Link className="secondary-button" to={coachGuide.primary.to}>
                          {coachGuide.primary.label}
                        </Link>
                      ) : null}
                      {coachGuide.secondary ? (
                        <Link className="secondary-button" to={coachGuide.secondary.to}>
                          {coachGuide.secondary.label}
                        </Link>
                      ) : null}
                    </div>
                  ) : null}
                </section>

                <div className="logout-row">
                  <button className="secondary-button" onClick={logout}>
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}
