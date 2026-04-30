import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from './components/ProtectedRoute';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const MemberAccessPage = lazy(() => import('./pages/MemberAccessPage'));
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

const STAFF_ROLES = ['owner', 'admin', 'coach'];

function RouteFallback() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      Loading page...
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/member-access/:token" element={<MemberAccessPage />} />
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
                <ProtectedRoute allowedRoles={STAFF_ROLES}>
                  <ProgramsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/topics"
              element={
                <ProtectedRoute allowedRoles={STAFF_ROLES}>
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
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
