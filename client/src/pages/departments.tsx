import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  Plus, 
  Users, 
  MapPin, 
  DollarSign,
  Edit,
  Trash2,
  UserCheck,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const departmentOptions = [
  { value: 'human_resources', label: 'Human Resources' },
  { value: 'information_technology', label: 'Information Technology' },
  { value: 'finance_accounting', label: 'Finance & Accounting' },
  { value: 'sales_marketing', label: 'Sales & Marketing' },
  { value: 'operations', label: 'Operations' },
  { value: 'customer_service', label: 'Customer Service' },
  { value: 'research_development', label: 'Research & Development' },
  { value: 'legal_compliance', label: 'Legal & Compliance' },
  { value: 'executive_management', label: 'Executive Management' },
  { value: 'facilities_maintenance', label: 'Facilities & Maintenance' }
];

export default function Departments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [newDepartment, setNewDepartment] = useState({
    code: '',
    name: '',
    description: '',
    managerId: '',
    budgetAllocated: '',
    location: '',
    headcount: 0
  });

  // Fetch departments
  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['/api/departments'],
  });

  // Fetch employees for department details
  const { data: employees = [] } = useQuery({
    queryKey: ['/api/employees'],
  });

  // Create department mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/departments', {
        method: 'POST',
        body: {
          ...data,
          budgetAllocated: data.budgetAllocated ? parseFloat(data.budgetAllocated) : null,
          managerId: data.managerId || null
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
      setIsCreateModalOpen(false);
      setNewDepartment({
        code: '',
        name: '',
        description: '',
        managerId: '',
        budgetAllocated: '',
        location: '',
        headcount: 0
      });
      toast({
        title: "Success",
        description: "Department created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create department",
        variant: "destructive",
      });
    },
  });

  // Update department mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: any) => {
      return await apiRequest(`/api/departments/${id}`, {
        method: 'PUT',
        body: {
          ...data,
          budgetAllocated: data.budgetAllocated ? parseFloat(data.budgetAllocated) : null,
          managerId: data.managerId || null
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
      setIsEditModalOpen(false);
      toast({
        title: "Success",
        description: "Department updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update department",
        variant: "destructive",
      });
    },
  });

  // Delete department mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/departments/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
      toast({
        title: "Success",
        description: "Department deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete department",
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    if (!newDepartment.code || !newDepartment.name) {
      toast({
        title: "Missing Information",
        description: "Please provide department code and name",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(newDepartment);
  };

  const handleEdit = (department: any) => {
    setSelectedDepartment(department);
    setNewDepartment({
      code: department.code,
      name: department.name,
      description: department.description || '',
      managerId: department.managerId || '',
      budgetAllocated: department.budgetAllocated || '',
      location: department.location || '',
      headcount: department.headcount || 0
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedDepartment) return;
    updateMutation.mutate({
      id: selectedDepartment.id,
      data: newDepartment
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this department?')) {
      deleteMutation.mutate(id);
    }
  };

  const getDepartmentEmployeeCount = (departmentCode: string) => {
    return employees.filter(emp => emp.user.department === departmentCode).length;
  };

  const getManagerName = (managerId: string) => {
    if (!managerId) return null;
    const manager = employees.find(emp => emp.user.id === managerId);
    return manager ? `${manager.user.firstName} ${manager.user.lastName}` : null;
  };

  if (!user || (user.role !== 'hr_admin' && user.role !== 'branch_manager')) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">Only HR administrators and branch managers can access department management.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Department Management</h2>
          <p className="text-gray-600 mt-1">Manage organizational departments and structure</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Department</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Department Code</Label>
                  <Select 
                    value={newDepartment.code}
                    onValueChange={(value) => {
                      const option = departmentOptions.find(opt => opt.value === value);
                      setNewDepartment(prev => ({ 
                        ...prev, 
                        code: value,
                        name: option?.label || value
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department type" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="name">Department Name</Label>
                  <Input
                    id="name"
                    value={newDepartment.name}
                    onChange={(e) => setNewDepartment(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Human Resources"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of department responsibilities..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newDepartment.location}
                    onChange={(e) => setNewDepartment(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Main Office - Floor 2"
                  />
                </div>
                <div>
                  <Label htmlFor="budgetAllocated">Budget Allocated</Label>
                  <Input
                    id="budgetAllocated"
                    type="number"
                    step="0.01"
                    value={newDepartment.budgetAllocated}
                    onChange={(e) => setNewDepartment(prev => ({ ...prev, budgetAllocated: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Department'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Department Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Departments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{departments.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{employees.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Managers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {departments.filter(d => d.manager).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg Team Size</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {departments.length > 0 ? Math.round(employees.length / departments.length) : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Departments List */}
      <div className="grid gap-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading departments...</p>
          </div>
        ) : departments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Departments</h3>
              <p className="text-gray-600 mb-4">Create your first department to get started with organizational structure.</p>
            </CardContent>
          </Card>
        ) : (
          departments.map((department: any) => {
            const employeeCount = getDepartmentEmployeeCount(department.code);
            const managerName = getManagerName(department.managerId);
            
            return (
              <Card key={department.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{department.name}</h3>
                        <Badge variant="secondary">
                          {department.code.replace('_', ' ')}
                        </Badge>
                        <Badge variant={department.isActive ? "default" : "secondary"}>
                          {department.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {department.description && (
                        <p className="text-gray-600 mb-4">{department.description}</p>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{employeeCount} employees</span>
                        </div>
                        {department.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{department.location}</span>
                          </div>
                        )}
                        {department.budgetAllocated && (
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>${department.budgetAllocated}</span>
                          </div>
                        )}
                        {managerName && (
                          <div className="flex items-center space-x-1">
                            <UserCheck className="h-4 w-4" />
                            <span>Mgr: {managerName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(department)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(department.id)}
                        disabled={employeeCount > 0}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Edit Department Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editCode">Department Code</Label>
                <Select 
                  value={newDepartment.code}
                  onValueChange={(value) => {
                    const option = departmentOptions.find(opt => opt.value === value);
                    setNewDepartment(prev => ({ 
                      ...prev, 
                      code: value,
                      name: option?.label || value
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editName">Department Name</Label>
                <Input
                  id="editName"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Human Resources"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={newDepartment.description}
                onChange={(e) => setNewDepartment(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of department responsibilities..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editLocation">Location</Label>
                <Input
                  id="editLocation"
                  value={newDepartment.location}
                  onChange={(e) => setNewDepartment(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Main Office - Floor 2"
                />
              </div>
              <div>
                <Label htmlFor="editBudgetAllocated">Budget Allocated</Label>
                <Input
                  id="editBudgetAllocated"
                  type="number"
                  step="0.01"
                  value={newDepartment.budgetAllocated}
                  onChange={(e) => setNewDepartment(prev => ({ ...prev, budgetAllocated: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Updating...' : 'Update Department'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}