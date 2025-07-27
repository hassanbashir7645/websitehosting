import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Clock, 
  Brain, 
  CheckCircle, 
  AlertTriangle,
  User,
  Mail,
  Timer,
  BarChart3,
  FileText,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface TestQuestion {
  id: number;
  questionText: string;
  questionType: 'multiple_choice' | 'scale' | 'yes_no';
  options?: string[];
  category: string;
}

interface TestAttempt {
  id: number;
  candidateEmail: string;
  candidateName: string;
  testId: number;
  responses: any[];
  startedAt: string;
  completedAt?: string;
  timeSpent?: number;
  totalScore?: number;
  percentageScore?: number;
  results?: any;
  status: 'in_progress' | 'completed' | 'abandoned';
}

export default function PsychometricTest() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Extract test ID from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const testId = urlParams.get('testId');
  const candidateEmail = urlParams.get('email');
  const candidateName = urlParams.get('name');

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [testStarted, setTestStarted] = useState(false);
  const [candidateInfo, setCandidateInfo] = useState({
    name: candidateName || '',
    email: candidateEmail || ''
  });

  // Fetch test details
  const { data: test, isLoading: testLoading } = useQuery({
    queryKey: [`/api/psychometric-tests/${testId}`],
    enabled: !!testId,
  });

  // Fetch test questions
  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: [`/api/psychometric-tests/${testId}/questions`],
    enabled: !!testId && testStarted,
  });

  // Submit test attempt
  const submitTestMutation = useMutation({
    mutationFn: async (attemptData: any) => {
      return await apiRequest('POST', '/api/psychometric-test-attempts', attemptData);
    },
    onSuccess: (result) => {
      toast({
        title: "Test Submitted Successfully",
        description: "Your psychometric assessment has been completed.",
      });
      setLocation(`/test-results?attemptId=${result.id}`);
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your test. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Timer effect
  useEffect(() => {
    if (testStarted && timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [testStarted, timeRemaining]);

  const handleStartTest = () => {
    if (!candidateInfo.name || !candidateInfo.email) {
      toast({
        title: "Missing Information",
        description: "Please provide your name and email to start the test.",
        variant: "destructive",
      });
      return;
    }

    setTestStarted(true);
    if (test?.timeLimit) {
      setTimeRemaining(test.timeLimit * 60); // Convert minutes to seconds
    }
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitTest = () => {
    const endTime = new Date();
    const timeSpent = test?.timeLimit ? (test.timeLimit * 60) - (timeRemaining || 0) : null;

    const attemptData = {
      candidateEmail: candidateInfo.email,
      candidateName: candidateInfo.name,
      testId: parseInt(testId!),
      responses: questions.map((q: TestQuestion) => ({
        questionId: q.id,
        answer: responses[q.id] || '',
        category: q.category
      })),
      completedAt: endTime.toISOString(),
      timeSpent,
      status: 'completed'
    };

    submitTestMutation.mutate(attemptData);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getCompletionPercentage = () => {
    const answered = Object.keys(responses).length;
    return questions.length > 0 ? Math.round((answered / questions.length) * 100) : 0;
  };

  const renderScaleQuestion = (question: TestQuestion) => (
    <div className="space-y-4">
      <p className="text-lg font-medium text-gray-900">{question.questionText}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Strongly Disagree</span>
        <span className="text-sm text-gray-600">Strongly Agree</span>
      </div>
      <RadioGroup
        value={responses[question.id] || ''}
        onValueChange={(value) => handleAnswerChange(question.id, value)}
        className="flex justify-between"
      >
        {[1, 2, 3, 4, 5].map((value) => (
          <div key={value} className="flex flex-col items-center space-y-2">
            <RadioGroupItem value={value.toString()} id={`q${question.id}-${value}`} />
            <Label htmlFor={`q${question.id}-${value}`} className="text-sm font-medium">
              {value}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );

  const renderMultipleChoiceQuestion = (question: TestQuestion) => (
    <div className="space-y-4">
      <p className="text-lg font-medium text-gray-900">{question.questionText}</p>
      <RadioGroup
        value={responses[question.id] || ''}
        onValueChange={(value) => handleAnswerChange(question.id, value)}
        className="space-y-3"
      >
        {question.options?.map((option, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <RadioGroupItem value={option} id={`q${question.id}-${index}`} />
            <Label htmlFor={`q${question.id}-${index}`} className="flex-1 cursor-pointer">
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );

  const renderYesNoQuestion = (question: TestQuestion) => (
    <div className="space-y-4">
      <p className="text-lg font-medium text-gray-900">{question.questionText}</p>
      <RadioGroup
        value={responses[question.id] || ''}
        onValueChange={(value) => handleAnswerChange(question.id, value)}
        className="flex space-x-8"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="yes" id={`q${question.id}-yes`} />
          <Label htmlFor={`q${question.id}-yes`}>Yes</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="no" id={`q${question.id}-no`} />
          <Label htmlFor={`q${question.id}-no`}>No</Label>
        </div>
      </RadioGroup>
    </div>
  );

  if (!testId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Test Link</h2>
            <p className="text-gray-600">This test link is invalid or has expired.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (testLoading || questionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">{test?.testName}</CardTitle>
              <p className="text-gray-600 mt-2">{test?.description}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Candidate Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Candidate Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={candidateInfo.name}
                        onChange={(e) => setCandidateInfo(prev => ({ ...prev, name: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={candidateInfo.email}
                        onChange={(e) => setCandidateInfo(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Test Information */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Instructions</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700">
                      <strong>{test?.totalQuestions}</strong> questions total
                    </span>
                  </div>
                  {test?.timeLimit && (
                    <div className="flex items-center space-x-3">
                      <Timer className="h-5 w-5 text-blue-600" />
                      <span className="text-gray-700">
                        <strong>{test.timeLimit}</strong> minutes time limit
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700">
                      Assessment type: <strong>{test?.testType.replace('_', ' ')}</strong>
                    </span>
                  </div>
                </div>
                {test?.instructions && (
                  <div className="mt-4 p-4 bg-white rounded border">
                    <p className="text-gray-700">{test.instructions}</p>
                  </div>
                )}
              </div>

              <div className="text-center">
                <Button 
                  onClick={handleStartTest}
                  size="lg"
                  className="px-8"
                  disabled={!candidateInfo.name || !candidateInfo.email}
                >
                  Start Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{test?.testName}</h1>
              <p className="text-gray-600">Question {currentQuestionIndex + 1} of {questions.length}</p>
            </div>
            {timeRemaining !== null && (
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <span className="text-lg font-mono font-semibold text-gray-900">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{getCompletionPercentage()}% complete</span>
            </div>
            <Progress value={(currentQuestionIndex + 1) / questions.length * 100} className="w-full" />
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardContent className="p-8">
            {currentQuestion && (
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Badge variant="outline" className="mt-1">
                    {currentQuestion.category}
                  </Badge>
                </div>
                
                {currentQuestion.questionType === 'scale' && renderScaleQuestion(currentQuestion)}
                {currentQuestion.questionType === 'multiple_choice' && renderMultipleChoiceQuestion(currentQuestion)}
                {currentQuestion.questionType === 'yes_no' && renderYesNoQuestion(currentQuestion)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <div className="flex space-x-4">
            {isLastQuestion ? (
              <Button
                onClick={handleSubmitTest}
                disabled={submitTestMutation.isPending}
                className="px-8"
              >
                {submitTestMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Test
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                disabled={!responses[currentQuestion?.id]}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Question Navigation */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Overview</h3>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-blue-600 text-white'
                    : responses[questions[index]?.id]
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}