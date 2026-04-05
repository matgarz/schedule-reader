import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Schedules from "./pages/Schedules";
import GroupSpace from "./pages/GroupSpace";
import Availability from "./pages/Availability";
import AuthPage from "./pages/AuthPage";
import EngineExplainer from "./pages/EngineExplainer";
import JoinCollectiveFocus from "./pages/JoinCollectiveFocus";
import Spinner from "./components/Spinner";
import { ThemeProvider } from "./contexts/ThemeContext";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route element={<ProtectedRoute><JoinCollectiveFocus /></ProtectedRoute>} path="/join-focus" />
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/schedules" element={<Schedules />} />
              <Route path="/availability" element={<Availability />} />
              <Route path="/engine" element={<EngineExplainer />} />
              <Route path="/g/:id" element={<GroupSpace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
