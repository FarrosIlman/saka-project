import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

// Loading fallback component
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#94a3b8' }}>
    <div>Loading...</div>
  </div>
);

// Lazy load pages for code-splitting
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const LevelSelectionPage = React.lazy(() => import('./pages/LevelSelectionPage'));
const QuizPage = React.lazy(() => import('./pages/QuizPage'));
const StudentProfilePage = React.lazy(() => import('./pages/StudentProfilePage'));
const UserProfilePage = React.lazy(() => import('./pages/UserProfilePage'));
const AdminLayout = React.lazy(() => import('./admin/components/AdminLayout'));
const AdminDashboardPage = React.lazy(() => import('./admin/pages/AdminDashboardPage'));
const UserManagementPage = React.lazy(() => import('./admin/pages/UserManagementPage'));
const UserEditPage = React.lazy(() => import('./admin/pages/UserEditPage'));
const StudentScoresPage = React.lazy(() => import('./admin/pages/StudentScoresPage'));
const LevelManagementPage = React.lazy(() => import('./admin/pages/LevelManagementPage'));
const LevelEditPage = React.lazy(() => import('./admin/pages/LevelEditPage'));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          {/* Tambahkan properti future di sini untuk menghilangkan warning v7 */}
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Suspense fallback={<PageLoader />}><LandingPage /></Suspense>} />
              <Route path="/login" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
              <Route path="/register" element={<Suspense fallback={<PageLoader />}><RegisterPage /></Suspense>} />

              <Route
                path="/levels"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <Suspense fallback={<PageLoader />}><LevelSelectionPage /></Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz/:levelNumber"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <Suspense fallback={<PageLoader />}><QuizPage /></Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/profile"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <Suspense fallback={<PageLoader />}><StudentProfilePage /></Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['student', 'admin']}>
                    <Suspense fallback={<PageLoader />}><UserProfilePage /></Suspense>
                  </ProtectedRoute>
                }
              />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Suspense fallback={<PageLoader />}><AdminLayout /></Suspense>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><AdminDashboardPage /></Suspense>} />
            <Route path="users" element={<Suspense fallback={<PageLoader />}><UserManagementPage /></Suspense>} />
            <Route path="users/new" element={<Suspense fallback={<PageLoader />}><UserEditPage /></Suspense>} />
            <Route path="users/:userId/edit" element={<Suspense fallback={<PageLoader />}><UserEditPage /></Suspense>} />
            <Route path="users/:userId/scores" element={<Suspense fallback={<PageLoader />}><StudentScoresPage /></Suspense>} />
            <Route path="content/levels" element={<Suspense fallback={<PageLoader />}><LevelManagementPage /></Suspense>} />
            <Route path="content/levels/new" element={<Suspense fallback={<PageLoader />}><LevelEditPage /></Suspense>} />
            <Route path="content/levels/:levelId/edit" element={<Suspense fallback={<PageLoader />}><LevelEditPage /></Suspense>} />
            <Route path="levels/:levelId/edit" element={<Suspense fallback={<PageLoader />}><LevelEditPage /></Suspense>} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </Suspense>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;