import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import HomePage from './pages/HomePage';
import FeaturesPage from './pages/FeaturesPage';
import FeatureDetailPage from './pages/FeatureDetailPage';
import RoadmapPage from './pages/RoadmapPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminFeaturesPage from './pages/admin/AdminFeaturesPage';
import AdminCommentsPage from './pages/admin/AdminCommentsPage';
import FeatureForm from './components/features/FeatureForm';
import { Spinner } from './components/ui/Spinner';
import { useAuth } from './context/AuthContext';

const AuthLoading = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Spinner size="lg" />
  </div>
);

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <AuthLoading />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  return children;
};

const RequireAdmin = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <AuthLoading />;
  if (!user || user.role !== 'ADMIN') return <Navigate to="/" replace />;

  return children;
};

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />
        <Route path="/features" element={<RequireAuth><FeaturesPage /></RequireAuth>} />
        <Route path="/features/new" element={<RequireAuth><FeatureForm /></RequireAuth>} />
        <Route path="/features/:id" element={<RequireAuth><FeatureDetailPage /></RequireAuth>} />
        <Route path="/roadmap" element={<RequireAuth><RoadmapPage /></RequireAuth>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="features" element={<AdminFeaturesPage />} />
        <Route path="comments" element={<AdminCommentsPage />} />
      </Route>
    </Routes>
  );
}
