import { Route, Routes } from "react-router";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import { Home } from "./pages/Home.jsx";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route index element={<SignIn />} path="login" />
      <Route element={<SignUp />} path="signup" />
      <Route element={<ProtectedRoute />}>
        <Route element={<Home />} path="home" />
      </Route>
    </Routes>
  )
}