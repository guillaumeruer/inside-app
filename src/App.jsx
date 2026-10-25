import { Navigate, Route, Routes } from 'react-router';
import SignIn from '@/pages/SignInPage';
import SignUp from '@/pages/SignUpPage';
import { Home } from '@/pages/home/HomePage';
import ProtectedRoute from '@/features/auth/ProtectedRoute';
import GuestRoute from '@/features/auth/GuestRoute';
import { useAuth } from '@/features/auth/useAuth';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? '/home' : '/signup'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route index element={<RootRedirect />} />

      <Route element={<GuestRoute />}>
        <Route path="login" element={<SignIn />} />
        <Route path="signup" element={<SignUp />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="home" element={<Home />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
