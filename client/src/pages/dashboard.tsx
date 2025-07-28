import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Users, Target, BarChart3, ArrowUp, Clock, TriangleAlert, Check, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import StatsCard from "@/components/dashboard/stats-card";
import DemoBanner from "@/components/demo-banner";
import { DEMO_MODE } from "@/lib/mockData";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/psychometric-tests'],
  });

  const { data: attempts, isLoading: attemptsLoading } = useQuery({
    queryKey: ['/api/psychometric-test-attempts'],
  });

  const { data: candidates, isLoading: candidatesLoading } = useQuery({
    queryKey: ['/api/candidates'],
  });

  if (statsLoading || attemptsLoading || candidatesLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stats-card animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statsData = [
    {
      title: "Active Tests",
      value: stats?.filter(t => t.isActive)?.length || 0,
      change: "4 test types",
      changeType: "increase" as const,
      icon: Brain,
      color: "bg-blue-100 text-blue-700",
      onClick: () => setLocation('/psychometric-admin')
    },
    {
      title: "Test Attempts",
      value: attempts?.length || 0,
      change: "This month",
      changeType: "neutral" as const,
      icon: Users,
      color: "bg-yellow-100 text-yellow-700",
      onClick: () => setLocation('/candidates')
    },
    {
      title: "Completed Tests",
      value: attempts?.filter(a => a.status === 'completed')?.length || 0,
      change: "Success rate",
      changeType: "decrease" as const,
      icon: Target,
      color: "bg-purple-100 text-purple-700",
      onClick: () => setLocation('/test-results-admin')
    },
    {
      title: "Analytics Score",
      value: `${Math.round((attempts?.filter(a => a.status === 'completed')?.length || 0) / Math.max(attempts?.length || 1, 1) * 100)}%`,
      change: "Platform health",
      changeType: "increase" as const,
      icon: BarChart3,
      color: "bg-accent/10 text-accent",
      onClick: () => setLocation('/analytics')
    }
  ];

  const recentAttempts = attempts?.slice(0, 5) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Demo Banner */}
      {DEMO_MODE && <DemoBanner />}
      
      {/* Welcome Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Psychometric Testing Dashboard</h2>
        <p className="text-gray-600 mt-1">Monitor test performance and candidate assessments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Test Attempts */}
        <div className="lg:col-span-2">
          <Card className="stats-card">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">Recent Test Attempts</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary hover:text-primary/80"
                  onClick={() => setLocation('/test-results-admin')}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {attemptsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 animate-pulse">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentAttempts.length > 0 ? (
                  recentAttempts.map((attempt, index) => (
                    <div key={attempt.id} className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Brain className="text-white" size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">
                          {attempt.candidateName}
                        </p>
                        <p className="text-gray-500 text-sm">{attempt.candidateEmail}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={`${attempt.status === 'completed' ? 'status-active' : 'status-pending'}`}>
                          {attempt.status}
                        </Badge>
                        <p className="text-gray-500 text-xs mt-1">
                          {attempt.percentageScore ? `${attempt.percentageScore}%` : 'In Progress'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="mx-auto mb-4 text-gray-400" size={48} />
                    <p>No test attempts yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <Card className="stats-card">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <Button
                variant="ghost"
                onClick={() => setLocation('/psychometric-admin')}
                className="w-full justify-start space-x-3 bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <Brain className="text-primary" size={16} />
                <span className="text-gray-900 font-medium">Manage Tests</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setLocation('/candidates')}
                className="w-full justify-start space-x-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <Users className="text-gray-600" size={16} />
                <span className="text-gray-900 font-medium">View Candidates</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setLocation('/analytics')}
                className="w-full justify-start space-x-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <BarChart3 className="text-gray-600" size={16} />
                <span className="text-gray-900 font-medium">View Analytics</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
