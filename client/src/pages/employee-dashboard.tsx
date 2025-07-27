import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Upload,
  Calendar,
  Target,
  Award,
  MessageSquare,
  Settings,
  Bell
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';
import { Task, OnboardingChecklist, Document } from '@shared/schema';
import { FileUpload } from '@/components/FileUpload';
import { useLocation } from 'wouter';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [selectedTab, setSelectedTab] = useState('overview');

  // Fetch employee data
  const { data: employee } = useQuery({
    queryKey: ['/api/employees'],
    select: (data) => data?.find((emp: any) => emp.userId === user?.id),
  });

  // Fetch my tasks
  const { data: allTasks = [] } = useQuery({
    queryKey: ['/api/tasks'],
  });

  // Filter tasks assigned to current user
  const myTasks = allTasks.filter((task: any) => task.assignedTo === user?.id);

  // Fetch my onboarding checklist
  const { data: onboardingItems = [] } = useQuery({
    queryKey: [`/api/onboarding/checklist/${employee?.id}`],
    enabled: !!employee?.id,
  });

  // Fetch my documents
  const { data: allDocuments = [] } = useQuery({
    queryKey: ['/api/documents'],
  });

  // Filter documents uploaded by current user
  const myDocuments = allDocuments.filter((doc: any) => doc.uploadedBy === user?.id);

  // Fetch announcements
  const { data: announcements = [] } = useQuery({
    queryKey: ['/api/announcements'],
  });

  // Update task status
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest('PUT', `/api/tasks/${id}`, { 
        status, 
        completedAt: status === 'completed' ? new Date().toISOString() : undefined 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Success",
        description: "Task status updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    },
  });

  // Submit document
  const submitDocumentMutation = useMutation({
    mutationFn: async (documentData: any) => {
      return await apiRequest('POST', '/api/documents', {
        ...documentData,
        uploadedBy: user?.id,
        relatedType: 'employee_submission',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: "Success",
        description: "Document submitted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to submit document",
        variant: "destructive",
      });
    },
  });

  const getRoleDisplayName = (role: string) => {
    const roleMap = {
      hr_admin: 'HR Administrator',
      branch_manager: 'Branch Manager',
      team_lead: 'Team Lead',
      employee: 'Employee',
      logistics_manager: 'Logistics Manager'
    };
    return roleMap[role] || role;
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingTasks = myTasks.filter((task: Task) => task.status === 'pending' || task.status === 'in_progress');
  const completedTasks = myTasks.filter((task: Task) => task.status === 'completed');
  const overdueTasks = myTasks.filter((task: Task) => task.status === 'overdue');

  const onboardingProgress = onboardingItems.length > 0 
    ? Math.round((onboardingItems.filter((item: OnboardingChecklist) => item.isCompleted).length / onboardingItems.length) * 100)
    : 100;

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Welcome back, {user?.firstName}!
          </h2>
          <p className="text-gray-600 mt-1">
            {getRoleDisplayName(user?.role || 'employee')} • {user?.department || 'No department assigned'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-blue-100 text-blue-800">
            {user?.status}
          </Badge>
          <Button variant="outline" onClick={() => setLocation('/settings')}>
            <Settings className="mr-2" size={16} />
            Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">My Tasks</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{myTasks.length}</p>
                <p className="text-blue-600 text-sm font-medium mt-2 flex items-center">
                  <Target className="mr-1" size={12} />
                  {pendingTasks.length} pending
                </p>
              </div>
              <div className="stats-card-icon bg-blue-100 text-blue-700">
                <FileText size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{completedTasks.length}</p>
                <p className="text-green-600 text-sm font-medium mt-2 flex items-center">
                  <CheckCircle className="mr-1" size={12} />
                  This month
                </p>
              </div>
              <div className="stats-card-icon bg-green-100 text-green-700">
                <CheckCircle size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Onboarding</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{onboardingProgress}%</p>
                <p className="text-yellow-600 text-sm font-medium mt-2 flex items-center">
                  <Calendar className="mr-1" size={12} />
                  Progress
                </p>
              </div>
              <div className="stats-card-icon bg-yellow-100 text-yellow-700">
                <User size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Documents</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{myDocuments.length}</p>
                <p className="text-purple-600 text-sm font-medium mt-2 flex items-center">
                  <Upload className="mr-1" size={12} />
                  Submitted
                </p>
              </div>
              <div className="stats-card-icon bg-purple-100 text-purple-700">
                <FileText size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Tasks */}
            <Card className="stats-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Recent Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingTasks.slice(0, 3).map((task: Task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <p className="text-sm text-gray-600">{task.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className={getTaskPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge className={getTaskStatusColor(task.status)}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {task.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => updateTaskMutation.mutate({ id: task.id, status: 'in_progress' })}
                          >
                            Start
                          </Button>
                        )}
                        {task.status === 'in_progress' && (
                          <Button
                            size="sm"
                            onClick={() => updateTaskMutation.mutate({ id: task.id, status: 'completed' })}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {pendingTasks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="mx-auto mb-4 text-gray-400" size={48} />
                      <p>All tasks completed! Great job!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Announcements */}
            <Card className="stats-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Recent Announcements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {announcements.slice(0, 3).map((announcement: any) => (
                    <div key={announcement.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(announcement.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Bell className="text-gray-400" size={16} />
                      </div>
                    </div>
                  ))}
                  {announcements.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="mx-auto mb-4 text-gray-400" size={48} />
                      <p>No recent announcements</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Onboarding Progress */}
          {onboardingProgress < 100 && (
            <Card className="stats-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Onboarding Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-medium text-gray-900">{onboardingProgress}%</span>
                  </div>
                  <Progress value={onboardingProgress} className="w-full" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {onboardingItems.filter((item: OnboardingChecklist) => item.isCompleted).length} of {onboardingItems.length} completed
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedTab('onboarding')}
                    >
                      Continue Onboarding
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <Card className="stats-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">My Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myTasks.map((task: Task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={getTaskPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge className={getTaskStatusColor(task.status)}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                        {task.dueDate && (
                          <span className="text-xs text-gray-500">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {task.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => updateTaskMutation.mutate({ id: task.id, status: 'in_progress' })}
                          disabled={updateTaskMutation.isPending}
                        >
                          Start
                        </Button>
                      )}
                      {task.status === 'in_progress' && (
                        <Button
                          size="sm"
                          onClick={() => updateTaskMutation.mutate({ id: task.id, status: 'completed' })}
                          disabled={updateTaskMutation.isPending}
                        >
                          Complete
                        </Button>
                      )}
                      {task.status === 'completed' && (
                        <CheckCircle className="text-green-600" size={20} />
                      )}
                    </div>
                  </div>
                ))}
                {myTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="mx-auto mb-4 text-gray-400" size={48} />
                    <p>No tasks assigned to you</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card className="stats-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Submit Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Submit a Document</h3>
                <p className="text-gray-600 mb-4">Upload documents related to your employment, tasks, or other HR requirements</p>
                <Button 
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        // Simulate file upload for demo
                        const mockUrl = `https://example.com/documents/${file.name}`;
                        submitDocumentMutation.mutate({
                          title: file.name,
                          url: mockUrl,
                          type: 'employee_submission',
                        });
                      }
                    };
                    input.click();
                  }}
                  disabled={submitDocumentMutation.isPending}
                >
                  {submitDocumentMutation.isPending ? 'Uploading...' : 'Choose File'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">My Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myDocuments.map((doc: Document) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="text-gray-400" size={20} />
                      <div>
                        <h4 className="font-medium text-gray-900">{doc.title}</h4>
                        <p className="text-sm text-gray-600">
                          Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={doc.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {doc.isVerified ? 'Verified' : 'Pending Review'}
                      </Badge>
                      {doc.url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            View
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {myDocuments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                    <p>No documents submitted yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onboarding Tab */}
        <TabsContent value="onboarding" className="space-y-6">
          <Card className="stats-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Onboarding Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium text-gray-900">{onboardingProgress}%</span>
                </div>
                <Progress value={onboardingProgress} className="w-full mb-6" />
                
                {onboardingItems.map((item: OnboardingChecklist) => (
                  <div key={item.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    {item.isCompleted ? (
                      <CheckCircle className="text-green-600" size={20} />
                    ) : (
                      <Clock className="text-gray-400" size={20} />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      {item.requiresDocument && !item.isCompleted && (
                        <p className="text-xs text-orange-600 mt-1">Document upload required</p>
                      )}
                    </div>
                    <Badge className={item.isCompleted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {item.isCompleted ? 'Complete' : 'Pending'}
                    </Badge>
                  </div>
                ))}
                {onboardingItems.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="mx-auto mb-4 text-gray-400" size={48} />
                    <p>Onboarding completed!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}