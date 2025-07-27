import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  MessageSquare,
  TrendingUp,
  FileText,
  HelpCircle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskRequestModal } from '@/components/task-requests/task-request-modal';
import { TaskRequestsList } from '@/components/task-requests/task-requests-list';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';

const updateSchema = z.object({
  updateText: z.string().min(1, 'Update description is required'),
  progressPercentage: z.number().min(0).max(100).default(0),
  hoursWorked: z.number().min(0).default(0),
  challenges: z.string().optional(),
  nextSteps: z.string().optional(),
});

type UpdateFormData = z.infer<typeof updateSchema>;

export default function TaskDetail() {
  const [, params] = useRoute('/tasks/:id');
  const taskId = parseInt(params?.id || '0');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  const updateForm = useForm<UpdateFormData>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      updateText: '',
      progressPercentage: 0,
      hoursWorked: 0,
      challenges: '',
      nextSteps: '',
    },
  });

  // Fetch task details
  const { data: task, isLoading: taskLoading } = useQuery({
    queryKey: ['/api/tasks', taskId],
    retry: false,
  });

  // Fetch task updates
  const { data: updates = [], isLoading: updatesLoading } = useQuery({
    queryKey: ['/api/tasks', taskId, 'updates'],
    retry: false,
  });

  // Create update mutation
  const createUpdateMutation = useMutation({
    mutationFn: async (data: UpdateFormData) => {
      return await apiRequest('POST', `/api/tasks/${taskId}/updates`, {
        ...data,
        userId: user?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', taskId, 'updates'] });
      setShowUpdateDialog(false);
      updateForm.reset();
      toast({
        title: "Success",
        description: "Daily update submitted successfully",
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
        description: "Failed to submit update",
        variant: "destructive",
      });
    },
  });

  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (status: string) => {
      return await apiRequest('PUT', `/api/tasks/${taskId}`, {
        status,
        ...(status === 'completed' && { completedAt: new Date().toISOString() }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Success",
        description: "Task status updated successfully",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
      overdue: { label: 'Overdue', color: 'bg-red-100 text-red-800' },
    };
    const statusInfo = statusMap[status] || statusMap.pending;
    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap = {
      low: { label: 'Low', color: 'bg-blue-100 text-blue-800' },
      medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
      high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
      urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800' },
    };
    const priorityInfo = priorityMap[priority] || priorityMap.medium;
    return <Badge className={priorityInfo.color}>{priorityInfo.label}</Badge>;
  };

  // Calculate overall progress from updates
  const latestProgress = updates.length > 0 ? updates[0]?.progressPercentage || 0 : 0;
  const totalHours = updates.reduce((sum, update) => sum + (update.hoursWorked || 0), 0);
  const isAssignedToCurrentUser = task?.assignedTo === user?.id;

  if (taskLoading || updatesLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Task Not Found</h2>
          <p className="text-gray-600 mb-4">The task you're looking for doesn't exist.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tasks
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
            <div className="flex items-center space-x-3 mt-2">
              {getStatusBadge(task.status)}
              {getPriorityBadge(task.priority)}
            </div>
          </div>
        </div>
        {isAssignedToCurrentUser && task.status !== 'completed' && (
          <div className="flex space-x-2">
            {task.status === 'pending' && (
              <Button onClick={() => updateTaskMutation.mutate('in_progress')}>
                Start Task
              </Button>
            )}
            {task.status === 'in_progress' && (
              <Button onClick={() => updateTaskMutation.mutate('completed')}>
                Mark Complete
              </Button>
            )}
            <TaskRequestModal
              taskId={task.id}
              taskTitle={task.title}
              requesterId={user?.id || ''}
              trigger={
                <Button variant="outline">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Request Help
                </Button>
              }
            />
            <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Daily Update
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Daily Task Update</DialogTitle>
                </DialogHeader>
                <Form {...updateForm}>
                  <form onSubmit={updateForm.handleSubmit((data) => createUpdateMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={updateForm.control}
                      name="updateText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Progress Update</FormLabel>
                          <FormControl>
                            <Textarea placeholder="What did you work on today?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={updateForm.control}
                        name="progressPercentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Progress %</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" max="100" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={updateForm.control}
                        name="hoursWorked"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hours Worked</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" step="0.5" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={updateForm.control}
                      name="challenges"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Challenges (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Any challenges or blockers?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={updateForm.control}
                      name="nextSteps"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Next Steps (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="What will you work on next?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={createUpdateMutation.isPending}>
                      {createUpdateMutation.isPending ? "Submitting..." : "Submit Update"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Task Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Task Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Task Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600">{task.description || 'No description provided'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-1">Assigned To</h3>
                  <p className="text-gray-600">{task.assignedToUser?.firstName} {task.assignedToUser?.lastName}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-1">Due Date</h3>
                  <p className="text-gray-600">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Progress Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Progress</span>
                    <span>{latestProgress}%</span>
                  </div>
                  <Progress value={latestProgress} className="h-2" />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{updates.length}</div>
                    <div className="text-sm text-gray-600">Updates</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{totalHours}</div>
                    <div className="text-sm text-gray-600">Hours Logged</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{latestProgress}%</div>
                    <div className="text-sm text-gray-600">Complete</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Updates Timeline */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="updates" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="updates" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Daily Updates
                  </TabsTrigger>
                  <TabsTrigger value="requests" className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Requests
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="updates" className="mt-6">
              {updates.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Updates Yet</h3>
                  <p className="text-gray-500 text-sm">
                    {isAssignedToCurrentUser ? "Add your first daily update to track progress." : "No updates have been submitted for this task."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {updates.map((update, index) => (
                    <div key={update.id} className="border-l-2 border-blue-200 pl-4 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {update.user?.firstName} {update.user?.lastName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(update.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{update.updateText}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {update.progressPercentage}%
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {update.hoursWorked}h
                        </span>
                      </div>
                      {update.challenges && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-xs">
                          <span className="font-medium text-red-700">Challenges: </span>
                          <span className="text-red-600">{update.challenges}</span>
                        </div>
                      )}
                      {update.nextSteps && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                          <span className="font-medium text-blue-700">Next Steps: </span>
                          <span className="text-blue-600">{update.nextSteps}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
                </TabsContent>
                <TabsContent value="requests" className="mt-6">
                  <TaskRequestsList 
                    taskId={task.id} 
                    showActions={!isAssignedToCurrentUser} 
                    currentUserId={user?.id}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}