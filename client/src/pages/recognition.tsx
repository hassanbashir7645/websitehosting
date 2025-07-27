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
import { Award, Plus, Star, Trophy, Target, Users, Calendar, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';
import { Recognition as RecognitionType, Employee } from '@/types';

const recognitionSchema = z.object({
  nomineeId: z.string().min(1, 'Please select a nominee'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['employee_of_month', 'achievement', 'milestone']),
});

type RecognitionFormData = z.infer<typeof recognitionSchema>;

const recognitionTypes = [
  { value: 'employee_of_month', label: 'Employee of the Month', icon: Star },
  { value: 'achievement', label: 'Achievement Award', icon: Trophy },
  { value: 'milestone', label: 'Milestone Recognition', icon: Target },
];

export default function Recognition() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');

  const form = useForm<RecognitionFormData>({
    resolver: zodResolver(recognitionSchema),
    defaultValues: {
      nomineeId: '',
      title: '',
      description: '',
      type: 'achievement',
    },
  });

  const { data: recognitions, isLoading } = useQuery({
    queryKey: ['/api/recognition', { type: typeFilter }],
    retry: false,
  });

  const { data: employees } = useQuery({
    queryKey: ['/api/employees'],
    retry: false,
  });

  const createRecognitionMutation = useMutation({
    mutationFn: async (data: RecognitionFormData) => {
      return await apiRequest('POST', '/api/recognition', {
        ...data,
        nominatedBy: user?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recognition'] });
      setShowAddDialog(false);
      form.reset();
      toast({
        title: "Success",
        description: "Recognition nomination submitted successfully",
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
        description: "Failed to submit recognition",
        variant: "destructive",
      });
    },
  });

  const approveRecognitionMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: number; approved: boolean }) => {
      return await apiRequest('PUT', `/api/recognition/${id}`, {
        isApproved: approved,
        approvedBy: approved ? user?.id : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recognition'] });
      toast({
        title: "Success",
        description: "Recognition updated successfully",
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
        description: "Failed to update recognition",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RecognitionFormData) => {
    createRecognitionMutation.mutate(data);
  };

  const canApproveRecognitions = user?.role && ['hr_admin', 'branch_manager'].includes(user.role);

  const getTypeIcon = (type: string) => {
    const typeObj = recognitionTypes.find(t => t.value === type);
    return typeObj ? typeObj.icon : Award;
  };

  const getTypeLabel = (type: string) => {
    const typeObj = recognitionTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'employee_of_month':
        return 'bg-warning/10 text-warning';
      case 'achievement':
        return 'bg-accent/10 text-accent';
      case 'milestone':
        return 'bg-primary/10 text-primary';
      default:
        return 'bg-gray/10 text-gray-600';
    }
  };

  const approvedRecognitions = recognitions?.filter((rec: RecognitionType) => rec.isApproved) || [];
  const pendingRecognitions = recognitions?.filter((rec: RecognitionType) => !rec.isApproved) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Employee Recognition</h2>
          <p className="text-gray-600 mt-1">Recognize and celebrate employee achievements</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="btn-primary">
              <Plus className="mr-2" size={16} />
              Nominate Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nominate Employee for Recognition</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nomineeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee to nominate" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employees?.map((emp: Employee) => (
                            <SelectItem key={emp.userId} value={emp.userId}>
                              {emp.user.firstName} {emp.user.lastName} - {emp.user.position}
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
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recognition Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select recognition type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {recognitionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
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
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter recognition title" {...field} />
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
                        <Textarea 
                          placeholder="Describe why this employee deserves recognition" 
                          className="min-h-[100px]" 
                          {...field} 
                        />
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
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createRecognitionMutation.isPending}
                    className="btn-primary"
                  >
                    Submit Nomination
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Recognitions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{approvedRecognitions.length}</p>
              </div>
              <div className="stats-card-icon bg-accent/10 text-accent">
                <Award size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending Approvals</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{pendingRecognitions.length}</p>
              </div>
              <div className="stats-card-icon bg-warning/10 text-warning">
                <Clock size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">This Month</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {approvedRecognitions.filter((rec: RecognitionType) => 
                    new Date(rec.createdAt).getMonth() === new Date().getMonth()
                  ).length}
                </p>
              </div>
              <div className="stats-card-icon bg-primary/10 text-primary">
                <Star size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="stats-card">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {recognitionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={() => setTypeFilter('')}
            >
              Clear Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Approvals (for managers) */}
      {canApproveRecognitions && pendingRecognitions.length > 0 && (
        <Card className="stats-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="mr-2" size={20} />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingRecognitions.map((recognition: RecognitionType) => {
              const TypeIcon = getTypeIcon(recognition.type);
              return (
                <div key={recognition.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <TypeIcon className="text-warning mt-1" size={20} />
                    <div>
                      <h4 className="font-medium text-gray-900">{recognition.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{recognition.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Nominee: {recognition.nominee.firstName} {recognition.nominee.lastName}</span>
                        <span>By: {recognition.nominator.firstName} {recognition.nominator.lastName}</span>
                        <span>{new Date(recognition.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => approveRecognitionMutation.mutate({ id: recognition.id, approved: true })}
                      className="btn-accent"
                    >
                      <CheckCircle size={14} className="mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => approveRecognitionMutation.mutate({ id: recognition.id, approved: false })}
                      className="text-destructive hover:text-destructive"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Recognition Wall */}
      <Card className="stats-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <Award className="mr-2" size={20} />
            Recognition Wall
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : approvedRecognitions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {approvedRecognitions.map((recognition: RecognitionType) => {
                const TypeIcon = getTypeIcon(recognition.type);
                return (
                  <div key={recognition.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3 mb-3">
                      <TypeIcon className="text-accent mt-1" size={20} />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900">{recognition.title}</h4>
                          <Badge className={getTypeColor(recognition.type)}>
                            {getTypeLabel(recognition.type)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{recognition.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center">
                          <Users className="text-white" size={14} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {recognition.nominee.firstName} {recognition.nominee.lastName}
                          </p>
                          <p className="text-gray-500 text-xs">
                            Nominated by {recognition.nominator.firstName} {recognition.nominator.lastName}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right text-xs text-gray-500">
                        <Calendar className="inline mr-1" size={12} />
                        {new Date(recognition.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Award className="mx-auto mb-4 text-gray-400" size={64} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recognitions yet</h3>
              <p className="text-gray-600 mb-4">Start recognizing outstanding employees</p>
              <Button onClick={() => setShowAddDialog(true)} className="btn-primary">
                <Plus className="mr-2" size={16} />
                Create First Recognition
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
