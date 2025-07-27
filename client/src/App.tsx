import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Employees from "@/pages/employees";
import Onboarding from "@/pages/onboarding";
import EmployeeOnboardingPortal from "@/pages/employee-onboarding-portal";
import PsychometricTest from "@/pages/psychometric-test";
import TestResults from "@/pages/test-results";
import PsychometricAdmin from "@/pages/psychometric-admin";
import Tasks from "@/pages/tasks";
import TaskDetail from "@/pages/task-detail";
import TaskRequests from "@/pages/task-requests";
import Announcements from "@/pages/announcements";
import Recognition from "@/pages/recognition";
import Logistics from "@/pages/logistics";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import EmployeeDashboard from "@/pages/employee-dashboard";
import Departments from "@/pages/departments";
import OnboardingChecklistManager from "@/pages/onboarding-checklist-manager";
import EmployeeOnboardingStep1 from "@/pages/employee-onboarding-step1";
import HROnboardingStep2 from "@/pages/hr-onboarding-step2";
import EmployeeOnboardingPDFExport from "@/components/employee-onboarding-pdf-export";
import LogisticsPDFExport from "@/components/logistics-pdf-export";
import MainLayout from "@/components/layout/main-layout";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public onboarding portal - accessible without authentication */}
      <Route path="/onboarding-portal" component={EmployeeOnboardingPortal} />
      <Route path="/employee-onboarding" component={EmployeeOnboardingStep1} />
      {/* Public psychometric test - accessible without authentication */}
      <Route path="/psychometric-test" component={PsychometricTest} />
      <Route path="/test-results" component={TestResults} />
      
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <MainLayout>
          <Route path="/">
            {user?.role === 'employee' ? <EmployeeDashboard /> : <Dashboard />}
          </Route>
          <Route path="/employee" component={EmployeeDashboard} />
          <Route path="/employees" component={Employees} />
          <Route path="/departments" component={Departments} />
          <Route path="/onboarding" component={Onboarding} />
          <Route path="/onboarding-checklist-manager" component={OnboardingChecklistManager} />
          <Route path="/hr-onboarding" component={HROnboardingStep2} />
          <Route path="/onboarding-pdf-export" component={EmployeeOnboardingPDFExport} />
          <Route path="/logistics-pdf-export" component={LogisticsPDFExport} />
          <Route path="/psychometric-admin" component={PsychometricAdmin} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/tasks/:id" component={TaskDetail} />
          <Route path="/task-requests" component={TaskRequests} />
          <Route path="/announcements" component={Announcements} />
          <Route path="/recognition" component={Recognition} />
          <Route path="/logistics" component={Logistics} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/settings" component={Settings} />
        </MainLayout>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
