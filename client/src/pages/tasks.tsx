import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ListTodo as TasksIcon, Plus, Calendar, User, AlertCircle, CheckCircle, Clock, Filter } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';
import { Task, Employee } from '@/types';
import TaskOverview from '@/components/tasks/task-overview';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  assignedTo: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export default function ListTodo() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      assignedTo: 'unassigned',
      priority: 'medium',
    },
  });

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['/api/tasks'],
    retry: false,
  });

  const { data: employees } = useQuery({
    queryKey: ['/api/employees'],
    retry: false,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      return await apiRequest('POST', '/api/tasks', {
        ...data,
        assignedBy: user?.id,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setShowAddDialog(false);
      setEditingTask(null);
      form.reset();
      toast({
        title: "Success",
        description: "Task created successfully",
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
        description: "Failed to create task",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<TaskFormData> & { status?: string } }) => {
      return await apiRequest('PUT', `/api/tasks/${id}`, {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setShowAddDialog(false);
      setEditingTask(null);
      form.reset();
      toast({
        title: "Success",
        description: "Task updated successfully",
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

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
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
      // Extract error message from the response
      const errorMessage = error.message?.includes("Cannot delete task with active requests") 
        ? "Cannot delete task - there are active task requests that must be resolved first."
        : "Failed to delete task";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TaskFormData) => {
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, data });
    } else {
      createTaskMutation.mutate(data);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    form.reset({
      title: task.title,
      description: task.description || '',
      assignedTo: task.assignedTo || '',
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    });
  };

  const handleStatusChange = (taskId: number, newStatus: string) => {
    updateTaskMutation.mutate({ 
      id: taskId, 
      data: { status: newStatus, completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined }
    });
  };

  const canManageTasks = user?.role && ['hr_admin', 'branch_manager', 'team_lead'].includes(user.role);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'in_progress':
        return 'status-pending';
      case 'overdue':
        return 'status-overdue';
      default:
        return 'status-inactive';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-destructive/10 text-destructive';
      case 'high':
        return 'bg-warning/10 text-warning';
      case 'medium':
        return 'bg-primary/10 text-primary';
      default:
        return 'bg-gray/10 text-gray-600';
    }
  };

  // Show all tasks - let filters handle the display logic
  const filteredTasks = (tasks || []).filter(task => {
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    if (assigneeFilter !== 'all' && task.assignedTo !== assigneeFilter) return false;
    return true;
  });

  const getTaskIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'overdue':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Task Management</h2>
          <p className="text-gray-600 mt-1">Manage and track task assignments</p>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => {
              console.log('Refreshing all task data...');
              queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
              queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
              queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
              queryClient.refetchQueries({ queryKey: ['/api/tasks'] });
              toast({
                title: "Success",
                description: "Task data refreshed successfully",
              });
            }}
          >
            Refresh
          </Button>
          {canManageTasks && (
            <Dialog open={showAddDialog || !!editingTask} onOpenChange={(open) => {
              if (!open) {
                setShowAddDialog(false);
                setEditingTask(null);
                form.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    console.log('Creating new task...');
                    setEditingTask(null);
                    form.reset({
                      title: '',
                      description: '',
                      assignedTo: 'unassigned',
                      priority: 'medium',
                    });
                    setShowAddDialog(true);
                  }} 
                  className="btn-primary"
                >
                  <Plus className="mr-2" size={16} />
                  Create Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter task title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter task description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="assignedTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assign To</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select assignee" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="unassigned">Unassigned</SelectItem>
                              {employees?.map((emp: Employee) => (
                                <SelectItem key={emp.userId} value={emp.userId}>
                                  {emp.user.firstName} {emp.user.lastName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddDialog(false);
                        setEditingTask(null);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
                      className="btn-primary"
                    >
                      {editingTask ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Overview Component */}
      <TaskOverview tasks={tasks || []} isLoading={isLoading} />

      {/* Filters */}
      <Card className="stats-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                <SelectItem value={user?.id || "current_user"}>My Tasks</SelectItem>
                {employees?.map((emp: Employee) => (
                  <SelectItem key={emp.userId} value={emp.userId}>
                    {emp.user.firstName} {emp.user.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setStatusFilter('all');
                setPriorityFilter('all');
                setAssigneeFilter('all');
              }}
            >
              <Filter className="mr-2" size={16} />
              Clear Filters
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                console.log('Reloading all data...');
                queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
                queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
                queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
                queryClient.refetchQueries({ queryKey: ['/api/tasks'] });
                toast({
                  title: "Success",
                  description: "All data reloaded successfully",
                });
              }}
            >
              <Filter className="mr-2" size={16} />
              Reload Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredTasks.length} of {tasks?.length || 0} tasks
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="stats-card animate-pulse">
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="space-y-4">
          {filteredTasks.map((task: Task) => {
            const StatusIcon = getTaskIcon(task.status);
            return (
              <Card key={task.id} className="stats-card hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <StatusIcon 
                          size={20} 
                          className={task.status === 'completed' ? 'text-accent' : 
                                   task.status === 'overdue' ? 'text-destructive' : 'text-warning'} 
                        />
                        <h3 className="font-semibold text-gray-900">{task.title}</h3>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-600 mb-3">{task.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {task.assignedToUser && (
                          <span className="flex items-center">
                            <User className="mr-1" size={14} />
                            {task.assignedToUser.firstName} {task.assignedToUser.lastName}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="flex items-center">
                            <Calendar className="mr-1" size={14} />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log('Navigating to task:', task.id);
                          window.location.href = `/tasks/${task.id}`;
                        }}
                      >
                        View Details
                      </Button>
                      
                      {task.status !== 'completed' && (
                        <Select
                          value={task.status}
                          onValueChange={(value) => {
                            console.log('Changing status for task:', task.id, 'to:', value);
                            handleStatusChange(task.id, value);
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      
                      {canManageTasks && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            console.log('Editing task:', task.id);
                            handleEdit(task);
                            setShowAddDialog(true);
                          }}
                        >
                          Edit
                        </Button>
                      )}
                      
                      {canManageTasks && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this task?')) {
                              deleteTaskMutation.mutate(task.id);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="stats-card">
          <CardContent className="p-12 text-center">
            <TasksIcon className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-4">
              {statusFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all'
                ? "Try adjusting your filters" 
                : "No tasks have been created yet"}
            </p>
            {canManageTasks && (
              <Button 
                onClick={() => {
                  console.log('Creating first task...');
                  setShowAddDialog(true);
                }} 
                className="btn-primary"
              >
                <Plus className="mr-2" size={16} />
                Create First Task
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
