import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Mail, 
  Calendar,
  Brain,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Copy,
  Send
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function Candidates() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [testFilter, setTestFilter] = useState('all');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteData, setInviteData] = useState({
    candidateName: '',
    candidateEmail: '',
    testId: '',
  });

  const { data: attempts = [], isLoading } = useQuery({
    queryKey: ['/api/psychometric-test-attempts'],
  });

  const { data: tests = [] } = useQuery({
    queryKey: ['/api/psychometric-tests'],
  });

  const filteredAttempts = attempts.filter(attempt => {
    const matchesSearch = !searchTerm || 
      attempt.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attempt.candidateEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || attempt.status === statusFilter;
    const matchesTest = testFilter === 'all' || attempt.testId.toString() === testFilter;
    
    return matchesSearch && matchesStatus && matchesTest;
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
      in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
      abandoned: { label: 'Abandoned', color: 'bg-red-100 text-red-800' },
    };
    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const generateTestLink = (testId: number, candidateName: string, candidateEmail: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/psychometric-test?testId=${testId}&name=${encodeURIComponent(candidateName)}&email=${encodeURIComponent(candidateEmail)}`;
  };

  const handleInviteCandidate = () => {
    if (!inviteData.candidateName || !inviteData.candidateEmail || !inviteData.testId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const testLink = generateTestLink(parseInt(inviteData.testId), inviteData.candidateName, inviteData.candidateEmail);
    
    // Copy to clipboard
    navigator.clipboard.writeText(testLink);
    
    toast({
      title: "Test Link Generated",
      description: "Test link copied to clipboard. Share it with the candidate.",
    });

    setShowInviteDialog(false);
    setInviteData({ candidateName: '', candidateEmail: '', testId: '' });
  };

  const canManageCandidates = user?.role && ['hr_admin', 'recruiter'].includes(user.role);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Test Candidates</h2>
          <p className="text-gray-600 mt-1">Manage candidate assessments and track test progress</p>
        </div>
        
        {canManageCandidates && (
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Send className="mr-2" size={16} />
                Invite Candidate
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Invite Candidate to Test</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="candidateName">Candidate Name</Label>
                  <Input
                    id="candidateName"
                    value={inviteData.candidateName}
                    onChange={(e) => setInviteData(prev => ({ ...prev, candidateName: e.target.value }))}
                    placeholder="Enter candidate's full name"
                  />
                </div>
                <div>
                  <Label htmlFor="candidateEmail">Email Address</Label>
                  <Input
                    id="candidateEmail"
                    type="email"
                    value={inviteData.candidateEmail}
                    onChange={(e) => setInviteData(prev => ({ ...prev, candidateEmail: e.target.value }))}
                    placeholder="Enter candidate's email"
                  />
                </div>
                <div>
                  <Label htmlFor="testId">Select Test</Label>
                  <Select value={inviteData.testId} onValueChange={(value) => setInviteData(prev => ({ ...prev, testId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a test" />
                    </SelectTrigger>
                    <SelectContent>
                      {tests.map((test) => (
                        <SelectItem key={test.id} value={test.id.toString()}>
                          {test.testName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleInviteCandidate}>
                    Generate & Copy Link
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Candidates</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{attempts.length}</p>
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
                <p className="text-gray-600 text-sm font-medium">Completed Tests</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {attempts.filter(a => a.status === 'completed').length}
                </p>
              </div>
              <div className="stats-card-icon bg-green/10 text-green-600">
                <CheckCircle size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">In Progress</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {attempts.filter(a => a.status === 'in_progress').length}
                </p>
              </div>
              <div className="stats-card-icon bg-blue/10 text-blue-600">
                <Clock size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Average Score</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {attempts.filter(a => a.percentageScore).length > 0 
                    ? Math.round(attempts.filter(a => a.percentageScore).reduce((sum, a) => sum + a.percentageScore, 0) / attempts.filter(a => a.percentageScore).length)
                    : 0}%
                </p>
              </div>
              <div className="stats-card-icon bg-purple/10 text-purple-600">
                <BarChart3 size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="stats-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="abandoned">Abandoned</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={testFilter} onValueChange={setTestFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by test" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tests</SelectItem>
                {tests.map((test) => (
                  <SelectItem key={test.id} value={test.id.toString()}>
                    {test.testName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTestFilter('all');
              }}
            >
              <Filter className="mr-2" size={16} />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Candidates List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="stats-card animate-pulse">
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredAttempts.length > 0 ? (
        <div className="space-y-4">
          {filteredAttempts.map((attempt) => {
            const test = tests.find(t => t.id === attempt.testId);
            return (
              <Card key={attempt.id} className="stats-card hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Brain className="text-primary" size={20} />
                        <h3 className="font-semibold text-gray-900">{attempt.candidateName}</h3>
                        {getStatusBadge(attempt.status)}
                        {attempt.percentageScore && (
                          <Badge className={`${getScoreColor(attempt.percentageScore)} bg-gray-100`}>
                            {attempt.percentageScore}%
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center">
                          <Mail className="mr-1" size={14} />
                          {attempt.candidateEmail}
                        </span>
                        <span className="flex items-center">
                          <Brain className="mr-1" size={14} />
                          {test?.testName || 'Unknown Test'}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="mr-1" size={14} />
                          {new Date(attempt.startedAt).toLocaleDateString()}
                        </span>
                      </div>

                      {attempt.status === 'completed' && attempt.completedAt && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Completed:</span> {new Date(attempt.completedAt).toLocaleString()}
                          {attempt.timeSpent && (
                            <span className="ml-4">
                              <span className="font-medium">Time:</span> {Math.round(attempt.timeSpent / 60)} minutes
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {attempt.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/test-results?attemptId=${attempt.id}`, '_blank')}
                        >
                          <Eye className="mr-1" size={14} />
                          View Results
                        </Button>
                      )}
                      
                      {canManageCandidates && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const testLink = generateTestLink(attempt.testId, attempt.candidateName, attempt.candidateEmail);
                            navigator.clipboard.writeText(testLink);
                            toast({
                              title: "Link Copied",
                              description: "Test link copied to clipboard",
                            });
                          }}
                        >
                          <Copy className="mr-1" size={14} />
                          Copy Link
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
            <Users className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || testFilter !== 'all'
                ? "Try adjusting your filters" 
                : "No test attempts have been recorded yet"}
            </p>
            {canManageCandidates && (
              <Button onClick={() => setShowInviteDialog(true)} className="btn-primary">
                <Send className="mr-2" size={16} />
                Invite First Candidate
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}