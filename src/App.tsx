import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/records" element={<Records />} />
          <Route path="/records/update" element={<UpdateChoice />} />
          <Route path="/records/update/existing" element={<NewRecord />} />
          <Route path="/records/update/new" element={<NewRecord />} />
          <Route path="/records/:id" element={<RecordDetail />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
