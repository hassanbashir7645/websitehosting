import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PsychometricTestsPDFExport } from '@/components/pdf-export';
import { ScoringGuidePDFExport } from '@/components/scoring-guide-pdf';
import { CompleteAnswerKeyPDF } from '@/components/complete-answer-key-pdf';
import { 
  FileText, 
  Download, 
  BarChart3,
  Brain,
  Key,
  Target,
  Users,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Reports() {
  const { user } = useAuth();

  const canViewReports = user?.role && ['hr_admin', 'recruiter', 'hiring_manager'].includes(user.role);

  if (!canViewReports) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-gray-600">You don't have permission to view reports.</p>
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
          <h2 className="text-2xl font-semibold text-gray-900">Reports & Documentation</h2>
          <p className="text-gray-600 mt-1">Generate comprehensive reports and export test documentation</p>
        </div>
      </div>

      <Tabs defaultValue="test-exports" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="test-exports">Test Exports</TabsTrigger>
          <TabsTrigger value="scoring-guides">Scoring Guides</TabsTrigger>
          <TabsTrigger value="answer-keys">Answer Keys</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Reports</TabsTrigger>
        </TabsList>

        {/* Test Exports Tab */}
        <TabsContent value="test-exports" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <PsychometricTestsPDFExport />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Candidate Results Export
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p>Export all candidate test results with detailed analysis and recommendations.</p>
                    <p className="mt-2">
                      <strong>Includes:</strong>
                    </p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Individual candidate scores</li>
                      <li>Test completion statistics</li>
                      <li>Performance analytics</li>
                      <li>Hiring recommendations</li>
                    </ul>
                  </div>

                  <Button className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Export Candidate Results
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p>Generate executive summary of testing platform performance and insights.</p>
                    <p className="mt-2">
                      <strong>Includes:</strong>
                    </p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Platform usage statistics</li>
                      <li>Test completion rates</li>
                      <li>Score distributions</li>
                      <li>Trend analysis</li>
                    </ul>
                  </div>

                  <Button className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Generate Summary Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Scoring Guides Tab */}
        <TabsContent value="scoring-guides" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <ScoringGuidePDFExport />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Interpretation Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p>Comprehensive guide for interpreting test results and making hiring decisions.</p>
                    <p className="mt-2">
                      <strong>Includes:</strong>
                    </p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Score interpretation frameworks</li>
                      <li>Hiring decision matrices</li>
                      <li>Role-specific guidelines</li>
                      <li>Best practices for assessment</li>
                    </ul>
                  </div>

                  <Button className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Guidelines
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Answer Keys Tab */}
        <TabsContent value="answer-keys" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <CompleteAnswerKeyPDF />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="mr-2 h-5 w-5" />
                  Test Administration Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p>Complete guide for test administrators including setup, monitoring, and troubleshooting.</p>
                    <p className="mt-2">
                      <strong>Includes:</strong>
                    </p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Test setup procedures</li>
                      <li>Candidate instruction scripts</li>
                      <li>Technical troubleshooting</li>
                      <li>Quality assurance checklists</li>
                    </ul>
                  </div>

                  <Button className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Admin Guide
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Reports Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Platform Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p>Comprehensive analytics report covering platform usage and performance metrics.</p>
                    <p className="mt-2">
                      <strong>Metrics:</strong>
                    </p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Test completion rates</li>
                      <li>Average scores by test type</li>
                      <li>Time-to-completion analysis</li>
                      <li>User engagement metrics</li>
                    </ul>
                  </div>

                  <Button className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Generate Analytics Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Candidate Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p>Detailed analysis of candidate performance across all assessments.</p>
                    <p className="mt-2">
                      <strong>Analysis:</strong>
                    </p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Score distributions</li>
                      <li>Performance trends</li>
                      <li>Comparative analysis</li>
                      <li>Predictive insights</li>
                    </ul>
                  </div>

                  <Button className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Export Candidate Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Hiring Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p>Strategic insights and recommendations for improving hiring outcomes.</p>
                    <p className="mt-2">
                      <strong>Insights:</strong>
                    </p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Success pattern analysis</li>
                      <li>Test effectiveness metrics</li>
                      <li>Hiring recommendations</li>
                      <li>Process optimization</li>
                    </ul>
                  </div>

                  <Button className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Generate Insights Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}