import { Navigate, Route, Routes } from "react-router";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import { Home } from "./pages/Home.jsx";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import GuestRoute from "./auth/GuestRoute.jsx";
import { useAuth } from "./auth/useAuth.js";

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? "/home" : "/signup"} replace />;
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