import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Layout({ children }) {
  const { user, logout } = useAuth();

  const isOwner = user?.role === 'owner';

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
                <Link to="/index">Index</Link>
                <Link to="/topics">Topics</Link>
                <Link to="/planned-classes">Planned Classes</Link>
                <Link to="/classes">Classes</Link>
                <Link to="/reports">Reports</Link>
                <Link to="/library">Library</Link>
                <Link to="/members">Members</Link>
                {isOwner && <Link to="/staff">Staff</Link>}
              </nav>

              <div className="logout-row">
                <button className="secondary-button" onClick={logout}>
                  Logout
                </button>
              </div>
            </>
          )}
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}
