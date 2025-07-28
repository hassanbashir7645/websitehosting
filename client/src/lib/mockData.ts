// Mock data for psychometric testing platform
export const DEMO_MODE = true;

export const mockUsers = [
  {
    id: "demo_admin",
    email: "admin@psychotestpro.com",
    firstName: "Sarah",
    lastName: "Wilson",
    profileImageUrl: null,
    role: "hr_admin",
    status: "active",
    department: "Human Resources",
    position: "HR Administrator",
    managerId: null,
    startDate: "2024-01-01",
    createdAt: "2024-01-01T09:00:00.000Z",
    updatedAt: "2025-01-01T09:00:00.000Z"
  }
];

export const mockEmployees = [
  {
    id: 1,
    userId: "demo_admin",
    employeeId: "ADM001",
    phoneNumber: "555-123-4567",
    address: "123 Admin St, Business District, City 12345",
    emergencyContact: {
      name: "John Wilson",
      phone: "555-987-6543",
      relationship: "spouse"
    },
    onboardingStatus: "completed",
    onboardingProgress: 100,
    createdAt: "2024-01-01T09:00:00.000Z",
    updatedAt: "2025-01-01T09:00:00.000Z",
    user: mockUsers[0]
  },
  {
    id: 2,
    userId: "demo_recruiter_1",
    employeeId: "REC001",
    phoneNumber: "555-234-5678",
    address: "456 Oak Ave, Business Area, City 12345",
    emergencyContact: {
      name: "Jane Smith",
      phone: "555-876-5432",
      relationship: "sister"
    },
    onboardingStatus: "in_progress",
    onboardingProgress: 75,
    createdAt: "2024-01-15T09:00:00.000Z",
    updatedAt: "2025-01-10T09:00:00.000Z",
    user: {
      id: "demo_recruiter_1",
      email: "john.smith@psychotestpro.com",
      firstName: "John",
      lastName: "Smith",
      profileImageUrl: null,
      role: "recruiter",
      status: "active",
      department: "Human Resources",
      position: "Senior Recruiter",
      managerId: "demo_admin",
      startDate: "2024-01-15",
      createdAt: "2024-01-15T09:00:00.000Z",
      updatedAt: "2025-01-01T09:00:00.000Z"
    }
  },
  {
    id: 3,
    userId: "demo_hiring_manager_1",
    employeeId: "HM001",
    phoneNumber: "555-345-6789",
    address: "789 Pine Rd, Business Quarter, City 12345",
    emergencyContact: {
      name: "Mike Johnson",
      phone: "555-765-4321",
      relationship: "brother"
    },
    onboardingStatus: "pending",
    onboardingProgress: 25,
    createdAt: "2024-02-01T09:00:00.000Z",
    updatedAt: "2025-01-15T09:00:00.000Z",
    user: {
      id: "demo_hiring_manager_1",
      email: "sarah.johnson@psychotestpro.com",
      firstName: "Sarah",
      lastName: "Johnson",
      profileImageUrl: null,
      role: "hiring_manager",
      status: "active",
      department: "Operations",
      position: "Hiring Manager",
      managerId: "demo_admin",
      startDate: "2024-02-01",
      createdAt: "2024-02-01T09:00:00.000Z",
      updatedAt: "2025-01-01T09:00:00.000Z"
    }
  }
];

// Authentication mock
export const mockAuthUser = mockUsers[0];

export const mockPsychometricTests = [
  {
    id: 1,
    testName: "Big Five Personality Assessment",
    testType: "personality",
    description: "Comprehensive personality assessment based on the scientifically validated Five-Factor Model",
    instructions: "Please answer each question honestly based on how you typically think, feel, and behave. There are no right or wrong answers. This assessment takes approximately 25 minutes.",
    timeLimit: 25,
    totalQuestions: 20,
    isActive: true,
    createdBy: 1,
    createdAt: "2024-12-01T09:00:00.000Z"
  },
  {
    id: 2,
    testName: "Cognitive Aptitude Assessment", 
    testType: "cognitive",
    description: "Comprehensive evaluation of problem-solving abilities, logical reasoning, and analytical thinking skills",
    instructions: "Read each question carefully and select the best answer. You have 20 minutes to complete 15 questions. Work efficiently but accurately.",
    timeLimit: 20,
    totalQuestions: 15,
    isActive: true,
    createdBy: 1,
    createdAt: "2024-12-01T09:00:00.000Z"
  },
  {
    id: 3,
    testName: "Emotional Intelligence Assessment",
    testType: "emotional_intelligence", 
    description: "Comprehensive assessment of emotional intelligence across four key domains: self-awareness, self-management, social awareness, and relationship management",
    instructions: "Consider each scenario and choose the response that best reflects how you would typically react. This assessment takes approximately 30 minutes.",
    timeLimit: 30,
    totalQuestions: 25,
    isActive: true,
    createdBy: 1,
    createdAt: "2024-12-01T09:00:00.000Z"
  },
  {
    id: 4,
    testName: "Integrity and Honesty Assessment",
    testType: "integrity",
    description: "Scenario-based assessment evaluating ethical decision-making, honesty, and workplace integrity",
    instructions: "Read each scenario carefully and select the response that best represents what you would actually do in that situation. Be honest in your responses.",
    timeLimit: 25,
    totalQuestions: 20,
    isActive: true,
    createdBy: 1,
    createdAt: "2024-12-01T09:00:00.000Z"
  }
];

