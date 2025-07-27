import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Plus, 
  Eye, 
  Copy,
  BarChart3,
  Users,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  Send,
  Link
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';
import { PsychometricTestsPDFExport } from '@/components/pdf-export';
import { ScoringGuidePDFExport } from '@/components/scoring-guide-pdf';
import { CompleteAnswerKeyPDF } from '@/components/complete-answer-key-pdf';

export default function PsychometricAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [newTest, setNewTest] = useState({
    testName: '',
    testType: '',
    description: '',
    instructions: '',
    timeLimit: 60,
  });

  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    questionType: 'scale',
    options: [''],
    category: '',
  });

  // Fetch all tests
  const { data: tests = [], isLoading: testsLoading } = useQuery({
    queryKey: ['/api/psychometric-tests'],
  });

  // Debug logging
  console.log('Psychometric tests data:', tests);
  console.log('Number of tests:', tests.length);

  // Fetch test attempts
  const { data: attempts = [], isLoading: attemptsLoading } = useQuery({
    queryKey: ['/api/psychometric-test-attempts'],
  });

  // Create test mutation
  const createTestMutation = useMutation({
    mutationFn: async (testData: any) => {
      return await apiRequest('/api/psychometric-tests', {
        method: 'POST',
        body: testData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/psychometric-tests'] });
      toast({
        title: "Test Created",
        description: "Psychometric test created successfully",
      });
      setNewTest({
        testName: '',
        testType: '',
        description: '',
        instructions: '',
        timeLimit: 60,
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
        description: "Failed to create test",
        variant: "destructive",
      });
    },
  });

  // Generate test link mutation
  const generateLinkMutation = useMutation({
    mutationFn: async ({ testId, candidateEmail, candidateName }: any) => {
      const baseUrl = window.location.origin;
      const testLink = `${baseUrl}/psychometric-test?testId=${testId}&email=${encodeURIComponent(candidateEmail)}&name=${encodeURIComponent(candidateName)}`;
      return { testLink, candidateEmail, candidateName };
    },
    onSuccess: (result) => {
      navigator.clipboard.writeText(result.testLink);
      toast({
        title: "Test Link Generated",
        description: "Test link copied to clipboard",
      });
    },
  });

  const handleCreateTest = () => {
    if (!newTest.testName || !newTest.testType) {
      toast({
        title: "Missing Information",
        description: "Please provide test name and type",
        variant: "destructive",
      });
      return;
    }

    createTestMutation.mutate({
      ...newTest,
      totalQuestions: 0, // Will be updated when questions are added
    });
  };

  const getTestTypeColor = (type: string | undefined | null) => {
    if (!type) return 'bg-gray-100 text-gray-800';
    
    switch (type) {
      case 'personality':
        return 'bg-purple-100 text-purple-800';
      case 'cognitive':
        return 'bg-blue-100 text-blue-800';
      case 'aptitude':
        return 'bg-green-100 text-green-800';
      case 'emotional_intelligence':
        return 'bg-orange-100 text-orange-800';
      case 'integrity':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string | undefined | null) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'abandoned':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (user?.role !== 'hr_admin' && user?.role !== 'branch_manager') {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-gray-600">Only HR administrators and branch managers can access psychometric test management.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Psychometric Test Management</h2>
          <p className="text-gray-600 mt-1">Create and manage pre-employment assessments</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Psychometric Test</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="testName">Test Name</Label>
                  <Input
                    id="testName"
                    value={newTest.testName}
                    onChange={(e) => setNewTest(prev => ({ ...prev, testName: e.target.value }))}
                    placeholder="e.g., Personality Assessment"
                  />
                </div>
                <div>
                  <Label htmlFor="testType">Test Type</Label>
                  <Select 
                    value={newTest.testType}
                    onValueChange={(value) => setNewTest(prev => ({ ...prev, testType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select test type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personality">Personality</SelectItem>
                      <SelectItem value="cognitive">Cognitive</SelectItem>
                      <SelectItem value="aptitude">Aptitude</SelectItem>
                      <SelectItem value="emotional_intelligence">Emotional Intelligence</SelectItem>
                      <SelectItem value="integrity">Integrity & Honesty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTest.description}
                  onChange={(e) => setNewTest(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the test..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={newTest.instructions}
                  onChange={(e) => setNewTest(prev => ({ ...prev, instructions: e.target.value }))}
                  placeholder="Detailed instructions for test takers..."
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  value={newTest.timeLimit}
                  onChange={(e) => setNewTest(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                  min="5"
                  max="180"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Cancel</Button>
                <Button 
                  onClick={handleCreateTest}
                  disabled={createTestMutation.isPending}
                >
                  {createTestMutation.isPending ? 'Creating...' : 'Create Test'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="tests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="attempts">Test Results</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="export">Export PDF</TabsTrigger>
        </TabsList>

        {/* Tests Tab */}
        <TabsContent value="tests" className="space-y-6">
          <div className="grid gap-6">
            {testsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading tests...</p>
              </div>
            ) : tests.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tests Created</h3>
                  <p className="text-gray-600 mb-4">Create your first psychometric test to get started with pre-employment assessments.</p>
                </CardContent>
              </Card>
            ) : (
              tests.map((test: any) => (
                <Card key={test.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{test.testName}</h3>
                          <Badge className={getTestTypeColor(test.testType)}>
                            {test.testType ? test.testType.replace('_', ' ') : 'Unknown'}
                          </Badge>
                          <Badge variant={test.isActive ? "default" : "secondary"}>
                            {test.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-4">{test.description}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{test.timeLimit} minutes</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <BarChart3 className="h-4 w-4" />
                            <span>{test.totalQuestions} questions</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{attempts.filter((a: any) => a.testId === test.id).length} attempts</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Link className="mr-2 h-4 w-4" />
                              Generate Link
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Generate Test Link</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="candidateName">Candidate Name</Label>
                                <Input
                                  id="candidateName"
                                  placeholder="Enter candidate's full name"
                                />
                              </div>
                              <div>
                                <Label htmlFor="candidateEmail">Candidate Email</Label>
                                <Input
                                  id="candidateEmail"
                                  type="email"
                                  placeholder="Enter candidate's email"
                                />
                              </div>
                              <Button
                                onClick={() => {
                                  const nameInput = document.getElementById('candidateName') as HTMLInputElement;
                                  const emailInput = document.getElementById('candidateEmail') as HTMLInputElement;
                                  if (nameInput.value && emailInput.value) {
                                    generateLinkMutation.mutate({
                                      testId: test.id,
                                      candidateName: nameInput.value,
                                      candidateEmail: emailInput.value
                                    });
                                  }
                                }}
                                className="w-full"
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                Generate & Copy Link
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedTest(test)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Questions
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Test
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit Test: {test.testName}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="editTestName">Test Name</Label>
                                  <Input
                                    id="editTestName"
                                    defaultValue={test.testName}
                                    placeholder="e.g., Personality Assessment"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="editTestType">Test Type</Label>
                                  <Select defaultValue={test.testType}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="personality">Personality</SelectItem>
                                      <SelectItem value="cognitive">Cognitive</SelectItem>
                                      <SelectItem value="aptitude">Aptitude</SelectItem>
                                      <SelectItem value="emotional_intelligence">Emotional Intelligence</SelectItem>
                                      <SelectItem value="integrity">Integrity & Honesty</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              
                              <div>
                                <Label htmlFor="editDescription">Description</Label>
                                <Textarea
                                  id="editDescription"
                                  defaultValue={test.description}
                                  rows={3}
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="editInstructions">Instructions</Label>
                                <Textarea
                                  id="editInstructions"
                                  defaultValue={test.instructions}
                                  rows={4}
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="editTimeLimit">Time Limit (minutes)</Label>
                                <Input
                                  id="editTimeLimit"
                                  type="number"
                                  defaultValue={test.timeLimit}
                                  min="5"
                                  max="180"
                                />
                              </div>
                              
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline">Cancel</Button>
                                <Button>Save Changes</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this test?')) {
                              // Handle delete
                            }
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Attempts Tab */}
        <TabsContent value="attempts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Test Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              {attemptsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading attempts...</p>
                </div>
              ) : attempts.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">No test attempts yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {attempts.map((attempt: any) => (
                    <div key={attempt.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{attempt.candidateName}</h4>
                          <Badge className={getStatusColor(attempt.status)}>
                            {attempt.status ? attempt.status.replace('_', ' ') : 'Unknown'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{attempt.candidateEmail}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Test: {tests.find((t: any) => t.id === attempt.testId)?.testName}</span>
                          <span>Completed: {new Date(attempt.completedAt || attempt.startedAt).toLocaleDateString()}</span>
                          {attempt.percentageScore && (
                            <span>Score: {attempt.percentageScore}%</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {attempt.status === 'completed' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              window.open(`/test-results?attemptId=${attempt.id}`, '_blank');
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Results
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Send className="mr-2 h-4 w-4" />
                          Email Results
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Tests</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{tests.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Brain className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Attempts</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{attempts.length}</p>
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
                    <p className="text-gray-600 text-sm font-medium">Completion Rate</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {attempts.length > 0 
                        ? Math.round((attempts.filter((a: any) => a.status === 'completed').length / attempts.length) * 100)
                        : 0}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Export PDF Tab */}
        <TabsContent value="export" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <PsychometricTestsPDFExport />
            <ScoringGuidePDFExport />
            <CompleteAnswerKeyPDF />
          </div>
        </TabsContent>
      </Tabs>

      {/* Questions Modal */}
      {selectedTest && (
        <Dialog open={!!selectedTest} onOpenChange={() => setSelectedTest(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Questions: {selectedTest.testName}</DialogTitle>
            </DialogHeader>
            <QuestionsView testId={selectedTest.id} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Questions View Component
function QuestionsView({ testId }: { testId: number }) {
  const { data: questions = [], isLoading } = useQuery({
    queryKey: [`/api/psychometric-tests/${testId}/questions`],
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading questions...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Questions Yet</h3>
        <p className="text-gray-600">This test doesn't have any questions yet. Add some questions to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question: any, index: number) => (
        <Card key={question.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline">Q{index + 1}</Badge>
                <Badge className="bg-blue-100 text-blue-800">{question.category}</Badge>
                <Badge variant="secondary">{question.questionType}</Badge>
              </div>
              <p className="text-gray-900 font-medium mb-2">{question.questionText}</p>
              {question.options && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 font-medium">Options:</p>
                  <ul className="text-sm text-gray-600 ml-4">
                    {Array.isArray(question.options) ? question.options.map((option: string, i: number) => (
                      <li key={i} className="list-disc">
                        {option}
                        {question.correctAnswer === option && (
                          <Badge className="ml-2 bg-green-100 text-green-800">Correct</Badge>
                        )}
                      </li>
                    )) : (
                      <li className="text-red-500">Invalid options format</li>
                    )}
                  </ul>
                </div>
              )}
              {question.questionType === 'scale' && (
                <p className="text-sm text-gray-600">Scale: 1 (Strongly Disagree) to 5 (Strongly Agree)</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}