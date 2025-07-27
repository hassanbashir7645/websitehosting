import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Award, 
  Download,
  Calendar,
  PieChart,
  Target,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Task, Employee, Recognition, LogisticsRequest } from '@/types';

export default function Analytics() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('month');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['/api/employees', { department: departmentFilter }],
    retry: false,
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks'],
    retry: false,
  });

  const { data: recognitions, isLoading: recognitionsLoading } = useQuery({
    queryKey: ['/api/recognition'],
    retry: false,
  });

  const { data: logisticsRequests, isLoading: logisticsLoading } = useQuery({
    queryKey: ['/api/logistics/requests'],
    retry: false,
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    retry: false,
  });

  const canViewAnalytics = user?.role && ['hr_admin', 'branch_manager'].includes(user.role);

  if (!canViewAnalytics) {
    return (
      <div className="p-6">
        <Card className="stats-card">
          <CardContent className="p-12 text-center">
            <BarChart3 className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">You don't have permission to view analytics</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLoading = employeesLoading || tasksLoading || recognitionsLoading || logisticsLoading;

  // Calculate metrics
  const totalEmployees = employees?.length || 0;
  const activeEmployees = employees?.filter((emp: Employee) => emp.user.status === 'active').length || 0;
  const onboardingEmployees = employees?.filter((emp: Employee) => emp.user.status === 'onboarding').length || 0;
  
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter((task: Task) => task.status === 'completed').length || 0;
  const overdueTasks = tasks?.filter((task: Task) => task.status === 'overdue').length || 0;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalRecognitions = recognitions?.filter((rec: Recognition) => rec.isApproved).length || 0;
  const thisMonthRecognitions = recognitions?.filter((rec: Recognition) => 
    rec.isApproved && new Date(rec.createdAt).getMonth() === new Date().getMonth()
  ).length || 0;

  const pendingLogisticsRequests = logisticsRequests?.filter((req: LogisticsRequest) => req.status === 'pending').length || 0;

  // Department breakdown
  const departments = [...new Set(employees?.map((emp: Employee) => emp.user.department).filter(Boolean) || [])];
  const departmentStats = departments.map(dept => ({
    name: dept,
    count: employees?.filter((emp: Employee) => emp.user.department === dept).length || 0,
    percentage: totalEmployees > 0 ? Math.round((employees?.filter((emp: Employee) => emp.user.department === dept).length || 0) / totalEmployees * 100) : 0
  }));

  // Role distribution
  const roleStats = [
    { role: 'Employee', count: employees?.filter((emp: Employee) => emp.user.role === 'employee').length || 0 },
    { role: 'Team Lead', count: employees?.filter((emp: Employee) => emp.user.role === 'team_lead').length || 0 },
    { role: 'Manager', count: employees?.filter((emp: Employee) => emp.user.role === 'branch_manager').length || 0 },
    { role: 'HR Admin', count: employees?.filter((emp: Employee) => emp.user.role === 'hr_admin').length || 0 },
    { role: 'Logistics', count: employees?.filter((emp: Employee) => emp.user.role === 'logistics_manager').length || 0 },
  ];

  // Task priority breakdown
  const taskPriorityStats = [
    { priority: 'Low', count: tasks?.filter((task: Task) => task.priority === 'low').length || 0, color: 'bg-gray/10 text-gray-600' },
    { priority: 'Medium', count: tasks?.filter((task: Task) => task.priority === 'medium').length || 0, color: 'bg-primary/10 text-primary' },
    { priority: 'High', count: tasks?.filter((task: Task) => task.priority === 'high').length || 0, color: 'bg-warning/10 text-warning' },
    { priority: 'Urgent', count: tasks?.filter((task: Task) => task.priority === 'urgent').length || 0, color: 'bg-destructive/10 text-destructive' },
  ];

  const exportData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      timeRange,
      department: departmentFilter || 'All',
      metrics: {
        employees: { total: totalEmployees, active: activeEmployees, onboarding: onboardingEmployees },
        tasks: { total: totalTasks, completed: completedTasks, overdue: overdueTasks, completionRate: taskCompletionRate },
        recognitions: { total: totalRecognitions, thisMonth: thisMonthRecognitions },
        logistics: { pendingRequests: pendingLogisticsRequests }
      },
      departmentBreakdown: departmentStats,
      roleDistribution: roleStats,
      taskPriorities: taskPriorityStats
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Analytics & Reports</h2>
          <p className="text-gray-600 mt-1">Track organizational metrics and performance</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={exportData} variant="outline">
            <Download className="mr-2" size={16} />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalEmployees}</p>
                <p className="text-accent text-sm font-medium mt-2 flex items-center">
                  <TrendingUp className="mr-1" size={12} />
                  {activeEmployees} active
                </p>
              </div>
              <div className="stats-card-icon bg-primary/10 text-primary">
                <Users size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Task Completion</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{taskCompletionRate}%</p>
                <p className="text-accent text-sm font-medium mt-2 flex items-center">
                  <CheckCircle className="mr-1" size={12} />
                  {completedTasks} of {totalTasks}
                </p>
              </div>
              <div className="stats-card-icon bg-accent/10 text-accent">
                <Target size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Recognition Awards</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalRecognitions}</p>
                <p className="text-warning text-sm font-medium mt-2 flex items-center">
                  <Award className="mr-1" size={12} />
                  {thisMonthRecognitions} this month
                </p>
              </div>
              <div className="stats-card-icon bg-warning/10 text-warning">
                <Award size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{pendingLogisticsRequests}</p>
                <p className="text-gray-600 text-sm font-medium mt-2 flex items-center">
                  <Clock className="mr-1" size={12} />
                  Logistics items
                </p>
              </div>
              <div className="stats-card-icon bg-secondary/10 text-secondary">
                <Clock size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Breakdown */}
        <Card className="stats-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <PieChart className="mr-2" size={20} />
              Department Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : departmentStats.length > 0 ? (
              <div className="space-y-4">
                {departmentStats.map((dept, index) => (
                  <div key={dept.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">{dept.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{dept.count}</span>
                        <Badge variant="outline">{dept.percentage}%</Badge>
                      </div>
                    </div>
                    <Progress value={dept.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <PieChart className="mx-auto mb-4 text-gray-400" size={48} />
                <p>No department data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Role Distribution */}
        <Card className="stats-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="mr-2" size={20} />
              Role Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {roleStats.map((role, index) => (
                  <div key={role.role} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{role.role}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{role.count}</span>
                      <Badge variant="outline">
                        {totalEmployees > 0 ? Math.round((role.count / totalEmployees) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Task Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Overview */}
        <Card className="stats-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="mr-2" size={20} />
              Task Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Completed</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-accent h-2 rounded-full progress-fill" style={{ width: `${taskCompletionRate}%` }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{taskCompletionRate}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">In Progress</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-warning h-2 rounded-full progress-fill" style={{ width: `${totalTasks > 0 ? Math.round((tasks?.filter((task: Task) => task.status === 'in_progress').length || 0) / totalTasks * 100) : 0}%` }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {totalTasks > 0 ? Math.round((tasks?.filter((task: Task) => task.status === 'in_progress').length || 0) / totalTasks * 100) : 0}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Overdue</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-destructive h-2 rounded-full progress-fill" style={{ width: `${totalTasks > 0 ? Math.round((overdueTasks / totalTasks) * 100) : 0}%` }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {totalTasks > 0 ? Math.round((overdueTasks / totalTasks) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task Priority Breakdown */}
        <Card className="stats-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Target className="mr-2" size={20} />
              Task Priority Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {taskPriorityStats.map((priority) => (
                  <div key={priority.priority} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{priority.priority}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{priority.count}</span>
                      <Badge className={priority.color}>
                        {totalTasks > 0 ? Math.round((priority.count / totalTasks) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="stats-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <TrendingUp className="mr-2" size={20} />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">{taskCompletionRate}%</div>
              <p className="text-sm text-gray-600">Task Completion Rate</p>
              <p className="text-xs text-gray-500 mt-1">Above 85% is excellent</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {totalEmployees > 0 ? Math.round((activeEmployees / totalEmployees) * 100) : 0}%
              </div>
              <p className="text-sm text-gray-600">Employee Retention</p>
              <p className="text-xs text-gray-500 mt-1">Active vs Total</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-warning mb-2">
                {totalEmployees > 0 ? Math.round((thisMonthRecognitions / totalEmployees) * 100) : 0}%
              </div>
              <p className="text-sm text-gray-600">Recognition Rate</p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
