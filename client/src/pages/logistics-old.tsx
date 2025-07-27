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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Boxes, Plus, Package, AlertTriangle, Edit, Trash2, ShoppingCart, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';
import { LogisticsItem, LogisticsRequest } from '@/types';

const itemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  quantity: z.number().min(0, 'Quantity must be positive'),
  minQuantity: z.number().min(0, 'Minimum quantity must be positive'),
  location: z.string().optional(),
});

const requestSchema = z.object({
  itemId: z.number().min(1, 'Please select an item'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  reason: z.string().optional(),
  priority: z.string().default('medium'),
  estimatedCost: z.number().optional(),
});

const purchaseSchema = z.object({
  actualCost: z.number().min(0, 'Cost must be positive'),
  vendor: z.string().min(1, 'Vendor is required'),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  notes: z.string().optional(),
});

type ItemFormData = z.infer<typeof itemSchema>;
type RequestFormData = z.infer<typeof requestSchema>;
type PurchaseFormData = z.infer<typeof purchaseSchema>;

export default function Logistics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<LogisticsItem | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<LogisticsRequest | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const itemForm = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      quantity: 0,
      minQuantity: 0,
      location: '',
    },
  });

  const requestForm = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      itemId: 0,
      quantity: 1,
      reason: '',
      priority: 'medium',
      estimatedCost: 0,
    },
  });

  const purchaseForm = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      actualCost: 0,
      vendor: '',
      purchaseDate: '',
      notes: '',
    },
  });

  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ['/api/logistics/items'],
    retry: false,
  });

  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ['/api/logistics/requests', { status: statusFilter }],
    retry: false,
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: ItemFormData) => {
      return await apiRequest('POST', '/api/logistics/items', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/logistics/items'] });
      setShowItemDialog(false);
      itemForm.reset();
      toast({
        title: "Success",
        description: "Item created successfully",
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
        description: "Failed to create item",
        variant: "destructive",
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ItemFormData> }) => {
      return await apiRequest('PUT', `/api/logistics/items/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/logistics/items'] });
      setEditingItem(null);
      itemForm.reset();
      toast({
        title: "Success",
        description: "Item updated successfully",
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
        description: "Failed to update item",
        variant: "destructive",
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/logistics/items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/logistics/items'] });
      toast({
        title: "Success",
        description: "Item deleted successfully",
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
        description: "Failed to delete item",
        variant: "destructive",
      });
    },
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: RequestFormData) => {
      return await apiRequest('POST', '/api/logistics/requests', {
        ...data,
        requesterId: user?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/logistics/requests'] });
      setShowRequestDialog(false);
      requestForm.reset();
      toast({
        title: "Success",
        description: "Request submitted successfully",
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
        description: "Failed to submit request",
        variant: "destructive",
      });
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { status: string; approvedBy?: string } }) => {
      return await apiRequest('PUT', `/api/logistics/requests/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/logistics/requests'] });
      toast({
        title: "Success",
        description: "Request updated successfully",
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
        description: "Failed to update request",
        variant: "destructive",
      });
    },
  });

  const onItemSubmit = (data: ItemFormData) => {
    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, data });
    } else {
      createItemMutation.mutate(data);
    }
  };

  const onRequestSubmit = (data: RequestFormData) => {
    createRequestMutation.mutate(data);
  };

  const handleEditItem = (item: LogisticsItem) => {
    setEditingItem(item);
    itemForm.reset({
      name: item.name,
      description: item.description || '',
      category: item.category,
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      location: item.location || '',
    });
  };

  const handleApproveRequest = (requestId: number) => {
    updateRequestMutation.mutate({
      id: requestId,
      data: { status: 'approved', approvedBy: user?.id }
    });
  };

  const handleRejectRequest = (requestId: number) => {
    updateRequestMutation.mutate({
      id: requestId,
      data: { status: 'rejected', approvedBy: user?.id }
    });
  };

  const canManageLogistics = user?.role && ['hr_admin', 'logistics_manager'].includes(user.role);
  const canApproveRequests = user?.role && ['hr_admin', 'logistics_manager', 'team_lead'].includes(user.role);

  const categories = [...new Set(items?.map((item: LogisticsItem) => item.category) || [])];
  const lowStockItems = items?.filter((item: LogisticsItem) => item.quantity <= item.minQuantity) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'status-active';
      case 'rejected':
        return 'status-overdue';
      case 'fulfilled':
        return 'status-completed';
      default:
        return 'status-pending';
    }
  };

  const filteredItems = items?.filter((item: LogisticsItem) => {
    return !categoryFilter || item.category === categoryFilter;
  }) || [];

  const myRequests = requests?.filter((req: LogisticsRequest) => req.requesterId === user?.id) || [];
  const pendingRequests = requests?.filter((req: LogisticsRequest) => req.status === 'pending') || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Logistics Management</h2>
          <p className="text-gray-600 mt-1">Manage inventory and equipment requests</p>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <ShoppingCart className="mr-2" size={16} />
                Request Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Request Item</DialogTitle>
              </DialogHeader>
              <Form {...requestForm}>
                <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-4">
                  <FormField
                    control={requestForm.control}
                    name="itemId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select item to request" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {items?.map((item: LogisticsItem) => (
                              <SelectItem key={item.id} value={item.id.toString()}>
                                {item.name} (Available: {item.quantity})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={requestForm.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            placeholder="Enter quantity" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={requestForm.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter reason for request" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowRequestDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createRequestMutation.isPending}
                      className="btn-primary"
                    >
                      Submit Request
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {canManageLogistics && (
            <Dialog open={showItemDialog || !!editingItem} onOpenChange={(open) => {
              if (!open) {
                setShowItemDialog(false);
                setEditingItem(null);
                itemForm.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setShowItemDialog(true)} className="btn-secondary">
                  <Plus className="mr-2" size={16} />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? 'Edit Item' : 'Add New Item'}
                  </DialogTitle>
                </DialogHeader>
                <Form {...itemForm}>
                  <form onSubmit={itemForm.handleSubmit(onItemSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={itemForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter item name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={itemForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter category" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={itemForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={itemForm.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                placeholder="0" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={itemForm.control}
                        name="minQuantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Min Quantity</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                placeholder="0" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={itemForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="Location" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowItemDialog(false);
                          setEditingItem(null);
                          itemForm.reset();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createItemMutation.isPending || updateItemMutation.isPending}
                        className="btn-primary"
                      >
                        {editingItem ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Items</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{items?.length || 0}</p>
              </div>
              <div className="stats-card-icon bg-primary/10 text-primary">
                <Package size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Low Stock</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{lowStockItems.length}</p>
              </div>
              <div className="stats-card-icon bg-warning/10 text-warning">
                <AlertTriangle size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{pendingRequests.length}</p>
              </div>
              <div className="stats-card-icon bg-accent/10 text-accent">
                <Clock size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Categories</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{categories.length}</p>
              </div>
              <div className="stats-card-icon bg-secondary/10 text-secondary">
                <Boxes size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="stats-card border-warning">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="mr-2 text-warning" size={20} />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockItems.map((item: LogisticsItem) => (
                <div key={item.id} className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600">Current: {item.quantity} | Min: {item.minQuantity}</p>
                  <p className="text-sm text-warning font-medium">Needs restocking</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="requests">My Requests</TabsTrigger>
          {canApproveRequests && <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>}
        </TabsList>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          {/* Filters */}
          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  onClick={() => setCategoryFilter('')}
                >
                  Clear Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Items Grid */}
          {itemsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="stats-card animate-pulse">
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item: LogisticsItem) => (
                <Card key={item.id} className="stats-card hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        <Badge variant="outline" className="mt-2">{item.category}</Badge>
                      </div>
                      
                      {canManageLogistics && (
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditItem(item)}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteItemMutation.mutate(item.id)}
                            className="p-1 text-gray-500 hover:text-destructive"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className={`font-medium ${item.quantity <= item.minQuantity ? 'text-warning' : 'text-gray-900'}`}>
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Min Quantity:</span>
                        <span className="text-gray-900">{item.minQuantity}</span>
                      </div>
                      {item.location && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span className="text-gray-900">{item.location}</span>
                        </div>
                      )}
                    </div>

                    {item.quantity <= item.minQuantity && (
                      <div className="mt-4 p-2 bg-warning/10 border border-warning/20 rounded text-center">
                        <span className="text-warning text-sm font-medium">Low Stock</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="stats-card">
              <CardContent className="p-12 text-center">
                <Package className="mx-auto mb-4 text-gray-400" size={64} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600 mb-4">
                  {categoryFilter ? "Try adjusting your filter" : "No inventory items have been added yet"}
                </p>
                {canManageLogistics && (
                  <Button onClick={() => setShowItemDialog(true)} className="btn-primary">
                    <Plus className="mr-2" size={16} />
                    Add First Item
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* My Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          {requestsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="stats-card animate-pulse">
                  <div className="h-24 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : myRequests.length > 0 ? (
            <div className="space-y-4">
              {myRequests.map((request: LogisticsRequest) => (
                <Card key={request.id} className="stats-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{request.item.name}</h3>
                        <p className="text-sm text-gray-600">Quantity: {request.quantity}</p>
                        {request.reason && (
                          <p className="text-sm text-gray-600 mt-1">Reason: {request.reason}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Requested: {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="stats-card">
              <CardContent className="p-12 text-center">
                <ShoppingCart className="mx-auto mb-4 text-gray-400" size={64} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                <p className="text-gray-600 mb-4">You haven't made any item requests yet</p>
                <Button onClick={() => setShowRequestDialog(true)} className="btn-primary">
                  <Plus className="mr-2" size={16} />
                  Make First Request
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Pending Approvals Tab */}
        {canApproveRequests && (
          <TabsContent value="approvals" className="space-y-6">
            {requestsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="stats-card animate-pulse">
                    <div className="h-24 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingRequests.map((request: LogisticsRequest) => (
                  <Card key={request.id} className="stats-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{request.item.name}</h3>
                          <p className="text-sm text-gray-600">
                            Requested by: {request.requester.firstName} {request.requester.lastName}
                          </p>
                          <p className="text-sm text-gray-600">Quantity: {request.quantity}</p>
                          {request.reason && (
                            <p className="text-sm text-gray-600 mt-1">Reason: {request.reason}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Requested: {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveRequest(request.id)}
                            className="btn-accent"
                          >
                            <CheckCircle size={14} className="mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectRequest(request.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <XCircle size={14} className="mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="stats-card">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="mx-auto mb-4 text-gray-400" size={64} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pending approvals</h3>
                  <p className="text-gray-600">All requests have been processed</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
