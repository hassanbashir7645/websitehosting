import { z } from 'zod';

// Employee Details Schema for Step 1
export const employeeDetailsSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  maritalStatus: z.string().optional(),
  nationality: z.string().optional(),
  
  // Contact Information
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  alternatePhone: z.string().optional(),
  
  // Address Information
  currentAddress: z.string().min(1, "Current address is required"),
  permanentAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  
  // Employment Information
  position: z.string().min(1, "Position is required"),
  department: z.string().min(1, "Department is required"),
  startDate: z.string().min(1, "Start date is required"),
  employmentType: z.string().optional(),
  workLocation: z.string().optional(),
  reportingManager: z.string().optional(),
  
  // Educational Background
  highestEducation: z.string().optional(),
  university: z.string().optional(),
  graduationYear: z.string().optional(),
  majorSubject: z.string().optional(),
  
  // Emergency Contact
  emergencyContactName: z.string().min(1, "Emergency contact name is required"),
  emergencyContactRelation: z.string().optional(),
  emergencyContactPhone: z.string().min(1, "Emergency contact phone is required"),
  emergencyContactAddress: z.string().optional(),
  
  // Additional Information
  skills: z.string().optional(),
  previousExperience: z.string().optional(),
  languagesSpoken: z.string().optional(),
  hobbies: z.string().optional(),
  
  // Acknowledgments
  privacyPolicyAgreed: z.boolean().refine(val => val === true, "Privacy policy agreement is required"),
  termsAndConditionsAgreed: z.boolean().refine(val => val === true, "Terms and conditions agreement is required"),
  backgroundCheckConsent: z.boolean().refine(val => val === true, "Background check consent is required")
});

export type EmployeeDetails = z.infer<typeof employeeDetailsSchema>;

// HR Onboarding Step Schema for Step 2
export const hrOnboardingStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.enum(['pre_arrival', 'documentation', 'it_setup', 'access_permissions', 'orientation']),
  estimatedTime: z.number(),
  isCompleted: z.boolean(),
  completedBy: z.string().optional(),
  completedAt: z.string().optional(),
  notes: z.string().optional(),
  requiresDocument: z.boolean().optional(),
  documentUploaded: z.boolean().optional()
});

export type HROnboardingStep = z.infer<typeof hrOnboardingStepSchema>;

// Employee Submission Schema (combines both steps)
export const employeeSubmissionSchema = z.object({
  id: z.number(),
  employeeDetails: employeeDetailsSchema,
  hrSteps: z.array(hrOnboardingStepSchema).optional(),
  status: z.enum(['pending', 'in_progress', 'completed']),
  submittedAt: z.string(),
  completedAt: z.string().optional(),
  assignedHR: z.string().optional()
});

export type EmployeeSubmission = z.infer<typeof employeeSubmissionSchema>;