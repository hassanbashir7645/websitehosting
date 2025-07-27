import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  pgEnum,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const userRoleEnum = pgEnum("user_role", [
  "hr_admin",
  "branch_manager", 
  "team_lead",
  "employee",
  "logistics_manager"
]);

// User status enum
export const userStatusEnum = pgEnum("user_status", [
  "active",
  "inactive",
  "onboarding",
  "terminated"
]);

// Department enum for structured department management
export const departmentEnum = pgEnum("department_type", [
  "human_resources",
  "information_technology", 
  "finance_accounting",
  "sales_marketing",
  "operations",
  "customer_service",
  "research_development",
  "legal_compliance",
  "executive_management",
  "facilities_maintenance"
]);

// Task status enum
export const taskStatusEnum = pgEnum("task_status", [
  "pending",
  "in_progress",
  "completed",
  "overdue"
]);

// Task priority enum
export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
  "urgent"
]);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default("employee").notNull(),
  status: userStatusEnum("status").default("active").notNull(),
  department: varchar("department"),
  position: varchar("position"),
  managerId: varchar("manager_id"),
  startDate: timestamp("start_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Departments table for department management
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  code: varchar("code").unique().notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  managerId: varchar("manager_id").references(() => users.id),
  budgetAllocated: decimal("budget_allocated"),
  headcount: integer("headcount").default(0),
  location: varchar("location"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Employees table for additional employee data
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  employeeId: varchar("employee_id").unique().notNull(),
  phoneNumber: varchar("phone_number"),
  address: text("address"),
  emergencyContact: jsonb("emergency_contact"),
  onboardingStatus: varchar("onboarding_status").default("not_started"),
  onboardingProgress: integer("onboarding_progress").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  assignedBy: varchar("assigned_by").references(() => users.id),
  status: taskStatusEnum("status").default("pending").notNull(),
  priority: taskPriorityEnum("priority").default("medium").notNull(),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Task updates table for daily progress tracking
export const taskUpdates = pgTable("task_updates", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  updateText: text("update_text").notNull(),
  progressPercentage: integer("progress_percentage").default(0),
  hoursWorked: decimal("hours_worked").default("0"),
  challenges: text("challenges"),
  nextSteps: text("next_steps"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Announcements table
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  authorId: varchar("author_id").references(() => users.id),
  isPublished: boolean("is_published").default(false),
  targetRoles: jsonb("target_roles"), // Array of roles this announcement is for
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Recognition table
export const recognition = pgTable("recognition", {
  id: serial("id").primaryKey(),
  nomineeId: varchar("nominee_id").references(() => users.id),
  nominatedBy: varchar("nominated_by").references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  type: varchar("type").notNull(), // "employee_of_month", "achievement", "milestone"
  isApproved: boolean("is_approved").default(false),
  approvedBy: varchar("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Logistics items table
export const logisticsItems = pgTable("logistics_items", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  quantity: integer("quantity").default(0),
  minQuantity: integer("min_quantity").default(0),
  location: varchar("location"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Logistics requests table
export const logisticsRequests = pgTable("logistics_requests", {
  id: serial("id").primaryKey(),
  requesterId: varchar("requester_id").references(() => users.id),
  itemId: integer("item_id").references(() => logisticsItems.id),
  itemName: varchar("item_name"), // For requests without existing items
  description: text("description"), // Item description for new items
  quantity: integer("quantity").notNull(),
  reason: text("reason"),
  status: varchar("status").default("pending"), // pending, approved, rejected, purchased, completed
  priority: varchar("priority").default("medium"), // low, medium, high, urgent
  estimatedCost: decimal("estimated_cost"),
  actualCost: decimal("actual_cost"),
  vendor: varchar("vendor"),
  purchaseDate: timestamp("purchase_date"),
  receiptUrl: varchar("receipt_url"),
  receiptFilename: varchar("receipt_filename"),
  notes: text("notes"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Onboarding checklists table
export const onboardingChecklists = pgTable("onboarding_checklists", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id),
  itemTitle: varchar("item_title").notNull(),
  description: text("description"),
  isCompleted: boolean("is_completed").default(false),
  completedBy: varchar("completed_by").references(() => users.id),
  dueDate: timestamp("due_date"),
  order: integer("order").default(0),
  requiresDocument: boolean("requires_document").default(false),
  documentType: varchar("document_type"), // 'image', 'pdf', 'any'
  documentUrl: varchar("document_url"),
  documentName: varchar("document_name"),
  isDocumentVerified: boolean("is_document_verified").default(false),
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  verificationNotes: text("verification_notes"),
  // Psychometric test integration
  requiresPsychometricTest: boolean("requires_psychometric_test").default(false),
  psychometricTestId: integer("psychometric_test_id").references(() => psychometricTests.id),
  psychometricTestAttemptId: integer("psychometric_test_attempt_id").references(() => psychometricTestAttempts.id),
  psychometricTestCompleted: boolean("psychometric_test_completed").default(false),
  psychometricTestScore: integer("psychometric_test_score"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Task requests table (for time extensions, documents, help)
export const taskRequests = pgTable("task_requests", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id),
  requesterId: varchar("requester_id").references(() => users.id).notNull(),
  requestType: varchar("request_type").notNull(), // 'time_extension', 'document_request', 'help_request', 'clarification'
  requestTitle: varchar("request_title").notNull(),
  requestDescription: text("request_description").notNull(),
  requestedExtension: integer("requested_extension"), // in days
  urgencyLevel: varchar("urgency_level").default('medium'), // 'low', 'medium', 'high', 'urgent'
  status: varchar("status").default('pending'), // 'pending', 'approved', 'rejected', 'in_review'
  responseMessage: text("response_message"),
  respondedBy: varchar("responded_by").references(() => users.id),
  respondedAt: timestamp("responded_at"),
  attachmentUrl: varchar("attachment_url"),
  attachmentName: varchar("attachment_name"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document uploads table
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  filename: varchar("filename").notNull(),
  originalName: varchar("original_name").notNull(),
  mimeType: varchar("mime_type").notNull(),
  size: integer("size").notNull(),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  relatedTo: varchar("related_to"), // employee_id, task_id, etc.
  relatedType: varchar("related_type"), // "employee", "task", "logistics"
  isApproved: boolean("is_approved").default(false),
  approvedBy: varchar("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  employees: many(employees),
  assignedTasks: many(tasks, { relationName: "assignedTasks" }),
  createdTasks: many(tasks, { relationName: "createdTasks" }),
  announcements: many(announcements),
  recognitionGiven: many(recognition, { relationName: "recognitionGiven" }),
  recognitionReceived: many(recognition, { relationName: "recognitionReceived" }),
  logisticsRequests: many(logisticsRequests),
  documents: many(documents),
  manager: one(users, { 
    fields: [users.managerId],
    references: [users.id],
    relationName: "managerSubordinate"
  }),
  subordinates: many(users, { relationName: "managerSubordinate" }),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  user: one(users, {
    fields: [employees.userId],
    references: [users.id],
  }),
  onboardingChecklists: many(onboardingChecklists),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  assignedToUser: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
    relationName: "assignedTasks"
  }),
  assignedByUser: one(users, {
    fields: [tasks.assignedBy],
    references: [users.id],
    relationName: "createdTasks"
  }),
  taskRequests: many(taskRequests),
  taskUpdates: many(taskUpdates),
}));

export const taskRequestsRelations = relations(taskRequests, ({ one }) => ({
  task: one(tasks, {
    fields: [taskRequests.taskId],
    references: [tasks.id],
  }),
  requester: one(users, {
    fields: [taskRequests.requesterId],
    references: [users.id],
    relationName: "taskRequestRequester"
  }),
  responder: one(users, {
    fields: [taskRequests.respondedBy],
    references: [users.id],
    relationName: "taskRequestResponder"
  }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  author: one(users, {
    fields: [announcements.authorId],
    references: [users.id],
  }),
}));

export const recognitionRelations = relations(recognition, ({ one }) => ({
  nominee: one(users, {
    fields: [recognition.nomineeId],
    references: [users.id],
    relationName: "recognitionReceived"
  }),
  nominator: one(users, {
    fields: [recognition.nominatedBy],
    references: [users.id],
    relationName: "recognitionGiven"
  }),
  approver: one(users, {
    fields: [recognition.approvedBy],
    references: [users.id],
  }),
}));

export const logisticsRequestsRelations = relations(logisticsRequests, ({ one }) => ({
  requester: one(users, {
    fields: [logisticsRequests.requesterId],
    references: [users.id],
  }),
  item: one(logisticsItems, {
    fields: [logisticsRequests.itemId],
    references: [logisticsItems.id],
  }),
  approver: one(users, {
    fields: [logisticsRequests.approvedBy],
    references: [users.id],
  }),
}));

export const onboardingChecklistsRelations = relations(onboardingChecklists, ({ one }) => ({
  employee: one(employees, {
    fields: [onboardingChecklists.employeeId],
    references: [employees.id],
  }),
  completedByUser: one(users, {
    fields: [onboardingChecklists.completedBy],
    references: [users.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  uploader: one(users, {
    fields: [documents.uploadedBy],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [documents.approvedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertEmployeeSchema = createInsertSchema(employees);
export const insertTaskSchema = createInsertSchema(tasks).extend({
  dueDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
});
export const insertTaskUpdateSchema = createInsertSchema(taskUpdates);
export const insertAnnouncementSchema = createInsertSchema(announcements);
export const insertRecognitionSchema = createInsertSchema(recognition);
export const insertLogisticsItemSchema = createInsertSchema(logisticsItems);
export const insertLogisticsRequestSchema = createInsertSchema(logisticsRequests);
export const insertOnboardingChecklistSchema = createInsertSchema(onboardingChecklists);
export const insertDocumentSchema = createInsertSchema(documents);
export const insertTaskRequestSchema = createInsertSchema(taskRequests);
export const insertDepartmentSchema = createInsertSchema(departments);

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type TaskRequest = typeof taskRequests.$inferSelect;
export type InsertTaskRequest = typeof taskRequests.$inferInsert;

// Psychometric test schemas
export const psychometricTests = pgTable("psychometric_tests", {
  id: serial("id").primaryKey(),
  testName: varchar("test_name", { length: 100 }).notNull(),
  testType: varchar("test_type", { length: 50 }).notNull(), // personality, cognitive, aptitude, emotional_intelligence
  description: text("description"),
  instructions: text("instructions"),
  timeLimit: integer("time_limit"), // in minutes
  totalQuestions: integer("total_questions").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const psychometricQuestions = pgTable("psychometric_questions", {
  id: serial("id").primaryKey(),
  testId: integer("test_id").references(() => psychometricTests.id).notNull(),
  questionText: text("question_text").notNull(),
  questionType: varchar("question_type", { length: 50 }).notNull(), // multiple_choice, scale, yes_no
  options: jsonb("options"), // For multiple choice questions
  correctAnswer: varchar("correct_answer", { length: 255 }), // For cognitive tests
  category: varchar("category", { length: 100 }), // personality trait, cognitive domain
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const psychometricTestAttempts = pgTable("psychometric_test_attempts", {
  id: serial("id").primaryKey(),
  candidateEmail: varchar("candidate_email", { length: 255 }).notNull(),
  candidateName: varchar("candidate_name", { length: 255 }).notNull(),
  testId: integer("test_id").references(() => psychometricTests.id).notNull(),
  responses: jsonb("responses").notNull(), // Array of question responses
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  timeSpent: integer("time_spent"), // in seconds
  totalScore: integer("total_score"),
  percentageScore: integer("percentage_score"),
  results: jsonb("results"), // Detailed scoring breakdown
  status: varchar("status", { length: 50 }).default("in_progress"), // in_progress, completed, abandoned
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
});

export const psychometricTestRelations = relations(psychometricTests, ({ many }) => ({
  questions: many(psychometricQuestions),
  attempts: many(psychometricTestAttempts),
}));

export const psychometricQuestionRelations = relations(psychometricQuestions, ({ one }) => ({
  test: one(psychometricTests, {
    fields: [psychometricQuestions.testId],
    references: [psychometricTests.id],
  }),
}));

export const psychometricTestAttemptRelations = relations(psychometricTestAttempts, ({ one }) => ({
  test: one(psychometricTests, {
    fields: [psychometricTestAttempts.testId],
    references: [psychometricTests.id],
  }),
}));

export type PsychometricTest = typeof psychometricTests.$inferSelect;
export type InsertPsychometricTest = typeof psychometricTests.$inferInsert;
export type PsychometricQuestion = typeof psychometricQuestions.$inferSelect;
export type InsertPsychometricQuestion = typeof psychometricQuestions.$inferInsert;
export type PsychometricTestAttempt = typeof psychometricTestAttempts.$inferSelect;
export type InsertPsychometricTestAttempt = typeof psychometricTestAttempts.$inferInsert;
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;
export type Recognition = typeof recognition.$inferSelect;
export type InsertRecognition = typeof recognition.$inferInsert;
export type LogisticsItem = typeof logisticsItems.$inferSelect;
export type InsertLogisticsItem = typeof logisticsItems.$inferInsert;
export type LogisticsRequest = typeof logisticsRequests.$inferSelect;
export type InsertLogisticsRequest = typeof logisticsRequests.$inferInsert;
export type OnboardingChecklist = typeof onboardingChecklists.$inferSelect;
export type InsertOnboardingChecklist = typeof onboardingChecklists.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;
export type TaskUpdate = typeof taskUpdates.$inferSelect;
export type InsertTaskUpdate = typeof taskUpdates.$inferInsert;
export type Department = typeof departments.$inferSelect;
export type InsertDepartment = typeof departments.$inferInsert;

// Employee submissions table for two-phase onboarding
export const employeeSubmissions = pgTable("employee_submissions", {
  id: serial("id").primaryKey(),
  // Personal Information
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  maritalStatus: text("marital_status"),
  nationality: text("nationality"),
  
  // Contact Information
  email: text("email").notNull(),
  phoneNumber: text("phone_number").notNull(),
  alternatePhone: text("alternate_phone"),
  
  // Address Information
  currentAddress: text("current_address").notNull(),
  permanentAddress: text("permanent_address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country"),
  
  // Employment Information
  position: text("position").notNull(),
  department: text("department").notNull(),
  startDate: text("start_date").notNull(),
  employmentType: text("employment_type"),
  workLocation: text("work_location"),
  reportingManager: text("reporting_manager"),
  
  // Educational Background
  highestEducation: text("highest_education"),
  university: text("university"),
  graduationYear: text("graduation_year"),
  majorSubject: text("major_subject"),
  
  // Emergency Contact
  emergencyContactName: text("emergency_contact_name").notNull(),
  emergencyContactRelation: text("emergency_contact_relation"),
  emergencyContactPhone: text("emergency_contact_phone").notNull(),
  emergencyContactAddress: text("emergency_contact_address"),
  
  // Additional Information
  skills: text("skills"),
  previousExperience: text("previous_experience"),
  languagesSpoken: text("languages_spoken"),
  hobbies: text("hobbies"),
  
  // Acknowledgments
  privacyPolicyAgreed: boolean("privacy_policy_agreed").default(false),
  termsAndConditionsAgreed: boolean("terms_conditions_agreed").default(false),
  backgroundCheckConsent: boolean("background_check_consent").default(false),
  
  // Status and tracking
  status: text("status").default("pending"), // pending, in_progress, completed
  submittedAt: timestamp("submitted_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  assignedHR: text("assigned_hr"),
  
  // HR Steps tracking
  hrStepsCompleted: jsonb("hr_steps_completed").default([]), // Array of completed step IDs
  hrStepsNotes: jsonb("hr_steps_notes").default({}), // Object with step ID as key and notes as value
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEmployeeSubmissionSchema = createInsertSchema(employeeSubmissions);
export type InsertEmployeeSubmission = z.infer<typeof insertEmployeeSubmissionSchema>;
export type EmployeeSubmission = typeof employeeSubmissions.$inferSelect;
