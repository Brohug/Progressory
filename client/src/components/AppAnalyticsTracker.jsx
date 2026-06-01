import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';

const PUBLIC_PATHS = new Set([
  '/',
  '/login',
  '/register',
  '/terms',
  '/privacy',
  '/acceptable-use',
  '/child-safety'
]);
const INTERNAL_ONLY_PATHS = new Set([
  '/platform-admin',
  '/platform-analytics'
]);

const shouldTrackPath = (pathname, user) => {
  if (!user || !pathname) {
    return false;
  }

  return !PUBLIC_PATHS.has(pathname) && !INTERNAL_ONLY_PATHS.has(pathname);
};

const postPageExitWithKeepalive = async ({ pagePath, durationSeconds }) => {
  const token = localStorage.getItem('token');
  if (!token || !pagePath) {
    return;
  }

  const payload = JSON.stringify({
    page_path: pagePath,
    duration_seconds: durationSeconds
  });

  try {
    await fetch(`${api.defaults.baseURL}/analytics/page-exit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: payload,
      keepalive: true
    });
  } catch {
    // Ignore analytics failures silently.
  }
};

export default function AppAnalyticsTracker() {
  const location = useLocation();
  const { user, isAuthReady } = useAuth();
  const activePageRef = useRef({
    pathname: '',
    startedAt: 0
  });

  useEffect(() => {
    if (!isAuthReady) {
      return undefined;
    }

    const nextPathname = location.pathname;
    const previousPage = activePageRef.current;

    if (previousPage.pathname && previousPage.pathname !== nextPathname && shouldTrackPath(previousPage.pathname, user)) {
      const durationSeconds = Math.max(0, Math.round((Date.now() - previousPage.startedAt) / 1000));
      api.post('/analytics/page-exit', {
        page_path: previousPage.pathname,
        duration_seconds: durationSeconds
      }).catch(() => {});
    }

    if (shouldTrackPath(nextPathname, user)) {
      activePageRef.current = {
        pathname: nextPathname,
        startedAt: Date.now()
      };

      api.post('/analytics/page-view', {
        page_path: nextPathname
      }).catch(() => {});
    } else {
      activePageRef.current = {
        pathname: '',
        startedAt: 0
      };
    }

    return undefined;
  }, [isAuthReady, location.pathname, user]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentPage = activePageRef.current;

      if (!shouldTrackPath(currentPage.pathname, user)) {
        return;
      }

      const durationSeconds = Math.max(0, Math.round((Date.now() - currentPage.startedAt) / 1000));
      postPageExitWithKeepalive({
        pagePath: currentPage.pathname,
        durationSeconds
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  return null;
}
