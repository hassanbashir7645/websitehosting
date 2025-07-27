import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  UserPlus, 
  CheckCircle, 
  Clock, 
  Upload, 
  FileText, 
  Phone, 
  Mail, 
  MapPin,
  Users,
  Shield,
  Calendar,
  AlertCircle,
  Download
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { FileUpload } from '@/components/FileUpload';

// Comprehensive employee onboarding form schema
const employeeOnboardingSchema = z.object({
  // Personal Information
  personalInfo: z.object({
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
    alternatePhone: z.string().optional(),
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().min(5, 'ZIP code is required'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    emergencyContactName: z.string().min(2, 'Emergency contact name is required'),
    emergencyContactPhone: z.string().min(10, 'Emergency contact phone is required'),
    emergencyContactRelation: z.string().min(2, 'Emergency contact relation is required'),
  }),
  
  // Employment Information
  employmentInfo: z.object({
    preferredName: z.string().optional(),
    tShirtSize: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
    department: z.string().min(1, 'Department is required'),
    position: z.string().min(1, 'Position is required'),
    startDate: z.string().min(1, 'Start date is required'),
    workLocation: z.enum(['Office', 'Remote', 'Hybrid']),
    managerId: z.string().optional(),
  }),
  
  // Banking & Tax Information
  payrollInfo: z.object({
    bankName: z.string().min(2, 'Bank name is required'),
    accountType: z.enum(['Checking', 'Savings']),
    accountNumber: z.string().min(8, 'Account number is required'),
    routingNumber: z.string().min(9, 'Routing number must be 9 digits'),
    taxWithholdingAllowances: z.number().min(0, 'Tax allowances must be 0 or greater'),
    additionalTaxWithholding: z.number().optional(),
  }),
  
  // IT & Security
  itSetup: z.object({
    computerType: z.enum(['Laptop', 'Desktop', 'Both']),
    operatingSystem: z.enum(['Windows', 'MacOS', 'Linux']),
    softwareNeeds: z.array(z.string()).optional(),
    accessRequests: z.array(z.string()).optional(),
    securityTrainingCompleted: z.boolean().default(false),
  }),
  
  // Documents & Agreements
  documents: z.object({
    i9FormCompleted: z.boolean().default(false),
    w4FormCompleted: z.boolean().default(false),
    handbookReceived: z.boolean().default(false),
    codeOfConductSigned: z.boolean().default(false),
    confidentialityAgreementSigned: z.boolean().default(false),
    benefitsEnrollmentCompleted: z.boolean().default(false),
  }),
  
  // Additional Information
  additionalInfo: z.object({
    dietaryRestrictions: z.string().optional(),
    accessibilityNeeds: z.string().optional(),
    previousExperience: z.string().optional(),
    goals: z.string().optional(),
    questionsOrConcerns: z.string().optional(),
  }),
});

type EmployeeOnboardingData = z.infer<typeof employeeOnboardingSchema>;

// Predefined comprehensive onboarding checklist
const defaultOnboardingChecklist = [
  {
    category: "Pre-arrival Setup",
    items: [
      { title: "Workspace Setup", description: "Prepare desk, chair, and basic office supplies", dueDate: -1 },
      { title: "IT Equipment Assignment", description: "Assign laptop, monitor, keyboard, mouse", dueDate: -1 },
      { title: "Email Account Creation", description: "Create company email account and send credentials", dueDate: -1 },
      { title: "Access Card Preparation", description: "Prepare building access card and parking pass", dueDate: -1 },
      { title: "Welcome Package", description: "Prepare welcome kit with company swag and materials", dueDate: -1 },
    ]
  },
  {
    category: "Day 1 - Welcome & Orientation",
    items: [
      { title: "Welcome Meeting", description: "Meet with direct manager and HR representative", dueDate: 1 },
      { title: "Office Tour", description: "Complete office tour including emergency exits and facilities", dueDate: 1 },
      { title: "Meet Team Members", description: "Introduction to immediate team and key colleagues", dueDate: 1 },
      { title: "IT Setup & Login", description: "Complete computer setup and test all system access", dueDate: 1 },
      { title: "Company Overview Presentation", description: "Attend company overview and culture presentation", dueDate: 1 },
      { title: "Employee Handbook Review", description: "Review and acknowledge employee handbook", dueDate: 1 },
    ]
  },
  {
    category: "Week 1 - Documentation & Training",
    items: [
      { title: "Complete I-9 Form", description: "Submit I-9 form with required documentation", dueDate: 3 },
      { title: "Submit W-4 Form", description: "Complete and submit tax withholding form", dueDate: 3 },
      { title: "Benefits Enrollment", description: "Complete health, dental, and retirement plan enrollment", dueDate: 5 },
      { title: "Emergency Contact Information", description: "Provide emergency contact details", dueDate: 2 },
      { title: "Direct Deposit Setup", description: "Submit banking information for payroll", dueDate: 5 },
      { title: "Security Training", description: "Complete mandatory security awareness training", dueDate: 5 },
      { title: "Confidentiality Agreement", description: "Sign confidentiality and non-disclosure agreement", dueDate: 3 },
    ]
  },
  {
    category: "Week 2 - Role-Specific Training",
    items: [
      { title: "Department-Specific Training", description: "Complete role-specific training modules", dueDate: 10 },
      { title: "Mentor Assignment", description: "Meet with assigned workplace mentor", dueDate: 8 },
      { title: "System Access Verification", description: "Verify access to all required systems and databases", dueDate: 10 },
      { title: "Performance Goals Setting", description: "Establish 30-60-90 day performance goals", dueDate: 14 },
      { title: "Project Assignment", description: "Receive first project assignment and overview", dueDate: 14 },
    ]
  },
  {
    category: "Month 1 - Integration & Assessment",
    items: [
      { title: "30-Day Check-in", description: "Formal 30-day review with manager", dueDate: 30 },
      { title: "HR Feedback Session", description: "Feedback session with HR about onboarding experience", dueDate: 30 },
      { title: "Workplace Culture Assessment", description: "Complete workplace culture and satisfaction survey", dueDate: 30 },
      { title: "Training Progress Review", description: "Review completion of all mandatory training", dueDate: 30 },
      { title: "Goal Progress Check", description: "Review progress on initial performance goals", dueDate: 30 },
    ]
  },
  {
    category: "Ongoing - Long-term Integration",
    items: [
      { title: "60-Day Review", description: "Comprehensive 60-day performance review", dueDate: 60 },
      { title: "90-Day Review", description: "Final onboarding review and transition to regular employee", dueDate: 90 },
      { title: "Professional Development Plan", description: "Create long-term professional development plan", dueDate: 90 },
      { title: "Company Social Integration", description: "Participate in company social events and team building", dueDate: 90 },
    ]
  }
];

export default function EmployeeOnboardingPortal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const form = useForm<EmployeeOnboardingData>({
    resolver: zodResolver(employeeOnboardingSchema),
    defaultValues: {
      personalInfo: {
        phoneNumber: '',
        alternatePhone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        dateOfBirth: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelation: '',
      },
      employmentInfo: {
        preferredName: '',
        tShirtSize: 'M',
        department: '',
        position: '',
        startDate: '',
        workLocation: 'Office',
        managerId: '',
      },
      payrollInfo: {
        bankName: '',
        accountType: 'Checking',
        accountNumber: '',
        routingNumber: '',
        taxWithholdingAllowances: 0,
        additionalTaxWithholding: 0,
      },
      itSetup: {
        computerType: 'Laptop',
        operatingSystem: 'Windows',
        softwareNeeds: [],
        accessRequests: [],
        securityTrainingCompleted: false,
      },
      documents: {
        i9FormCompleted: false,
        w4FormCompleted: false,
        handbookReceived: false,
        codeOfConductSigned: false,
        confidentialityAgreementSigned: false,
        benefitsEnrollmentCompleted: false,
      },
      additionalInfo: {
        dietaryRestrictions: '',
        accessibilityNeeds: '',
        previousExperience: '',
        goals: '',
        questionsOrConcerns: '',
      },
    },
  });

  const { data: onboardingProgress } = useQuery({
    queryKey: ['/api/onboarding/progress'],
    retry: false,
  });

  const saveProgressMutation = useMutation({
    mutationFn: async (data: Partial<EmployeeOnboardingData>) => {
      return await apiRequest('POST', '/api/onboarding/save-progress', data);
    },
    onSuccess: () => {
      toast({
        title: "Progress Saved",
        description: "Your onboarding progress has been saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/onboarding/progress'] });
    },
  });

  const submitOnboardingMutation = useMutation({
    mutationFn: async (data: EmployeeOnboardingData) => {
      return await apiRequest('POST', '/api/onboarding/submit', data);
    },
    onSuccess: () => {
      toast({
        title: "Onboarding Completed",
        description: "Your onboarding information has been submitted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/onboarding/progress'] });
    },
  });

  const steps = [
    { title: "Personal Information", icon: Users },
    { title: "Employment Details", icon: Shield },
    { title: "Payroll & Banking", icon: Calendar },
    { title: "IT & Security", icon: Shield },
    { title: "Documents & Agreements", icon: FileText },
    { title: "Additional Information", icon: AlertCircle },
  ];

  const isStepComplete = (stepIndex: number) => completedSteps.includes(stepIndex);
  const progress = (completedSteps.length / steps.length) * 100;

  const onSubmit = (data: EmployeeOnboardingData) => {
    if (currentStep < steps.length - 1) {
      // Save progress and move to next step
      saveProgressMutation.mutate(data);
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    } else {
      // Final submission
      submitOnboardingMutation.mutate(data);
    }
  };

  const renderPersonalInfoStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="personalInfo.phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number *</FormLabel>
              <FormControl>
                <Input placeholder="(555) 123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="personalInfo.alternatePhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alternate Phone</FormLabel>
              <FormControl>
                <Input placeholder="(555) 987-6543" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="personalInfo.address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Street Address *</FormLabel>
            <FormControl>
              <Input placeholder="123 Main Street" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="personalInfo.city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City *</FormLabel>
              <FormControl>
                <Input placeholder="New York" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="personalInfo.state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State *</FormLabel>
              <FormControl>
                <Input placeholder="NY" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="personalInfo.zipCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ZIP Code *</FormLabel>
              <FormControl>
                <Input placeholder="10001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="personalInfo.dateOfBirth"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Date of Birth *</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="border-t pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Emergency Contact</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="personalInfo.emergencyContactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emergency Contact Name *</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="personalInfo.emergencyContactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emergency Contact Phone *</FormLabel>
                <FormControl>
                  <Input placeholder="(555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="personalInfo.emergencyContactRelation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Relationship *</FormLabel>
              <FormControl>
                <Input placeholder="Spouse, Parent, Sibling, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  const renderEmploymentInfoStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Employment Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="employmentInfo.preferredName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Name</FormLabel>
              <FormControl>
                <Input placeholder="How you'd like to be called" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="employmentInfo.tShirtSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>T-Shirt Size *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="XS">XS</SelectItem>
                  <SelectItem value="S">S</SelectItem>
                  <SelectItem value="M">M</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="XL">XL</SelectItem>
                  <SelectItem value="XXL">XXL</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="employmentInfo.department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department *</FormLabel>
              <FormControl>
                <Input placeholder="Engineering, HR, Sales, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="employmentInfo.position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Position *</FormLabel>
              <FormControl>
                <Input placeholder="Software Engineer, HR Manager, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="employmentInfo.startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="employmentInfo.workLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Work Location *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select work location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Office">Office</SelectItem>
                  <SelectItem value="Remote">Remote</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="employmentInfo.managerId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Manager/Supervisor</FormLabel>
            <FormControl>
              <Input placeholder="Your direct manager's name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderPersonalInfoStep();
      case 1:
        return renderEmploymentInfoStep();
      // Add other steps here...
      default:
        return <div>Step content not implemented yet</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Meeting Matters!
          </h1>
          <p className="text-lg text-gray-600">
            Complete your onboarding process to get started
          </p>
        </div>

        {/* Progress Indicator */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Overall Progress</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {steps.map((step, index) => (
                <Badge
                  key={index}
                  variant={currentStep === index ? "default" : isStepComplete(index) ? "secondary" : "outline"}
                  className="flex items-center space-x-1"
                >
                  <step.icon size={14} />
                  <span>{step.title}</span>
                  {isStepComplete(index) && <CheckCircle size={14} />}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Form */}
        <Card>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {renderStepContent()}
                
                <div className="flex justify-between pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                  >
                    Previous
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={saveProgressMutation.isPending || submitOnboardingMutation.isPending}
                    className="btn-primary"
                  >
                    {currentStep === steps.length - 1 ? 'Submit Onboarding' : 'Next Step'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Onboarding Checklist Preview */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Your Onboarding Journey</CardTitle>
            <p className="text-gray-600">Here's what to expect during your first 90 days</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {defaultOnboardingChecklist.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Clock className="mr-2" size={16} />
                    {category.category}
                  </h4>
                  <div className="grid gap-2 ml-6">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start space-x-3 p-2 bg-gray-50 rounded">
                        <CheckCircle className="text-gray-400 mt-0.5" size={16} />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-xs text-gray-600">{item.description}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Day {Math.abs(item.dueDate)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}