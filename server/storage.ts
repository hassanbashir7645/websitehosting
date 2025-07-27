import {
  users,
  employees,
  tasks,
  taskUpdates,
  taskRequests,
  announcements,
  recognition,
  logisticsItems,
  logisticsRequests,
  onboardingChecklists,
  documents,
  psychometricTests,
  psychometricQuestions,
  psychometricTestAttempts,
  type User,
  type UpsertUser,
  type Employee,
  type InsertEmployee,
  type Task,
  type InsertTask,
  type TaskRequest,
  type InsertTaskRequest,
  type Announcement,
  type InsertAnnouncement,
  type Recognition,
  type InsertRecognition,
  type LogisticsItem,
  type InsertLogisticsItem,
  type LogisticsRequest,
  type InsertLogisticsRequest,
  type OnboardingChecklist,
  type InsertOnboardingChecklist,
  type Document,
  type InsertDocument,
  type PsychometricTest,
  type InsertPsychometricTest,
  type PsychometricQuestion,
  type InsertPsychometricQuestion,
  type PsychometricTestAttempt,
  type InsertPsychometricTestAttempt,
  type TaskUpdate,
  type InsertTaskUpdate,
  departments,
  type Department,
  type InsertDepartment,
  employeeSubmissions,
  type EmployeeSubmission,
  type InsertEmployeeSubmission,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, like, or, count, sum, isNull, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Employee operations
  getEmployee(userId: string): Promise<Employee | undefined>;
  getEmployees(filters?: { role?: string; status?: string; department?: string }): Promise<(Employee & { user: User })[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee>;
  getEmployeesByDepartment(departmentCode: string): Promise<(Employee & { user: User })[]>;
  
  // Department operations
  getDepartments(): Promise<(Department & { manager?: User })[]>;
  getDepartment(id: number): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: number, department: Partial<InsertDepartment>): Promise<Department>;
  deleteDepartment(id: number): Promise<void>;
  
  // Employee submissions operations (two-phase onboarding)
  getEmployeeSubmissions(): Promise<EmployeeSubmission[]>;
  getEmployeeSubmission(id: number): Promise<EmployeeSubmission | undefined>;
  createEmployeeSubmission(submission: InsertEmployeeSubmission): Promise<EmployeeSubmission>;
  updateEmployeeSubmission(id: number, submission: Partial<InsertEmployeeSubmission>): Promise<EmployeeSubmission>;
  updateHRStep(submissionId: number, stepId: string, isCompleted: boolean, notes?: string): Promise<EmployeeSubmission>;
  
  // Task operations
  getTasks(filters?: { assignedTo?: string; status?: string; priority?: string }): Promise<(Task & { assignedToUser?: User; assignedByUser?: User })[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: number): Promise<void>;
  
  // Task request operations
  getTaskRequests(filters?: { taskId?: number; requesterId?: string; status?: string }): Promise<any[]>;
  getTaskRequest(id: number): Promise<TaskRequest | undefined>;
  createTaskRequest(request: InsertTaskRequest): Promise<TaskRequest>;
  updateTaskRequest(id: number, request: Partial<InsertTaskRequest>): Promise<TaskRequest>;
  deleteTaskRequest(id: number): Promise<void>;
  
  // Announcement operations
  getAnnouncements(userId?: string): Promise<(Announcement & { author: User })[]>;
  getAnnouncement(id: number): Promise<Announcement | undefined>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: number, announcement: Partial<InsertAnnouncement>): Promise<Announcement>;
  deleteAnnouncement(id: number): Promise<void>;
  
  // Recognition operations
  getRecognitions(filters?: { nomineeId?: string; type?: string }): Promise<(Recognition & { nominee: User; nominator: User })[]>;
  createRecognition(recognition: InsertRecognition): Promise<Recognition>;
  updateRecognition(id: number, recognition: Partial<InsertRecognition>): Promise<Recognition>;
  
  // Logistics operations
  getLogisticsItems(): Promise<LogisticsItem[]>;
  getLogisticsItem(id: number): Promise<LogisticsItem | undefined>;
  createLogisticsItem(item: InsertLogisticsItem): Promise<LogisticsItem>;
  updateLogisticsItem(id: number, item: Partial<InsertLogisticsItem>): Promise<LogisticsItem>;
  deleteLogisticsItem(id: number): Promise<void>;
  
  getLogisticsRequests(filters?: { requesterId?: string; status?: string }): Promise<(LogisticsRequest & { requester: User; item: LogisticsItem })[]>;
  createLogisticsRequest(request: InsertLogisticsRequest): Promise<LogisticsRequest>;
  updateLogisticsRequest(id: number, request: Partial<InsertLogisticsRequest>): Promise<LogisticsRequest>;
  
  // Onboarding operations
  getOnboardingChecklists(employeeId: number): Promise<OnboardingChecklist[]>;
  getAllOnboardingChecklists(): Promise<OnboardingChecklist[]>;
  createOnboardingChecklist(checklist: InsertOnboardingChecklist): Promise<OnboardingChecklist>;
  updateOnboardingChecklist(id: number, checklist: Partial<InsertOnboardingChecklist>): Promise<OnboardingChecklist>;
  deleteOnboardingChecklist(id: number): Promise<void>;
  
  // Document operations
  getDocuments(filters?: { uploadedBy?: string; relatedTo?: string; relatedType?: string }): Promise<(Document & { uploader: User })[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document>;
  deleteDocument(id: number): Promise<void>;
  
  // Dashboard operations
  getDashboardStats(userId: string): Promise<{
    totalEmployees: number;
    activeOnboarding: number;
    openTasks: number;
    pendingApprovals: number;
    complianceRate: number;
  }>;
  
  getRecentActivities(userId: string, limit?: number): Promise<any[]>;
  getPendingApprovals(userId: string): Promise<any[]>;
  
  // Psychometric test operations
  getPsychometricTests(): Promise<PsychometricTest[]>;
  getPsychometricTest(id: number): Promise<PsychometricTest | undefined>;
  createPsychometricTest(test: InsertPsychometricTest): Promise<PsychometricTest>;
  updatePsychometricTest(id: number, test: Partial<InsertPsychometricTest>): Promise<PsychometricTest>;
  deletePsychometricTest(id: number): Promise<void>;
  
  getPsychometricQuestions(testId: number): Promise<PsychometricQuestion[]>;
  createPsychometricQuestion(question: InsertPsychometricQuestion): Promise<PsychometricQuestion>;
  updatePsychometricQuestion(id: number, question: Partial<InsertPsychometricQuestion>): Promise<PsychometricQuestion>;
  deletePsychometricQuestion(id: number): Promise<void>;
  
  getPsychometricTestAttempts(filters?: { testId?: number; candidateEmail?: string }): Promise<PsychometricTestAttempt[]>;
  getPsychometricTestAttempt(id: number): Promise<PsychometricTestAttempt | undefined>;
  createPsychometricTestAttempt(attempt: InsertPsychometricTestAttempt): Promise<PsychometricTestAttempt>;
  updatePsychometricTestAttempt(id: number, attempt: Partial<InsertPsychometricTestAttempt>): Promise<PsychometricTestAttempt>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Employee operations
  async getEmployee(userId: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.userId, userId));
    return employee;
  }

  async getEmployees(filters?: { role?: string; status?: string; department?: string }): Promise<(Employee & { user: User })[]> {
    const conditions = [];

    if (filters?.role) {
      conditions.push(eq(users.role, filters.role as any));
    }
    if (filters?.status) {
      conditions.push(eq(users.status, filters.status as any));
    }
    if (filters?.department) {
      conditions.push(eq(users.department, filters.department));
    }

    const query = db
      .select()
      .from(employees)
      .innerJoin(users, eq(employees.userId, users.id))
      .orderBy(desc(employees.createdAt));

    const result = conditions.length > 0 
      ? await query.where(and(...conditions))
      : await query;

    return result.map(row => ({ ...row.employees, user: row.users }));
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    // Auto-generate employee ID if not provided
    let employeeData = { ...employee };
    if (!employeeData.employeeId) {
      const count = await db.select({ count: sql<number>`count(*)` }).from(employees);
      const nextNumber = (count[0]?.count || 0) + 1;
      employeeData.employeeId = `EMP${nextNumber.toString().padStart(3, '0')}`;
    }
    
    const [newEmployee] = await db.insert(employees).values(employeeData).returning();
    return newEmployee;
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee> {
    const [updatedEmployee] = await db
      .update(employees)
      .set({ ...employee, updatedAt: new Date() })
      .where(eq(employees.id, id))
      .returning();
    return updatedEmployee;
  }

  // Task operations
  async getTasks(filters?: { assignedTo?: string; status?: string; priority?: string }): Promise<(Task & { assignedToUser?: User; assignedByUser?: User })[]> {
    const conditions = [];

    if (filters?.assignedTo) {
      conditions.push(eq(tasks.assignedTo, filters.assignedTo));
    }
    if (filters?.status) {
      conditions.push(eq(tasks.status, filters.status as any));
    }
    if (filters?.priority) {
      conditions.push(eq(tasks.priority, filters.priority as any));
    }

    const query = db
      .select()
      .from(tasks)
      .leftJoin(users, eq(tasks.assignedTo, users.id))
      .orderBy(desc(tasks.createdAt));

    const result = conditions.length > 0 
      ? await query.where(and(...conditions))
      : await query;

    return result.map(row => ({ ...row.tasks, assignedToUser: row.users || undefined }));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task> {
    const [updatedTask] = await db
      .update(tasks)
      .set({ ...task, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async deleteTask(id: number): Promise<void> {
    // Check if there are any active task requests for this task
    const relatedRequests = await db
      .select()
      .from(taskRequests)
      .where(and(eq(taskRequests.taskId, id), eq(taskRequests.isActive, true)));

    if (relatedRequests.length > 0) {
      throw new Error('Cannot delete task with active requests. Please resolve all task requests first.');
    }

    // Soft delete any inactive task requests first
    await db
      .update(taskRequests)
      .set({ isActive: false })
      .where(eq(taskRequests.taskId, id));

    // Now delete the task
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Task request operations
  async getTaskRequests(filters?: { taskId?: number; requesterId?: string; status?: string }): Promise<any[]> {
    const conditions = [eq(taskRequests.isActive, true)];

    if (filters?.taskId) {
      conditions.push(eq(taskRequests.taskId, filters.taskId));
    }
    if (filters?.requesterId) {
      conditions.push(eq(taskRequests.requesterId, filters.requesterId));
    }
    if (filters?.status) {
      conditions.push(eq(taskRequests.status, filters.status));
    }

    // Get all task requests first
    const requestsResult = await db
      .select()
      .from(taskRequests)
      .where(and(...conditions))
      .orderBy(desc(taskRequests.createdAt));

    // Get related data for each request
    const enrichedRequests = [];
    for (const request of requestsResult) {
      // Get requester
      const [requester] = await db
        .select()
        .from(users)
        .where(eq(users.id, request.requesterId));

      // Get task
      const [task] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, request.taskId));

      // Get responder if exists
      let responder = undefined;
      if (request.respondedBy) {
        const [responderResult] = await db
          .select()
          .from(users)
          .where(eq(users.id, request.respondedBy));
        responder = responderResult;
      }

      enrichedRequests.push({
        ...request,
        requester,
        task,
        responder
      });
    }

    return enrichedRequests;
  }

  async getTaskRequest(id: number): Promise<TaskRequest | undefined> {
    const [request] = await db.select().from(taskRequests).where(eq(taskRequests.id, id));
    return request;
  }

  async createTaskRequest(request: InsertTaskRequest): Promise<TaskRequest> {
    const [newRequest] = await db.insert(taskRequests).values(request).returning();
    return newRequest;
  }

  async updateTaskRequest(id: number, request: Partial<InsertTaskRequest>): Promise<TaskRequest> {
    const [updatedRequest] = await db
      .update(taskRequests)
      .set({ ...request, updatedAt: new Date() })
      .where(eq(taskRequests.id, id))
      .returning();
    return updatedRequest;
  }

  async deleteTaskRequest(id: number): Promise<void> {
    await db.update(taskRequests).set({ isActive: false }).where(eq(taskRequests.id, id));
  }

  // Task update operations
  async getTaskUpdates(taskId: number): Promise<(TaskUpdate & { user: User })[]> {
    const result = await db
      .select()
      .from(taskUpdates)
      .innerJoin(users, eq(taskUpdates.userId, users.id))
      .where(eq(taskUpdates.taskId, taskId))
      .orderBy(desc(taskUpdates.createdAt));

    return result.map(row => ({ ...row.task_updates, user: row.users }));
  }

  async createTaskUpdate(update: InsertTaskUpdate): Promise<TaskUpdate> {
    const [newUpdate] = await db.insert(taskUpdates).values(update).returning();
    return newUpdate;
  }

  async updateTaskUpdate(id: number, update: Partial<InsertTaskUpdate>): Promise<TaskUpdate> {
    const [updatedUpdate] = await db
      .update(taskUpdates)
      .set(update)
      .where(eq(taskUpdates.id, id))
      .returning();
    return updatedUpdate;
  }

  // Announcement operations
  async getAnnouncements(userId?: string): Promise<(Announcement & { author: User })[]> {
    const result = await db
      .select()
      .from(announcements)
      .innerJoin(users, eq(announcements.authorId, users.id))
      .orderBy(desc(announcements.createdAt));

    return result.map(row => ({ ...row.announcements, author: row.users }));
  }

  async getAnnouncement(id: number): Promise<Announcement | undefined> {
    const [announcement] = await db.select().from(announcements).where(eq(announcements.id, id));
    return announcement;
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [newAnnouncement] = await db.insert(announcements).values(announcement).returning();
    return newAnnouncement;
  }

  async updateAnnouncement(id: number, announcement: Partial<InsertAnnouncement>): Promise<Announcement> {
    const [updatedAnnouncement] = await db
      .update(announcements)
      .set({ ...announcement, updatedAt: new Date() })
      .where(eq(announcements.id, id))
      .returning();
    return updatedAnnouncement;
  }

  async deleteAnnouncement(id: number): Promise<void> {
    await db.delete(announcements).where(eq(announcements.id, id));
  }

  // Recognition operations
  async getRecognitions(filters?: { nomineeId?: string; type?: string }): Promise<(Recognition & { nominee: User; nominator: User })[]> {
    const conditions = [];

    if (filters?.nomineeId) {
      conditions.push(eq(recognition.nomineeId, filters.nomineeId));
    }
    if (filters?.type) {
      conditions.push(eq(recognition.type, filters.type));
    }

    const query = db
      .select()
      .from(recognition)
      .innerJoin(users, eq(recognition.nomineeId, users.id))
      .orderBy(desc(recognition.createdAt));

    const result = conditions.length > 0 
      ? await query.where(and(...conditions))
      : await query;

    return result.map(row => ({ ...row.recognition, nominee: row.users, nominator: row.users }));
  }

  async createRecognition(recognitionData: InsertRecognition): Promise<Recognition> {
    const [newRecognition] = await db.insert(recognition).values(recognitionData).returning();
    return newRecognition;
  }

  async updateRecognition(id: number, recognitionData: Partial<InsertRecognition>): Promise<Recognition> {
    const [updatedRecognition] = await db
      .update(recognition)
      .set({ ...recognitionData, updatedAt: new Date() })
      .where(eq(recognition.id, id))
      .returning();
    return updatedRecognition;
  }

  // Logistics operations
  async getLogisticsItems(): Promise<LogisticsItem[]> {
    return await db.select().from(logisticsItems).orderBy(desc(logisticsItems.createdAt));
  }

  async getLogisticsItem(id: number): Promise<LogisticsItem | undefined> {
    const [item] = await db.select().from(logisticsItems).where(eq(logisticsItems.id, id));
    return item;
  }

  async createLogisticsItem(item: InsertLogisticsItem): Promise<LogisticsItem> {
    const [newItem] = await db.insert(logisticsItems).values(item).returning();
    return newItem;
  }

  async updateLogisticsItem(id: number, item: Partial<InsertLogisticsItem>): Promise<LogisticsItem> {
    const [updatedItem] = await db
      .update(logisticsItems)
      .set(item)
      .where(eq(logisticsItems.id, id))
      .returning();
    return updatedItem;
  }

  async deleteLogisticsItem(id: number): Promise<void> {
    await db.delete(logisticsItems).where(eq(logisticsItems.id, id));
  }

  async getLogisticsRequests(filters?: { requesterId?: string; status?: string }): Promise<(LogisticsRequest & { requester: User; item: LogisticsItem })[]> {
    const conditions = [];

    if (filters?.requesterId) {
      conditions.push(eq(logisticsRequests.requesterId, filters.requesterId));
    }
    if (filters?.status) {
      conditions.push(eq(logisticsRequests.status, filters.status as any));
    }

    const query = db
      .select()
      .from(logisticsRequests)
      .innerJoin(users, eq(logisticsRequests.requesterId, users.id))
      .innerJoin(logisticsItems, eq(logisticsRequests.itemId, logisticsItems.id))
      .orderBy(desc(logisticsRequests.createdAt));

    const result = conditions.length > 0 
      ? await query.where(and(...conditions))
      : await query;

    return result.map(row => ({ ...row.logistics_requests, requester: row.users, item: row.logistics_items }));
  }

  async createLogisticsRequest(request: InsertLogisticsRequest): Promise<LogisticsRequest> {
    const [newRequest] = await db.insert(logisticsRequests).values(request).returning();
    return newRequest;
  }

  async updateLogisticsRequest(id: number, request: Partial<InsertLogisticsRequest>): Promise<LogisticsRequest> {
    const [updatedRequest] = await db
      .update(logisticsRequests)
      .set({ ...request, updatedAt: new Date() })
      .where(eq(logisticsRequests.id, id))
      .returning();
    return updatedRequest;
  }

  // Onboarding operations
  async getOnboardingChecklists(employeeId: number): Promise<OnboardingChecklist[]> {
    return await db.select().from(onboardingChecklists).where(eq(onboardingChecklists.employeeId, employeeId));
  }

  async getAllOnboardingChecklists(): Promise<OnboardingChecklist[]> {
    return await db.select().from(onboardingChecklists).orderBy(desc(onboardingChecklists.createdAt));
  }

  async createOnboardingChecklist(checklist: InsertOnboardingChecklist): Promise<OnboardingChecklist> {
    const [newChecklist] = await db.insert(onboardingChecklists).values(checklist).returning();
    return newChecklist;
  }

  async updateOnboardingChecklist(id: number, checklist: Partial<InsertOnboardingChecklist>): Promise<OnboardingChecklist> {
    const [updatedChecklist] = await db
      .update(onboardingChecklists)
      .set({ ...checklist, updatedAt: new Date() })
      .where(eq(onboardingChecklists.id, id))
      .returning();
    return updatedChecklist;
  }

  async deleteOnboardingChecklist(id: number): Promise<void> {
    await db.delete(onboardingChecklists).where(eq(onboardingChecklists.id, id));
  }

  // Document operations
  async getDocuments(filters?: { uploadedBy?: string; relatedTo?: string; relatedType?: string }): Promise<(Document & { uploader: User })[]> {
    const conditions = [];

    if (filters?.uploadedBy) {
      conditions.push(eq(documents.uploadedBy, filters.uploadedBy));
    }
    if (filters?.relatedTo) {
      conditions.push(eq(documents.relatedTo, filters.relatedTo));
    }
    if (filters?.relatedType) {
      conditions.push(eq(documents.relatedType, filters.relatedType));
    }

    const query = db
      .select()
      .from(documents)
      .innerJoin(users, eq(documents.uploadedBy, users.id))
      .orderBy(desc(documents.createdAt));

    const result = conditions.length > 0 
      ? await query.where(and(...conditions))
      : await query;

    return result.map(row => ({ ...row.documents, uploader: row.users }));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document> {
    const [updatedDocument] = await db
      .update(documents)
      .set(document)
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  // Dashboard operations
  async getDashboardStats(userId: string): Promise<{
    totalEmployees: number;
    activeOnboarding: number;
    openTasks: number;
    pendingApprovals: number;
    complianceRate: number;
  }> {
    // Simple implementation for now
    const totalEmployees = await db.select().from(employees);
    const openTasks = await db.select().from(tasks).where(eq(tasks.status, 'pending'));
    
    return {
      totalEmployees: totalEmployees.length,
      activeOnboarding: 0,
      openTasks: openTasks.length,
      pendingApprovals: 0,
      complianceRate: 95,
    };
  }

  async getRecentActivities(userId: string, limit = 10): Promise<any[]> {
    // Simple implementation for now
    return [];
  }

  async getPendingApprovals(userId: string): Promise<any[]> {
    // Simple implementation for now
    return [];
  }

  // Psychometric test operations
  async getPsychometricTests(): Promise<PsychometricTest[]> {
    return await db.select().from(psychometricTests).orderBy(desc(psychometricTests.createdAt));
  }

  async getPsychometricTest(id: number): Promise<PsychometricTest | undefined> {
    const [test] = await db.select().from(psychometricTests).where(eq(psychometricTests.id, id));
    return test;
  }

  async createPsychometricTest(test: InsertPsychometricTest): Promise<PsychometricTest> {
    const [newTest] = await db.insert(psychometricTests).values(test).returning();
    return newTest;
  }

  async updatePsychometricTest(id: number, test: Partial<InsertPsychometricTest>): Promise<PsychometricTest> {
    const [updatedTest] = await db
      .update(psychometricTests)
      .set({ ...test, updatedAt: new Date() })
      .where(eq(psychometricTests.id, id))
      .returning();
    return updatedTest;
  }

  async deletePsychometricTest(id: number): Promise<void> {
    await db.delete(psychometricTests).where(eq(psychometricTests.id, id));
  }

  async getPsychometricQuestions(testId: number): Promise<PsychometricQuestion[]> {
    return await db
      .select()
      .from(psychometricQuestions)
      .where(eq(psychometricQuestions.testId, testId))
      .orderBy(psychometricQuestions.order);
  }

  async createPsychometricQuestion(question: InsertPsychometricQuestion): Promise<PsychometricQuestion> {
    const [newQuestion] = await db.insert(psychometricQuestions).values(question).returning();
    return newQuestion;
  }

  async updatePsychometricQuestion(id: number, question: Partial<InsertPsychometricQuestion>): Promise<PsychometricQuestion> {
    const [updatedQuestion] = await db
      .update(psychometricQuestions)
      .set(question)
      .where(eq(psychometricQuestions.id, id))
      .returning();
    return updatedQuestion;
  }

  async deletePsychometricQuestion(id: number): Promise<void> {
    await db.delete(psychometricQuestions).where(eq(psychometricQuestions.id, id));
  }

  async getPsychometricTestAttempts(filters?: { testId?: number; candidateEmail?: string }): Promise<PsychometricTestAttempt[]> {
    const conditions = [];

    if (filters?.testId) {
      conditions.push(eq(psychometricTestAttempts.testId, filters.testId));
    }
    if (filters?.candidateEmail) {
      conditions.push(eq(psychometricTestAttempts.candidateEmail, filters.candidateEmail));
    }

    return await db
      .select()
      .from(psychometricTestAttempts)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(psychometricTestAttempts.startedAt));
  }

  async getPsychometricTestAttempt(id: number): Promise<PsychometricTestAttempt | undefined> {
    const [attempt] = await db.select().from(psychometricTestAttempts).where(eq(psychometricTestAttempts.id, id));
    return attempt;
  }

  async createPsychometricTestAttempt(attempt: InsertPsychometricTestAttempt): Promise<PsychometricTestAttempt> {
    // Calculate scores and generate results
    const processedAttempt = await this.processPsychometricTestResults(attempt);
    const [newAttempt] = await db.insert(psychometricTestAttempts).values(processedAttempt).returning();
    return newAttempt;
  }

  async updatePsychometricTestAttempt(id: number, attempt: Partial<InsertPsychometricTestAttempt>): Promise<PsychometricTestAttempt> {
    const [updatedAttempt] = await db
      .update(psychometricTestAttempts)
      .set(attempt)
      .where(eq(psychometricTestAttempts.id, id))
      .returning();
    return updatedAttempt;
  }

  private async processPsychometricTestResults(attempt: InsertPsychometricTestAttempt): Promise<InsertPsychometricTestAttempt> {
    const test = await this.getPsychometricTest(attempt.testId);
    const questions = await this.getPsychometricQuestions(attempt.testId);
    
    if (!test || !questions.length) {
      return attempt;
    }

    let totalScore = 0;
    const categoryScores: Record<string, { total: number; count: number }> = {};
    const results: any = {};

    // Process responses based on test type
    if (Array.isArray(attempt.responses)) {
      for (const response of attempt.responses) {
        const question = questions.find(q => q.id === response.questionId);
        if (!question) continue;

        let score = 0;
        
        // Calculate score based on question type
        if (question.questionType === 'scale') {
          score = parseInt(response.answer) || 0;
        } else if (question.questionType === 'yes_no') {
          score = response.answer === 'yes' ? 5 : 1;
        } else if (question.questionType === 'multiple_choice' && question.correctAnswer) {
          score = response.answer === question.correctAnswer ? 5 : 0;
        }

        totalScore += score;

        // Track category scores for personality/trait analysis
        if (question.category) {
          if (!categoryScores[question.category]) {
            categoryScores[question.category] = { total: 0, count: 0 };
          }
          categoryScores[question.category].total += score;
          categoryScores[question.category].count += 1;
        }
      }
    }

    // Calculate percentage score
    const maxPossibleScore = questions.length * 5; // Assuming max score of 5 per question
    const percentageScore = Math.round((totalScore / maxPossibleScore) * 100);

    // Generate personality traits or cognitive scores based on test type
    if (test.testType === 'personality') {
      results.personalityTraits = {};
      for (const [category, scores] of Object.entries(categoryScores)) {
        results.personalityTraits[category] = Math.round((scores.total / (scores.count * 5)) * 100);
      }
    } else if (test.testType === 'cognitive') {
      results.cognitiveScores = {};
      for (const [category, scores] of Object.entries(categoryScores)) {
        results.cognitiveScores[category] = Math.round((scores.total / (scores.count * 5)) * 100);
      }
    }

    // Generate recommendations based on scores
    results.recommendations = this.generateRecommendations(test.testType, percentageScore, results);

    return {
      ...attempt,
      totalScore,
      percentageScore,
      results,
    };
  }

  private generateRecommendations(testType: string, percentageScore: number, results: any): string[] {
    const recommendations: string[] = [];

    if (testType === 'personality') {
      if (percentageScore >= 80) {
        recommendations.push("Excellent personality fit for the role with strong interpersonal skills.");
        recommendations.push("Consider for leadership development opportunities.");
      } else if (percentageScore >= 60) {
        recommendations.push("Good personality match with potential for growth.");
        recommendations.push("Recommend mentoring and skill development programs.");
      } else {
        recommendations.push("Consider additional personality development training.");
        recommendations.push("May benefit from team-based collaboration exercises.");
      }
    } else if (testType === 'cognitive') {
      if (percentageScore >= 80) {
        recommendations.push("Strong cognitive abilities suitable for complex problem-solving roles.");
        recommendations.push("Consider for analytical and strategic positions.");
      } else if (percentageScore >= 60) {
        recommendations.push("Good cognitive performance with room for improvement.");
        recommendations.push("Recommend continued learning and development opportunities.");
      } else {
        recommendations.push("May benefit from additional training in analytical thinking.");
        recommendations.push("Consider roles that leverage existing strengths.");
      }
    }

    return recommendations;
  }

  // Department management methods
  async getDepartments(): Promise<(Department & { manager?: User })[]> {
    const result = await db
      .select({
        id: departments.id,
        code: departments.code,
        name: departments.name,
        description: departments.description,
        managerId: departments.managerId,
        budgetAllocated: departments.budgetAllocated,
        headcount: departments.headcount,
        location: departments.location,
        isActive: departments.isActive,
        createdAt: departments.createdAt,
        updatedAt: departments.updatedAt,
        manager: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        }
      })
      .from(departments)
      .leftJoin(users, eq(departments.managerId, users.id))
      .where(eq(departments.isActive, true))
      .orderBy(departments.name);

    return result.map(row => ({
      ...row,
      manager: row.manager && row.manager.id ? row.manager as User : undefined
    }));
  }

  async getDepartment(id: number): Promise<Department | undefined> {
    const result = await db
      .select()
      .from(departments)
      .where(eq(departments.id, id))
      .limit(1);
    
    return result[0];
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const result = await db.insert(departments).values(department).returning();
    return result[0];
  }

  async updateDepartment(id: number, department: Partial<InsertDepartment>): Promise<Department> {
    const result = await db
      .update(departments)
      .set({ ...department, updatedAt: new Date() })
      .where(eq(departments.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error("Department not found");
    }
    
    return result[0];
  }

  async deleteDepartment(id: number): Promise<void> {
    await db
      .update(departments)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(departments.id, id));
  }

  async getEmployeesByDepartment(departmentCode: string): Promise<(Employee & { user: User })[]> {
    const result = await db
      .select({
        id: employees.id,
        userId: employees.userId,
        employeeId: employees.employeeId,
        phoneNumber: employees.phoneNumber,
        address: employees.address,
        emergencyContact: employees.emergencyContact,
        onboardingStatus: employees.onboardingStatus,
        onboardingProgress: employees.onboardingProgress,
        createdAt: employees.createdAt,
        updatedAt: employees.updatedAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          role: users.role,
          status: users.status,
          department: users.department,
          position: users.position,
          managerId: users.managerId,
          startDate: users.startDate,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
      })
      .from(employees)
      .innerJoin(users, eq(employees.userId, users.id))
      .where(eq(users.department, departmentCode))
      .orderBy(users.firstName, users.lastName);

    return result.map(row => ({
      ...row,
      user: row.user as User,
    }));
  }

  // Employee submissions operations (two-phase onboarding)
  async getEmployeeSubmissions(): Promise<EmployeeSubmission[]> {
    return await db.select().from(employeeSubmissions).orderBy(desc(employeeSubmissions.submittedAt));
  }

  async getEmployeeSubmission(id: number): Promise<EmployeeSubmission | undefined> {
    const [submission] = await db.select().from(employeeSubmissions).where(eq(employeeSubmissions.id, id));
    return submission;
  }

  async createEmployeeSubmission(submission: InsertEmployeeSubmission): Promise<EmployeeSubmission> {
    const [newSubmission] = await db.insert(employeeSubmissions).values(submission).returning();
    return newSubmission;
  }

  async updateEmployeeSubmission(id: number, submission: Partial<InsertEmployeeSubmission>): Promise<EmployeeSubmission> {
    const [updatedSubmission] = await db
      .update(employeeSubmissions)
      .set({ ...submission, updatedAt: new Date() })
      .where(eq(employeeSubmissions.id, id))
      .returning();
    return updatedSubmission;
  }

  async updateHRStep(submissionId: number, stepId: string, isCompleted: boolean, notes?: string): Promise<EmployeeSubmission> {
    // Get current submission
    const submission = await this.getEmployeeSubmission(submissionId);
    if (!submission) {
      throw new Error('Employee submission not found');
    }

    // Update steps completed array
    const currentSteps = submission.hrStepsCompleted as string[] || [];
    const currentNotes = submission.hrStepsNotes as Record<string, string> || {};
    
    let updatedSteps: string[];
    if (isCompleted && !currentSteps.includes(stepId)) {
      updatedSteps = [...currentSteps, stepId];
    } else if (!isCompleted && currentSteps.includes(stepId)) {
      updatedSteps = currentSteps.filter(id => id !== stepId);
    } else {
      updatedSteps = currentSteps;
    }

    // Update notes
    const updatedNotes = { ...currentNotes };
    if (notes) {
      updatedNotes[stepId] = notes;
    }

    // Update submission
    return await this.updateEmployeeSubmission(submissionId, {
      hrStepsCompleted: updatedSteps,
      hrStepsNotes: updatedNotes,
      status: updatedSteps.length >= 15 ? 'completed' : 'in_progress' // 15 is total HR steps
    });
  }
}

export const storage = new DatabaseStorage();