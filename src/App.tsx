import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { DataSyncProvider } from "./contexts/DataSyncContext";
import AuthPage from "./pages/Auth";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import LandingSimple from "./pages/LandingSimple";
import NotFound from "./pages/NotFound";
import Transactions from "./pages/Transactions";
import Accounts from "./pages/Accounts";
import PlanejamentoPessoal from "./pages/PlanejamentoPessoal";
import Patients from "./pages/Patients";
import PatientRegistration from "./pages/PatientRegistration";
import PatientDetails from "./pages/PatientDetails";
import DashboardBusiness from "./pages/DashboardBusiness";
import Categories from "./pages/Categories";
import UserManagement from "./pages/UserManagement";
import Objetivos from "./pages/Objetivos";

const queryClient = new QueryClient();

const App = () => {
  console.log("App rendering...");

  try {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <DataSyncProvider>
              <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/" element={<Landing />} />
                <Route path="/test" element={<LandingSimple />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard-business"
                  element={
                    <ProtectedRoute>
                      <DashboardBusiness />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/transações"
                  element={
                    <ProtectedRoute>
                      <Transactions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/contas"
                  element={
                    <ProtectedRoute>
                      <Accounts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/categorias"
                  element={
                    <ProtectedRoute>
                      <Categories />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/planejamento-pessoal"
                  element={
                    <ProtectedRoute>
                      <PlanejamentoPessoal />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/objetivos"
                  element={
                    <ProtectedRoute>
                      <Objetivos />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pacientes"
                  element={
                    <ProtectedRoute>
                      <Patients />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cadastro-paciente"
                  element={
                    <ProtectedRoute>
                      <PatientRegistration />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/paciente/:id"
                  element={
                    <ProtectedRoute>
                      <PatientDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/usuarios"
                  element={
                    <ProtectedRoute>
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </TooltipProvider>
            </DataSyncProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error("App render error:", error);
    return <div>Erro na aplicação: {String(error)}</div>;
  }
};

export default App;
