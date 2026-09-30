import { Route, Routes } from "react-router";
import SignIn from "./pages/SignIn.jsx";
import { Home } from "./pages/Home.jsx";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route index element={<SignIn />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Home />} path="home" />
      </Route>
    </Routes>
  )
}