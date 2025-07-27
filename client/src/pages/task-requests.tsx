import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskRequestsList } from "@/components/task-requests/task-requests-list";
import { useAuth } from "@/hooks/useAuth";
import { 
  HelpCircle, 
  Clock, 
  FileText, 
  AlertCircle, 
  Search, 
  Filter,
  Users,
  CheckCircle,
  XCircle,
  ClockIcon
} from "lucide-react";

export default function TaskRequests() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Fetch all task requests for HR/managers
  const { data: allRequests = [], isLoading, error } = useQuery({
    queryKey: ['/api/task-requests'],
    retry: false,
  });

  // Fetch requests made by current user
  const { data: myRequests = [], isLoading: myRequestsLoading } = useQuery({
    queryKey: ['/api/task-requests/my', user?.id],
    queryFn: () => user?.id ? apiRequest(`/api/task-requests?requesterId=${user.id}`) : Promise.resolve([]),
    enabled: !!user?.id,
    retry: false,
  });

  // Filter requests based on search and filters
  const filteredRequests = (allRequests || []).filter((request: any) => {
    if (!request || !request.requestTitle) return false;
    
    const matchesSearch = 
      request.requestTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.task?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requester?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requester?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesType = typeFilter === "all" || request.requestType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusCounts = (requests: any[]) => {
    if (!requests || !Array.isArray(requests)) {
      return { total: 0, pending: 0, approved: 0, rejected: 0 };
    }
    return {
      total: requests.length,
      pending: requests.filter(r => r && r.status === 'pending').length,
      approved: requests.filter(r => r && r.status === 'approved').length,
      rejected: requests.filter(r => r && r.status === 'rejected').length,
    };
  };

  const allRequestsStats = getStatusCounts(allRequests);
  const myRequestsStats = getStatusCounts(myRequests);

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'time_extension':
        return <Clock className="h-4 w-4" />;
      case 'document_request':
        return <FileText className="h-4 w-4" />;
      case 'help_request':
        return <HelpCircle className="h-4 w-4" />;
      case 'clarification':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'time_extension':
        return 'Time Extension';
      case 'document_request':
        return 'Document Request';
      case 'help_request':
        return 'Help Request';
      case 'clarification':
        return 'Clarification';
      default:
        return type;
    }
  };

  const isHROrManager = user?.role === 'hr_admin' || user?.role === 'branch_manager' || user?.role === 'team_lead';

  if (isLoading || myRequestsLoading) {
    return <div className="flex items-center justify-center h-64">Loading requests...</div>;
  }

  // Handle authentication errors
  if (error && error.message.includes('401')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600">You need to be logged in to view task requests.</p>
          <Button onClick={() => window.location.href = '/api/login'} className="mt-2">
            Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Requests</h1>
          <p className="text-gray-600 mt-1">
            Manage employee requests for time extensions, documents, and assistance
          </p>
        </div>
      </div>

      <Tabs defaultValue={isHROrManager ? "all-requests" : "my-requests"} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          {isHROrManager && (
            <TabsTrigger value="all-requests" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              All Requests ({allRequestsStats.total})
            </TabsTrigger>
          )}
          <TabsTrigger value="my-requests" className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            My Requests ({myRequestsStats.total})
          </TabsTrigger>
        </TabsList>

        {isHROrManager && (
          <TabsContent value="all-requests" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Requests</p>
                      <p className="text-2xl font-bold text-gray-900">{allRequestsStats.total}</p>
                    </div>
                    <HelpCircle className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">{allRequestsStats.pending}</p>
                    </div>
                    <ClockIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Approved</p>
                      <p className="text-2xl font-bold text-green-600">{allRequestsStats.approved}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Rejected</p>
                      <p className="text-2xl font-bold text-red-600">{allRequestsStats.rejected}</p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search requests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="in_review">In Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="time_extension">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Time Extension
                          </div>
                        </SelectItem>
                        <SelectItem value="document_request">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Document Request
                          </div>
                        </SelectItem>
                        <SelectItem value="help_request">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="h-4 w-4" />
                            Help Request
                          </div>
                        </SelectItem>
                        <SelectItem value="clarification">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Clarification
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requests List */}
            <Card>
              <CardHeader>
                <CardTitle>
                  All Employee Requests ({filteredRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaskRequestsList 
                  showActions={true} 
                  currentUserId={user?.id}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="my-requests" className="space-y-6">
          {/* My Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">My Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{myRequestsStats.total}</p>
                  </div>
                  <HelpCircle className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{myRequestsStats.pending}</p>
                  </div>
                  <ClockIcon className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{myRequestsStats.approved}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{myRequestsStats.rejected}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>My Task Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskRequestsList 
                requesterId={user?.id} 
                showActions={false} 
                currentUserId={user?.id}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}