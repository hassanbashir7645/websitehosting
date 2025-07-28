import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import PsychometricTest from "@/pages/psychometric-test";
import TestResults from "@/pages/test-results";
import PsychometricAdmin from "@/pages/psychometric-admin";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
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
      {/* Public psychometric test - accessible without authentication */}
      <Route path="/psychometric-test" component={PsychometricTest} />
      <Route path="/test-results" component={TestResults} />
      
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <MainLayout>
          <Route path="/">
            <Dashboard />
          </Route>
          <Route path="/psychometric-admin" component={PsychometricAdmin} />
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
