import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, ListTodo, Shield, ArrowUp, Clock, TriangleAlert, Check, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import StatsCard from "@/components/dashboard/stats-card";
import ActivityFeed from "@/components/dashboard/activity-feed";
import QuickActions from "@/components/dashboard/quick-actions";
import PendingApprovals from "@/components/dashboard/pending-approvals";
import DemoBanner from "@/components/demo-banner";
import { DEMO_MODE } from "@/lib/mockData";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['/api/dashboard/activities'],
  });

  const { data: approvals, isLoading: approvalsLoading } = useQuery({
    queryKey: ['/api/dashboard/approvals'],
  });

  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['/api/employees'],
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks'],
  });

  if (statsLoading || activitiesLoading || approvalsLoading) {
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
      title: "Total Employees",
      value: stats?.totalEmployees || 0,
      change: "+12%",
      changeType: "increase" as const,
      icon: Users,
      color: "bg-blue-100 text-blue-700",
      onClick: () => setLocation('/employees')
    },
    {
      title: "Active Onboarding",
      value: stats?.activeOnboarding || 0,
      change: "5 pending approvals",
      changeType: "neutral" as const,
      icon: UserPlus,
      color: "bg-yellow-100 text-yellow-700",
      onClick: () => setLocation('/onboarding')
    },
    {
      title: "Open Tasks",
      value: stats?.openTasks || 0,
      change: "8 overdue",
      changeType: "decrease" as const,
      icon: ListTodo,
      color: "bg-purple-100 text-purple-700",
      onClick: () => setLocation('/tasks')
    },
    {
      title: "Department Compliance",
      value: `${stats?.complianceRate || 0}%`,
      change: "Above target",
      changeType: "increase" as const,
      icon: Shield,
      color: "bg-accent/10 text-accent",
      onClick: () => setLocation('/analytics')
    }
  ];

  const recentEmployees = employees?.slice(0, 3) || [];
  const taskStats = {
    completed: 78,
    inProgress: 15,
    overdue: 7
  };

  const urgentTasks = tasks?.filter(task => task.priority === 'urgent').slice(0, 2) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Demo Banner */}
      {DEMO_MODE && <DemoBanner />}
      
      {/* Welcome Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">Welcome back, here's what's happening today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <ActivityFeed activities={activities || []} isLoading={activitiesLoading} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <QuickActions />
          <PendingApprovals approvals={approvals || []} isLoading={approvalsLoading} />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Employees */}
        <Card className="stats-card">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">Recent Employees</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary hover:text-primary/80"
                onClick={() => setLocation('/employees')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {employeesLoading ? (
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
              ) : recentEmployees.length > 0 ? (
                recentEmployees.map((employee, index) => (
                  <div key={employee.id} className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="text-white" size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">
                        {employee.user.firstName} {employee.user.lastName}
                      </p>
                      <p className="text-gray-500 text-sm">{employee.user.position}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={`${employee.user.status === 'active' ? 'status-active' : 'status-pending'}`}>
                        {employee.user.status}
                      </Badge>
                      <p className="text-gray-500 text-xs mt-1">
                        {employee.user.startDate ? 
                          `Started ${new Date(employee.user.startDate).toLocaleDateString()}` : 
                          'No start date'
                        }
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="mx-auto mb-4 text-gray-400" size={48} />
                  <p>No recent employees found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Task Overview */}
        <Card className="stats-card">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">Task Overview</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary hover:text-primary/80"
                onClick={() => setLocation('/tasks')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Progress Bars */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Completed</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-accent h-2 rounded-full progress-fill" style={{ width: `${taskStats.completed}%` }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{taskStats.completed}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">In Progress</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-warning h-2 rounded-full progress-fill" style={{ width: `${taskStats.inProgress}%` }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{taskStats.inProgress}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Overdue</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-destructive h-2 rounded-full progress-fill" style={{ width: `${taskStats.overdue}%` }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{taskStats.overdue}%</span>
                  </div>
                </div>
              </div>

              {/* Urgent ListTodo */}
              <div className="mt-6 space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Urgent ListTodo</h4>
                {tasksLoading ? (
                  <div className="space-y-2">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 animate-pulse">
                        <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : urgentTasks.length > 0 ? (
                  urgentTasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-destructive rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{task.title}</p>
                        <p className="text-xs text-gray-500">
                          Assigned to: {task.assignedToUser?.firstName} {task.assignedToUser?.lastName}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Check className="mx-auto mb-2 text-gray-400" size={24} />
                    <p className="text-sm">No urgent tasks</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
