import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from './components/ProtectedRoute';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const MemberAccessPage = lazy(() => import('./pages/MemberAccessPage'));
const StaffAccessPage = lazy(() => import('./pages/StaffAccessPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProgramsPage = lazy(() => import('./pages/ProgramsPage'));
const TopicsPage = lazy(() => import('./pages/TopicsPage'));
const ClassesPage = lazy(() => import('./pages/ClassesPage'));
const PlannedClassesPage = lazy(() => import('./pages/PlannedClassesPage'));
const TrainingScenariosPage = lazy(() => import('./pages/TrainingScenariosPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const LibraryPage = lazy(() => import('./pages/LibraryPage'));
const MembersPage = lazy(() => import('./pages/MembersPage'));
const StaffPage = lazy(() => import('./pages/StaffPage'));
const CurriculumIndexPage = lazy(() => import('./pages/CurriculumIndexPage'));
const DecisionTreePage = lazy(() => import('./pages/DecisionTreePage'));
const MyProgressPage = lazy(() => import('./pages/MyProgressPage'));
const MyAccountPage = lazy(() => import('./pages/MyAccountPage'));
const BillingPage = lazy(() => import('./pages/BillingPage'));

const STAFF_ROLES = ['owner', 'admin', 'coach'];
const MANAGEMENT_ROLES = ['owner', 'admin'];

function RouteFallback() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      Loading page...
    </div>
  );
}

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.search]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/member-access/:token" element={<MemberAccessPage />} />
            <Route path="/staff-access/:token" element={<StaffAccessPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/programs"
              element={
                <ProtectedRoute allowedRoles={MANAGEMENT_ROLES}>
                  <ProgramsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/topics"
              element={
                <ProtectedRoute allowedRoles={MANAGEMENT_ROLES}>
                  <TopicsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/index"
              element={
                <ProtectedRoute allowedRoles={['owner', ...STAFF_ROLES.slice(1), 'member']}>
                  <CurriculumIndexPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/decision-tree"
              element={
                <ProtectedRoute allowedRoles={['owner', ...STAFF_ROLES.slice(1), 'member']}>
                  <DecisionTreePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/planned-classes"
              element={
                <ProtectedRoute allowedRoles={['owner', ...STAFF_ROLES.slice(1), 'member']}>
                  <PlannedClassesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/classes"
              element={
                <ProtectedRoute allowedRoles={STAFF_ROLES}>
                  <ClassesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training-scenarios"
              element={
                <ProtectedRoute allowedRoles={STAFF_ROLES}>
                  <TrainingScenariosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={STAFF_ROLES}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/library"
              element={
                <ProtectedRoute allowedRoles={['owner', ...STAFF_ROLES.slice(1), 'member']}>
                  <LibraryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/members"
              element={
                <ProtectedRoute allowedRoles={STAFF_ROLES}>
                  <MembersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRoles={['owner']}>
                  <StaffPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-progress"
              element={
                <ProtectedRoute allowedRoles={['member']}>
                  <MyProgressPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute allowedRoles={['owner', ...STAFF_ROLES.slice(1), 'member']}>
                  <MyAccountPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing"
              element={
                <ProtectedRoute allowedRoles={['owner']}>
                  <BillingPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
