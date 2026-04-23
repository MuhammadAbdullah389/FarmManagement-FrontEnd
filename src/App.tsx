import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewRecord from "./pages/NewRecord";
import Records from "./pages/Records";
import RecordDetail from "./pages/RecordDetail";
import Reports from "./pages/Reports";
import Contact from "./pages/Contact";
import UpdateChoice from "./pages/UpdateChoice";
import HR from "./pages/HR";
import Superadmin from "./pages/Superadmin";
import NotFound from "./pages/NotFound";
import { api } from "@/lib/api";

const queryClient = new QueryClient();

type RequiredRole = "admin" | "superadmin";

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: RequiredRole }) {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(Boolean(localStorage.getItem("auth_user")));
  const [currentRole, setCurrentRole] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      try {
        const user = await api.getCurrentUser();
        if (!active) return;
        localStorage.setItem("auth_user", JSON.stringify(user));
        setAuthorized(true);
        setCurrentRole(user.role);
      } catch {
        if (!active) return;
        localStorage.removeItem("auth_user");
        setAuthorized(false);
        setCurrentRole(null);
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    };

    checkAuth();
    return () => {
      active = false;
    };
  }, []);

  if (checking) {
    return null;
  }

  if (!authorized) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && currentRole !== requiredRole) {
    if (currentRole === "superadmin") {
      return <Navigate to="/superadmin" replace />;
    }
    return <Navigate to="/records" replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute requiredRole="admin"><Dashboard /></ProtectedRoute>} />
          <Route path="/records" element={<ProtectedRoute><Records /></ProtectedRoute>} />
          <Route path="/records/update" element={<ProtectedRoute requiredRole="admin"><UpdateChoice /></ProtectedRoute>} />
          <Route path="/records/update/existing" element={<ProtectedRoute requiredRole="admin"><NewRecord /></ProtectedRoute>} />
          <Route path="/records/update/new" element={<ProtectedRoute requiredRole="admin"><NewRecord /></ProtectedRoute>} />
          <Route path="/hr" element={<ProtectedRoute requiredRole="admin"><HR /></ProtectedRoute>} />
          <Route path="/superadmin" element={<Superadmin />} />
          <Route path="/records/:date" element={<ProtectedRoute><RecordDetail /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Analytics />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
