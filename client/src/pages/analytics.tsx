import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { 
  Brain,
  BarChart3,
  Users,
  Target,
  Download,
  TrendingUp,
  Award
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Analytics() {
  const { user } = useAuth();

  const { data: tests = [], isLoading: testsLoading } = useQuery({
    queryKey: ['/api/psychometric-tests'],
    retry: false,
  });

  const { data: attempts = [], isLoading: attemptsLoading } = useQuery({
    queryKey: ['/api/psychometric-test-attempts'],
    retry: false,
  });

  const canViewAnalytics = user?.role && ['hr_admin', 'recruiter'].includes(user.role);

  if (!canViewAnalytics) {
    return (
      <div className="p-6">
        <Card className="stats-card">
          <CardContent className="p-12 text-center">
            <Brain className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">You don't have permission to view analytics.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLoading = testsLoading || attemptsLoading;

  // Calculate metrics
  const totalTests = tests?.length || 0;
  const activeTests = tests?.filter(test => test.isActive).length || 0;
  const totalAttempts = attempts?.length || 0;
  const completedAttempts = attempts?.filter(attempt => attempt.status === 'completed').length || 0;
  const completionRate = totalAttempts > 0 ? Math.round((completedAttempts / totalAttempts) * 100) : 0;
  
  const averageScore = completedAttempts > 0 
    ? Math.round(attempts.filter(a => a.status === 'completed').reduce((sum, a) => sum + (a.percentageScore || 0), 0) / completedAttempts)
    : 0;

  // Test type breakdown
  const testTypes = [...new Set(tests?.map(test => test.testType).filter(Boolean) || [])];
  const testTypeStats = testTypes.map(type => ({
    name: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count: tests?.filter(test => test.testType === type).length || 0,
    attempts: attempts?.filter(attempt => {
      const test = tests.find(t => t.id === attempt.testId);
      return test?.testType === type;
    }).length || 0,
    avgScore: (() => {
      const typeAttempts = attempts.filter(attempt => {
        const test = tests.find(t => t.id === attempt.testId);
        return test?.testType === type && attempt.status === 'completed';
      });
      return typeAttempts.length > 0 
        ? Math.round(typeAttempts.reduce((sum, a) => sum + (a.percentageScore || 0), 0) / typeAttempts.length)
        : 0;
    })()
  }));

  // Score distribution
  const scoreRanges = [
    { range: 'Excellent (80-100%)', count: attempts?.filter(a => a.percentageScore >= 80).length || 0, color: 'bg-green/10 text-green-600' },
    { range: 'Good (60-79%)', count: attempts?.filter(a => a.percentageScore >= 60 && a.percentageScore < 80).length || 0, color: 'bg-yellow/10 text-yellow-600' },
    { range: 'Needs Improvement (0-59%)', count: attempts?.filter(a => a.percentageScore < 60).length || 0, color: 'bg-red/10 text-red-600' },
  ];

  const exportData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      metrics: {
        tests: { total: totalTests, active: activeTests },
        attempts: { total: totalAttempts, completed: completedAttempts, completionRate },
        performance: { averageScore }
      },
      testTypeBreakdown: testTypeStats,
      scoreDistribution: scoreRanges
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `psychometric-analytics-${new Date().toISOString().split('T')[0]}.json`;
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
          <h2 className="text-2xl font-semibold text-gray-900">Psychometric Testing Analytics</h2>
          <p className="text-gray-600 mt-1">Comprehensive analysis of testing performance and candidate insights</p>
        </div>
        
        <Button onClick={exportData} variant="outline">
          <Download className="mr-2" size={16} />
          Export Analytics
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Tests</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{activeTests}</p>
                <p className="text-accent text-sm font-medium mt-2 flex items-center">
                  <Brain className="mr-1" size={12} />
                  {totalTests} total
                </p>
              </div>
              <div className="stats-card-icon bg-primary/10 text-primary">
                <Brain size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Test Completion</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{completionRate}%</p>
                <p className="text-accent text-sm font-medium mt-2 flex items-center">
                  <Target className="mr-1" size={12} />
                  {completedAttempts} of {totalAttempts}
                </p>
              </div>
              <div className="stats-card-icon bg-accent/10 text-accent">
                <Users size={24} />
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
                <p className="text-warning text-sm font-medium mt-2 flex items-center">
                  <BarChart3 className="mr-1" size={12} />
                  Platform average
                </p>
              </div>
              <div className="stats-card-icon bg-warning/10 text-warning">
                <BarChart3 size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">High Performers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{attempts?.filter(a => a.percentageScore >= 80).length || 0}</p>
                <p className="text-gray-600 text-sm font-medium mt-2 flex items-center">
                  <Award className="mr-1" size={12} />
                  80%+ scores
                </p>
              </div>
              <div className="stats-card-icon bg-secondary/10 text-secondary">
                <Award size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Type Breakdown */}
        <Card className="stats-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Brain className="mr-2" size={20} />
              Test Type Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : testTypeStats.length > 0 ? (
              <div className="space-y-4">
                {testTypeStats.map((testType, index) => (
                  <div key={testType.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">{testType.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{testType.attempts} attempts</span>
                        <Badge variant="outline">{testType.avgScore}% avg</Badge>
                      </div>
                    </div>
                    <Progress value={testType.avgScore} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Brain className="mx-auto mb-4 text-gray-400" size={48} />
                <p>No test data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card className="stats-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Target className="mr-2" size={20} />
              Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {scoreRanges.map((range, index) => (
                  <div key={range.range} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{range.range}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{range.count}</span>
                      <Badge className={range.color}>
                        {completedAttempts > 0 ? Math.round((range.count / completedAttempts) * 100) : 0}%
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
              <div className="text-3xl font-bold text-accent mb-2">{completionRate}%</div>
              <p className="text-sm text-gray-600">Test Completion Rate</p>
              <p className="text-xs text-gray-500 mt-1">Candidates who finish tests</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {averageScore}%
              </div>
              <p className="text-sm text-gray-600">Average Test Score</p>
              <p className="text-xs text-gray-500 mt-1">Across all completed tests</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-warning mb-2">
                {completedAttempts > 0 ? Math.round((attempts?.filter(a => a.percentageScore >= 80).length || 0) / completedAttempts * 100) : 0}%
              </div>
              <p className="text-sm text-gray-600">Excellence Rate</p>
              <p className="text-xs text-gray-500 mt-1">Candidates scoring 80%+</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
