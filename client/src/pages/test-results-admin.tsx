import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Search, 
  Filter, 
  Eye, 
  Download,
  Brain,
  Users,
  Target,
  Award,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function TestResultsAdmin() {
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [testFilter, setTestFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');

  const { data: attempts = [], isLoading } = useQuery({
    queryKey: ['/api/psychometric-test-attempts'],
  });

  const { data: tests = [] } = useQuery({
    queryKey: ['/api/psychometric-tests'],
  });

  const completedAttempts = attempts.filter(a => a.status === 'completed');

  const filteredAttempts = completedAttempts.filter(attempt => {
    const matchesSearch = !searchTerm || 
      attempt.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attempt.candidateEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTest = testFilter === 'all' || attempt.testId.toString() === testFilter;
    
    let matchesScore = true;
    if (scoreFilter === 'excellent') matchesScore = attempt.percentageScore >= 80;
    else if (scoreFilter === 'good') matchesScore = attempt.percentageScore >= 60 && attempt.percentageScore < 80;
    else if (scoreFilter === 'poor') matchesScore = attempt.percentageScore < 60;
    
    return matchesSearch && matchesTest && matchesScore;
  });

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };

  const getTestTypeColor = (testType: string) => {
    const colorMap = {
      personality: 'bg-purple-100 text-purple-800',
      cognitive: 'bg-blue-100 text-blue-800',
      emotional_intelligence: 'bg-green-100 text-green-800',
      integrity: 'bg-orange-100 text-orange-800',
    };
    return colorMap[testType] || 'bg-gray-100 text-gray-800';
  };

  // Calculate statistics
  const averageScore = completedAttempts.length > 0 
    ? Math.round(completedAttempts.reduce((sum, a) => sum + (a.percentageScore || 0), 0) / completedAttempts.length)
    : 0;

  const excellentCount = completedAttempts.filter(a => a.percentageScore >= 80).length;
  const goodCount = completedAttempts.filter(a => a.percentageScore >= 60 && a.percentageScore < 80).length;
  const poorCount = completedAttempts.filter(a => a.percentageScore < 60).length;

  const canViewResults = user?.role && ['hr_admin', 'recruiter', 'hiring_manager'].includes(user.role);

  if (!canViewResults) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-gray-600">You don't have permission to view test results.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Test Results & Analytics</h2>
          <p className="text-gray-600 mt-1">Comprehensive analysis of candidate assessments</p>
        </div>
        
        <Button variant="outline">
          <Download className="mr-2" size={16} />
          Export Results
        </Button>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Results</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{completedAttempts.length}</p>
              </div>
              <div className="stats-card-icon bg-primary/10 text-primary">
                <BarChart3 size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Average Score</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{averageScore}%</p>
              </div>
              <div className="stats-card-icon bg-blue/10 text-blue-600">
                <Target size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Excellent (80%+)</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{excellentCount}</p>
              </div>
              <div className="stats-card-icon bg-green/10 text-green-600">
                <Award size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Success Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {completedAttempts.length > 0 ? Math.round(((excellentCount + goodCount) / completedAttempts.length) * 100) : 0}%
                </p>
              </div>
              <div className="stats-card-icon bg-purple/10 text-purple-600">
                <TrendingUp size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Distribution */}
      <Card className="stats-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Score Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Excellent (80-100%)</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${completedAttempts.length > 0 ? (excellentCount / completedAttempts.length) * 100 : 0}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-12 text-right">{excellentCount}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Good (60-79%)</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${completedAttempts.length > 0 ? (goodCount / completedAttempts.length) * 100 : 0}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-12 text-right">{goodCount}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Needs Improvement (0-59%)</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${completedAttempts.length > 0 ? (poorCount / completedAttempts.length) * 100 : 0}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-12 text-right">{poorCount}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
            
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="excellent">Excellent (80%+)</SelectItem>
                <SelectItem value="good">Good (60-79%)</SelectItem>
                <SelectItem value="poor">Needs Improvement (0-59%)</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setTestFilter('all');
                setScoreFilter('all');
              }}
            >
              <Filter className="mr-2" size={16} />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results List */}
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
                      <div className="flex items-center space-x-3 mb-3">
                        <Brain className="text-primary" size={20} />
                        <h3 className="font-semibold text-gray-900">{attempt.candidateName}</h3>
                        {getScoreBadge(attempt.percentageScore || 0)}
                        {test && (
                          <Badge className={getTestTypeColor(test.testType)}>
                            {test.testType.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">{attempt.candidateEmail}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Test</p>
                          <p className="font-medium">{test?.testName || 'Unknown Test'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Completed</p>
                          <p className="font-medium">{new Date(attempt.completedAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Score:</span>
                          <span className={`font-bold text-lg ${attempt.percentageScore >= 80 ? 'text-green-600' : attempt.percentageScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {attempt.percentageScore}%
                          </span>
                        </div>
                        {attempt.timeSpent && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Time:</span>
                            <span className="font-medium">{Math.round(attempt.timeSpent / 60)} min</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Questions:</span>
                          <span className="font-medium">{test?.totalQuestions || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/test-results?attemptId=${attempt.id}`, '_blank')}
                      >
                        <Eye className="mr-1" size={14} />
                        View Details
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        <Download className="mr-1" size={14} />
                        Export PDF
                      </Button>
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
            <BarChart3 className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || testFilter !== 'all' || scoreFilter !== 'all'
                ? "Try adjusting your filters" 
                : "No completed test results available yet"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}