import { Suspense, lazy, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext.jsx";
import { FounderOnboardingProvider } from './context/FounderOnboardingContext.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import AppAnalyticsTracker from './components/AppAnalyticsTracker.jsx';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const AcceptableUsePage = lazy(() => import('./pages/AcceptableUsePage'));
const ChildSafetyPage = lazy(() => import('./pages/ChildSafetyPage'));
const MemberAccessPage = lazy(() => import('./pages/MemberAccessPage'));
const StaffAccessPage = lazy(() => import('./pages/StaffAccessPage'));
const PublicCheckInPage = lazy(() => import('./pages/PublicCheckInPage'));
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
const EntrySetupsPage = lazy(() => import('./pages/EntrySetupsPage'));
const MyProgressPage = lazy(() => import('./pages/MyProgressPage'));
const MyAccountPage = lazy(() => import('./pages/MyAccountPage'));
const BillingPage = lazy(() => import('./pages/BillingPage'));
const PlatformAdminPage = lazy(() => import('./pages/PlatformAdminPage'));
const PlatformAnalyticsPage = lazy(() => import('./pages/PlatformAnalyticsPage'));
const CheckInToolsPage = lazy(() => import('./pages/CheckInToolsPage'));
const SuspendedPage = lazy(() => import('./pages/SuspendedPage'));

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
  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    if (previousPathRef.current === location.pathname) {
      return;
    }

    previousPathRef.current = location.pathname;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <FounderOnboardingProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AppAnalyticsTracker />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/acceptable-use" element={<AcceptableUsePage />} />
            <Route path="/child-safety" element={<ChildSafetyPage />} />
            <Route path="/member-access/:token" element={<MemberAccessPage />} />
            <Route path="/staff-access/:token" element={<StaffAccessPage />} />
            <Route path="/check-in/:slug" element={<PublicCheckInPage />} />
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
              path="/entry-setups"
              element={
                <ProtectedRoute allowedRoles={['owner', ...STAFF_ROLES.slice(1), 'member']}>
                  <EntrySetupsPage />
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
                <ProtectedRoute allowedRoles={['owner', ...STAFF_ROLES.slice(1), 'member']}>
                  <BillingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/platform-admin"
              element={
                <ProtectedRoute requirePlatformAdmin>
                  <PlatformAdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/platform-analytics"
              element={
                <ProtectedRoute requirePlatformAdmin>
                  <PlatformAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/check-in-tools"
              element={
                <ProtectedRoute allowedRoles={STAFF_ROLES}>
                  <CheckInToolsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/suspended"
              element={
                <ProtectedRoute allowedRoles={['owner', ...STAFF_ROLES.slice(1), 'member']}>
                  <SuspendedPage />
                </ProtectedRoute>
              }
            />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </FounderOnboardingProvider>
    </AuthProvider>
  );
}
