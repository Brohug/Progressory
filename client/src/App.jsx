import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from './components/ProtectedRoute';

const LoginPage = lazy(() => import('./pages/LoginPage'));
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
                <ProtectedRoute>
                  <ProgramsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/topics"
              element={
                <ProtectedRoute>
                  <TopicsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/index"
              element={
                <ProtectedRoute>
                  <CurriculumIndexPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/planned-classes"
              element={
                <ProtectedRoute>
                  <PlannedClassesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/classes"
              element={
                <ProtectedRoute>
                  <ClassesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training-scenarios"
              element={
                <ProtectedRoute>
                  <TrainingScenariosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/library"
              element={
                <ProtectedRoute>
                  <LibraryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/members"
              element={
                <ProtectedRoute>
                  <MembersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff"
              element={
                <ProtectedRoute>
                  <StaffPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