export const mockPsychometricQuestions = [
  // Big Five Personality Questions
  {
    id: 1,
    testId: 1,
    questionText: "I am the life of the party",
    questionType: "scale",
    options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
    category: "extraversion",
    orderIndex: 1
  },
  {
    id: 2,
    testId: 1,
    questionText: "I feel comfortable around people",
    questionType: "scale", 
    options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
    category: "extraversion",
    orderIndex: 2
  },
  {
    id: 3,
    testId: 1,
    questionText: "I start conversations",
    questionType: "scale",
    options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"], 
    category: "extraversion",
    orderIndex: 3
  },
  {
    id: 4,
    testId: 1,
    questionText: "I have a vivid imagination",
    questionType: "scale",
    options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
    category: "openness",
    orderIndex: 4
  },
  {
    id: 5,
    testId: 1,
    questionText: "I have excellent ideas",
    questionType: "scale",
    options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
    category: "openness", 
    orderIndex: 5
  },

  // Cognitive Aptitude Questions
  {
    id: 6,
    testId: 2,
    questionText: "If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?",
    questionType: "multiple_choice",
    options: ["5 minutes", "10 minutes", "100 minutes", "500 minutes"],
    category: "logical_reasoning",
    orderIndex: 1,
    correctAnswer: 0
  },
  {
    id: 7,
    testId: 2,
    questionText: "What comes next in this sequence: 2, 6, 12, 20, 30, ?",
    questionType: "multiple_choice", 
    options: ["40", "42", "44", "48"],
    category: "pattern_recognition",
    orderIndex: 2,
    correctAnswer: 1
  },
  {
    id: 8,
    testId: 2,
    questionText: "A ball and a bat cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?",
    questionType: "multiple_choice",
    options: ["$0.05", "$0.10", "$0.15", "$0.20"],
    category: "logical_reasoning", 
    orderIndex: 3,
    correctAnswer: 0
  },

  // Emotional Intelligence Questions
  {
    id: 9,
    testId: 3,
    questionText: "When I'm feeling stressed, I usually:",
    questionType: "multiple_choice",
    options: [
      "Take a few deep breaths and try to calm down",
      "Talk to someone about what's bothering me", 
      "Keep busy to distract myself",
      "Get frustrated and let others know"
    ],
    category: "self_management",
    orderIndex: 1
  },
  {
    id: 10,
    testId: 3,
    questionText: "I can easily tell when someone is feeling upset, even if they don't say anything",
    questionType: "scale",
    options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
    category: "social_awareness",
    orderIndex: 2
  }
];

export const mockTestAttempts = [
  {
    id: 1,
    testId: 1,
    candidateName: "Alex Johnson",
    candidateEmail: "alex.johnson@example.com",
    status: "completed",
    startedAt: "2025-01-10T09:00:00.000Z",
    completedAt: "2025-01-10T09:23:00.000Z",
    percentageScore: 85,
    responses: {}
  },
  {
    id: 2,
    testId: 2,
    candidateName: "Maria Garcia",
    candidateEmail: "maria.garcia@example.com", 
    status: "completed",
    startedAt: "2025-01-12T14:30:00.000Z",
    completedAt: "2025-01-12T14:48:00.000Z",
    percentageScore: 92,
    responses: {}
  },
  {
    id: 3,
    testId: 3,
    candidateName: "David Chen",
    candidateEmail: "david.chen@example.com",
    status: "completed",
    startedAt: "2025-01-14T11:15:00.000Z", 
    completedAt: "2025-01-14T11:42:00.000Z",
    percentageScore: 78,
    responses: {}
  },
  {
    id: 1,
    testId: 1,
    candidateName: "Alex Johnson",
    candidateEmail: "alex.johnson@example.com",
    status: "completed",
    startedAt: "2025-01-10T09:00:00.000Z",
    completedAt: "2025-01-10T09:23:00.000Z",
    percentageScore: 85,
    responses: {}
  },
  {
    id: 2,
    testId: 2,
    candidateName: "Maria Garcia",
    candidateEmail: "maria.garcia@example.com", 
    status: "in_progress",
    startedAt: "2025-01-15T14:30:00.000Z",
    completedAt: null,
    percentageScore: null,
    responses: {}
  },
  {
    id: 3,
    testId: 4,
    candidateName: "David Chen",
    candidateEmail: "david.chen@example.com",
    status: "completed",
    startedAt: "2025-01-12T11:15:00.000Z", 
    completedAt: "2025-01-12T11:38:00.000Z",
    percentageScore: 88,
    responses: {}
  }
];