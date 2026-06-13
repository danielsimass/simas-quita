import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AppShell } from './components/layout/app-shell';
import { ProfileSetupRoute } from './components/auth/profile-setup-route';
import { ProtectedRoute } from './components/auth/protected-route';
import { PageLoading } from './components/shared/page-loading';
import { AuthProvider } from './providers/auth-provider';
import { QueryProvider } from './providers/query-provider';
import { ThemeProvider } from './providers/theme-provider';
import { ToastProvider } from './providers/toast-provider';

const DashboardPage = lazy(() =>
  import('./pages/dashboard-page').then((module) => ({ default: module.DashboardPage })),
);
const FinancingsPage = lazy(() =>
  import('./pages/financings-page').then((module) => ({ default: module.FinancingsPage })),
);
const InstallmentsPage = lazy(() =>
  import('./pages/installments-page').then((module) => ({ default: module.InstallmentsPage })),
);
const LoginPage = lazy(() =>
  import('./pages/login-page').then((module) => ({ default: module.LoginPage })),
);
const NotFoundPage = lazy(() =>
  import('./pages/not-found-page').then((module) => ({ default: module.NotFoundPage })),
);
const PrepaymentsPage = lazy(() =>
  import('./pages/prepayments-page').then((module) => ({ default: module.PrepaymentsPage })),
);
const ProfilePage = lazy(() =>
  import('./pages/profile-page').then((module) => ({ default: module.ProfilePage })),
);

function AppRoutes() {
  const navigate = useNavigate();

  return (
    <QueryProvider onUnauthorized={() => navigate('/login', { replace: true })}>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<ProfileSetupRoute />}>
              <Route path="/app" element={<AppShell />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="installments" element={<InstallmentsPage />} />
                <Route path="prepayments" element={<PrepaymentsPage />} />
                <Route path="financings/new" element={<FinancingsPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </QueryProvider>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
