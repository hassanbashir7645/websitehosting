import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { createInsertSchema } from "drizzle-zod";
import { psychometricTests, psychometricQuestions, psychometricTestAttempts, departments } from "@shared/schema";

const insertPsychometricTestSchema = createInsertSchema(psychometricTests);
const insertPsychometricQuestionSchema = createInsertSchema(psychometricQuestions);
const insertPsychometricTestAttemptSchema = createInsertSchema(psychometricTestAttempts);
import { insertTaskSchema, insertTaskUpdateSchema, insertTaskRequestSchema, insertAnnouncementSchema, insertRecognitionSchema, insertLogisticsItemSchema, insertLogisticsRequestSchema, insertOnboardingChecklistSchema, insertDocumentSchema, insertEmployeeSchema, insertDepartmentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // For testing purposes, return a default admin user
      const user = await storage.getUser('42726954');
      if (user) {
        res.json(user);
      } else {
        res.status(401).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.post('/api/users', async (req: any, res) => {
    try {
      const userData = req.body;
      const user = await storage.upsertUser(userData);
      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', async (req: any, res) => {
    try {
      const userId = '42726954'; // Use test user ID
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get('/api/dashboard/activities', async (req: any, res) => {
    try {
      const userId = '42726954'; // Use test user ID
      const activities = await storage.getRecentActivities(userId);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.get('/api/dashboard/approvals', async (req: any, res) => {
    try {
      const userId = '42726954'; // Use test user ID
      const approvals = await storage.getPendingApprovals(userId);
      res.json(approvals);
    } catch (error) {
      console.error("Error fetching approvals:", error);
      res.status(500).json({ message: "Failed to fetch approvals" });
    }
  });

  // Employee routes
  app.get('/api/employees', async (req: any, res) => {
    try {
      const { role, status, department } = req.query;
      const employees = await storage.getEmployees({ role, status, department });
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.post('/api/employees', async (req: any, res) => {
    try {
      const validatedData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(validatedData);
      res.json(employee);
    } catch (error) {
      console.error("Error creating employee:", error);
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  app.put('/api/employees/:id', async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEmployeeSchema.partial().parse(req.body);
      const employee = await storage.updateEmployee(id, validatedData);
      res.json(employee);
    } catch (error) {
      console.error("Error updating employee:", error);
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  // Department management routes
  app.get('/api/departments', async (req: any, res) => {
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  app.post('/api/departments', async (req: any, res) => {
    try {
      const validatedData = insertDepartmentSchema.parse(req.body);
      const department = await storage.createDepartment(validatedData);
      res.json(department);
    } catch (error) {
      console.error("Error creating department:", error);
      res.status(500).json({ message: "Failed to create department" });
    }
  });

  app.put('/api/departments/:id', async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDepartmentSchema.partial().parse(req.body);
      const department = await storage.updateDepartment(id, validatedData);
      res.json(department);
    } catch (error) {
      console.error("Error updating department:", error);
      res.status(500).json({ message: "Failed to update department" });
    }
  });

  app.delete('/api/departments/:id', async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDepartment(id);
      res.json({ message: "Department deleted successfully" });
    } catch (error) {
      console.error("Error deleting department:", error);
      res.status(500).json({ message: "Failed to delete department" });
    }
  });

  app.get('/api/departments/:id/employees', async (req: any, res) => {
    try {
      const departmentCode = req.params.id;
      const employees = await storage.getEmployeesByDepartment(departmentCode);
      res.json(employees);
    } catch (error) {
      console.error("Error fetching department employees:", error);
      res.status(500).json({ message: "Failed to fetch department employees" });
    }
  });

  // Task routes
  app.get('/api/tasks', async (req: any, res) => {
    try {
      const { assignedTo, status, priority } = req.query;
      const tasks = await storage.getTasks({ assignedTo, status, priority });
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post('/api/tasks', async (req: any, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.put('/api/tasks/:id', async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(id, validatedData);
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete('/api/tasks/:id', async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTask(id);
      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      console.error("Error deleting task:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete task";
      res.status(500).json({ message: errorMessage });
    }
  });

  // Task updates routes for daily progress tracking
  app.get('/api/tasks/:id/updates', async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const updates = await storage.getTaskUpdates(taskId);
      res.json(updates);
    } catch (error) {
      console.error("Error fetching task updates:", error);
      res.status(500).json({ message: "Failed to fetch task updates" });
    }
  });

  app.post('/api/tasks/:id/updates', async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const updateData = {
        ...req.body,
        taskId,
        userId: '42726954', // Test user ID
      };
      const update = await storage.createTaskUpdate(updateData);
      res.json(update);
    } catch (error) {
      console.error("Error creating task update:", error);
      res.status(500).json({ message: "Failed to create task update" });
    }
  });

  app.put('/api/tasks/:id/updates/:updateId', async (req: any, res) => {
    try {
      const updateId = parseInt(req.params.updateId);
      const update = await storage.updateTaskUpdate(updateId, req.body);
      res.json(update);
    } catch (error) {
      console.error("Error updating task update:", error);
      res.status(500).json({ message: "Failed to update task update" });
    }
  });

  // Task request routes (time extensions, documents, help)
  app.get('/api/task-requests', isAuthenticated, async (req: any, res) => {
    try {
      const { taskId, requesterId, status } = req.query;
      const requests = await storage.getTaskRequests({ 
        taskId: taskId ? parseInt(taskId) : undefined, 
        requesterId, 
        status 
      });
      res.json(requests);
    } catch (error) {
      console.error("Error fetching task requests:", error);
      res.status(500).json({ message: "Failed to fetch task requests" });
    }
  });

  app.post('/api/task-requests', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertTaskRequestSchema.parse(req.body);
      const request = await storage.createTaskRequest(validatedData);
      res.json(request);
    } catch (error) {
      console.error("Error creating task request:", error);
      res.status(500).json({ message: "Failed to create task request" });
    }
  });

  app.put('/api/task-requests/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTaskRequestSchema.partial().parse(req.body);
      const request = await storage.updateTaskRequest(id, validatedData);
      res.json(request);
    } catch (error) {
      console.error("Error updating task request:", error);
      res.status(500).json({ message: "Failed to update task request" });
    }
  });

  app.delete('/api/task-requests/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTaskRequest(id);
      res.json({ message: "Task request deleted successfully" });
    } catch (error) {
      console.error("Error deleting task request:", error);
      res.status(500).json({ message: "Failed to delete task request" });
    }
  });

  // Announcement routes
  app.get('/api/announcements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const announcements = await storage.getAnnouncements(userId);
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post('/api/announcements', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertAnnouncementSchema.parse(req.body);
      const announcement = await storage.createAnnouncement(validatedData);
      res.json(announcement);
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  app.put('/api/announcements/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAnnouncementSchema.partial().parse(req.body);
      const announcement = await storage.updateAnnouncement(id, validatedData);
      res.json(announcement);
    } catch (error) {
      console.error("Error updating announcement:", error);
      res.status(500).json({ message: "Failed to update announcement" });
    }
  });

  app.delete('/api/announcements/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAnnouncement(id);
      res.json({ message: "Announcement deleted successfully" });
    } catch (error) {
      console.error("Error deleting announcement:", error);
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  });

  // Recognition routes
  app.get('/api/recognition', isAuthenticated, async (req: any, res) => {
    try {
      const { nomineeId, type } = req.query;
      const recognitions = await storage.getRecognitions({ nomineeId, type });
      res.json(recognitions);
    } catch (error) {
      console.error("Error fetching recognitions:", error);
      res.status(500).json({ message: "Failed to fetch recognitions" });
    }
  });

  app.post('/api/recognition', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertRecognitionSchema.parse(req.body);
      const recognition = await storage.createRecognition(validatedData);
      res.json(recognition);
    } catch (error) {
      console.error("Error creating recognition:", error);
      res.status(500).json({ message: "Failed to create recognition" });
    }
  });

  app.put('/api/recognition/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertRecognitionSchema.partial().parse(req.body);
      const recognition = await storage.updateRecognition(id, validatedData);
      res.json(recognition);
    } catch (error) {
      console.error("Error updating recognition:", error);
      res.status(500).json({ message: "Failed to update recognition" });
    }
  });

  // Logistics routes
  app.get('/api/logistics/items', async (req: any, res) => {
    try {
      const items = await storage.getLogisticsItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching logistics items:", error);
      res.status(500).json({ message: "Failed to fetch logistics items" });
    }
  });

  app.post('/api/logistics/items', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertLogisticsItemSchema.parse(req.body);
      const item = await storage.createLogisticsItem(validatedData);
      res.json(item);
    } catch (error) {
      console.error("Error creating logistics item:", error);
      res.status(500).json({ message: "Failed to create logistics item" });
    }
  });

  app.put('/api/logistics/items/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertLogisticsItemSchema.partial().parse(req.body);
      const item = await storage.updateLogisticsItem(id, validatedData);
      res.json(item);
    } catch (error) {
      console.error("Error updating logistics item:", error);
      res.status(500).json({ message: "Failed to update logistics item" });
    }
  });

  app.delete('/api/logistics/items/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteLogisticsItem(id);
      res.json({ message: "Logistics item deleted successfully" });
    } catch (error) {
      console.error("Error deleting logistics item:", error);
      res.status(500).json({ message: "Failed to delete logistics item" });
    }
  });

  app.get('/api/logistics/requests', async (req: any, res) => {
    try {
      const { requesterId, status } = req.query;
      const requests = await storage.getLogisticsRequests({ requesterId, status });
      res.json(requests);
    } catch (error) {
      console.error("Error fetching logistics requests:", error);
      res.status(500).json({ message: "Failed to fetch logistics requests" });
    }
  });

  app.post('/api/logistics/requests', async (req: any, res) => {
    try {
      const validatedData = insertLogisticsRequestSchema.parse(req.body);
      const request = await storage.createLogisticsRequest(validatedData);
      res.json(request);
    } catch (error) {
      console.error("Error creating logistics request:", error);
      res.status(500).json({ message: "Failed to create logistics request" });
    }
  });

  app.put('/api/logistics/requests/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertLogisticsRequestSchema.partial().parse(req.body);
      const request = await storage.updateLogisticsRequest(id, validatedData);
      res.json(request);
    } catch (error) {
      console.error("Error updating logistics request:", error);
      res.status(500).json({ message: "Failed to update logistics request" });
    }
  });

  // Logistics workflow routes
  app.put('/api/logistics/requests/:id/approve', async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = '42726954'; // Test user ID
      const request = await storage.updateLogisticsRequest(id, {
        status: 'approved',
        approvedBy: userId,
        approvedAt: new Date(),
      });
      res.json(request);
    } catch (error) {
      console.error("Error approving logistics request:", error);
      res.status(500).json({ message: "Failed to approve logistics request" });
    }
  });

  app.put('/api/logistics/requests/:id/reject', async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { reason } = req.body;
      const request = await storage.updateLogisticsRequest(id, {
        status: 'rejected',
        rejectionReason: reason,
      });
      res.json(request);
    } catch (error) {
      console.error("Error rejecting logistics request:", error);
      res.status(500).json({ message: "Failed to reject logistics request" });
    }
  });

  app.put('/api/logistics/requests/:id/purchase', async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { actualCost, vendor, purchaseDate, notes } = req.body;
      const request = await storage.updateLogisticsRequest(id, {
        status: 'purchased',
        actualCost,
        vendor,
        purchaseDate: new Date(purchaseDate),
        notes,
      });
      res.json(request);
    } catch (error) {
      console.error("Error completing purchase:", error);
      res.status(500).json({ message: "Failed to complete purchase" });
    }
  });

  app.post('/api/logistics/requests/:id/receipt', async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      // Simple receipt upload simulation - in production would handle file upload
      const request = await storage.updateLogisticsRequest(id, {
        status: 'completed',
        receiptUrl: '/receipts/receipt-' + id + '.pdf',
        receiptFilename: 'receipt-' + id + '.pdf',
      });
      res.json(request);
    } catch (error) {
      console.error("Error uploading receipt:", error);
      res.status(500).json({ message: "Failed to upload receipt" });
    }
  });

  // Onboarding routes
  app.get('/api/onboarding/:employeeId', async (req: any, res) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const checklists = await storage.getOnboardingChecklists(employeeId);
      res.json(checklists);
    } catch (error) {
      console.error("Error fetching onboarding checklists:", error);
      res.status(500).json({ message: "Failed to fetch onboarding checklists" });
    }
  });

  // Create comprehensive onboarding checklist for a new employee
  app.post('/api/onboarding/create-template/:employeeId', async (req: any, res) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const userId = '42726954'; // Use test user ID
      
      // Predefined comprehensive onboarding checklist
      const onboardingTemplate = [
        // Pre-arrival items
        { itemTitle: "Workspace Setup", description: "Prepare desk, chair, and basic office supplies", order: 1 },
        { itemTitle: "IT Equipment Assignment", description: "Assign laptop, monitor, keyboard, mouse", order: 2 },
        { itemTitle: "Email Account Creation", description: "Create company email account and send credentials", order: 3 },
        { itemTitle: "Access Card Preparation", description: "Prepare building access card and parking pass", order: 4 },
        { itemTitle: "Welcome Package", description: "Prepare welcome kit with company swag and materials", order: 5 },
        
        // Day 1 items
        { itemTitle: "Welcome Meeting", description: "Meet with direct manager and HR representative", order: 6 },
        { itemTitle: "Office Tour", description: "Complete office tour including emergency exits and facilities", order: 7 },
        { itemTitle: "Meet Team Members", description: "Introduction to immediate team and key colleagues", order: 8 },
        { itemTitle: "IT Setup & Login", description: "Complete computer setup and test all system access", order: 9 },
        { itemTitle: "Company Overview Presentation", description: "Attend company overview and culture presentation", order: 10 },
        { itemTitle: "Employee Handbook Review", description: "Review and acknowledge employee handbook", order: 11, requiresDocument: true, documentType: "pdf" },
        
        // Week 1 items
        { itemTitle: "Complete I-9 Form", description: "Submit I-9 form with required documentation", order: 12, requiresDocument: true, documentType: "pdf" },
        { itemTitle: "Submit W-4 Form", description: "Complete and submit tax withholding form", order: 13, requiresDocument: true, documentType: "pdf" },
        { itemTitle: "Benefits Enrollment", description: "Complete health, dental, and retirement plan enrollment", order: 14, requiresDocument: true, documentType: "pdf" },
        { itemTitle: "Emergency Contact Information", description: "Provide emergency contact details", order: 15 },
        { itemTitle: "Direct Deposit Setup", description: "Submit banking information for payroll", order: 16, requiresDocument: true, documentType: "image" },
        { itemTitle: "Security Training", description: "Complete mandatory security awareness training", order: 17, requiresDocument: true, documentType: "pdf" },
        { itemTitle: "Confidentiality Agreement", description: "Sign confidentiality and non-disclosure agreement", order: 18, requiresDocument: true, documentType: "pdf" },
        
        // Week 2 items
        { itemTitle: "Department-Specific Training", description: "Complete role-specific training modules", order: 19 },
        { itemTitle: "Mentor Assignment", description: "Meet with assigned workplace mentor", order: 20 },
        { itemTitle: "System Access Verification", description: "Verify access to all required systems and databases", order: 21 },
        { itemTitle: "Performance Goals Setting", description: "Establish 30-60-90 day performance goals", order: 22 },
        { itemTitle: "Project Assignment", description: "Receive first project assignment and overview", order: 23 },
        
        // Month 1 items
        { itemTitle: "30-Day Check-in", description: "Formal 30-day review with manager", order: 24 },
        { itemTitle: "HR Feedback Session", description: "Feedback session with HR about onboarding experience", order: 25 },
        { itemTitle: "Workplace Culture Assessment", description: "Complete workplace culture and satisfaction survey", order: 26 },
        { itemTitle: "Training Progress Review", description: "Review completion of all mandatory training", order: 27 },
        { itemTitle: "Goal Progress Check", description: "Review progress on initial performance goals", order: 28 },
        
        // Long-term items
        { itemTitle: "60-Day Review", description: "Comprehensive 60-day performance review", order: 29 },
        { itemTitle: "90-Day Review", description: "Final onboarding review and transition to regular employee", order: 30 },
        { itemTitle: "Professional Development Plan", description: "Create long-term professional development plan", order: 31 },
        { itemTitle: "Company Social Integration", description: "Participate in company social events and team building", order: 32 },
      ];

      // Create all checklist items for the employee
      const createdItems = [];
      for (const item of req.body) {
        const checklistItem = await storage.createOnboardingChecklist({
          employeeId,
          ...item
        });
        createdItems.push(checklistItem);
      }

      res.json({ 
        message: "Comprehensive onboarding checklist created successfully",
        items: createdItems,
        totalItems: createdItems.length
      });
    } catch (error) {
      console.error("Error creating onboarding template:", error);
      res.status(500).json({ message: "Failed to create onboarding template" });
    }
  });

  // Generate onboarding link for employee
  app.post('/api/onboarding/generate-link/:employeeId', async (req: any, res) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const employees = await storage.getEmployees();
      const employee = employees.find(emp => emp.id === employeeId);
      
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // In a real implementation, you would generate a secure token and store it
      // For now, we'll create a simple link with the employee ID
      const onboardingLink = `${req.protocol}://${req.hostname}/onboarding-portal?employeeId=${employeeId}&token=${Buffer.from(employeeId.toString()).toString('base64')}`;
      
      res.json({ 
        onboardingLink,
        employeeName: `${employee.user.firstName} ${employee.user.lastName}`,
        employeeEmail: employee.user.email,
        message: "Onboarding link generated successfully. Share this link with the employee to complete their onboarding."
      });
    } catch (error) {
      console.error("Error generating onboarding link:", error);
      res.status(500).json({ message: "Failed to generate onboarding link" });
    }
  });

  // Employee onboarding progress and completion routes
  app.get('/api/onboarding/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const employee = await storage.getEmployee(userId);
      
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const checklists = await storage.getOnboardingChecklists(employee.id);
      const totalItems = checklists.length;
      const completedItems = checklists.filter(item => item.isCompleted).length;
      const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      res.json({
        employee,
        checklists,
        progress: {
          total: totalItems,
          completed: completedItems,
          percentage: progress
        }
      });
    } catch (error) {
      console.error("Error fetching onboarding progress:", error);
      res.status(500).json({ message: "Failed to fetch onboarding progress" });
    }
  });

  app.post('/api/onboarding/save-progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progressData = req.body;
      
      // Save the onboarding progress data
      // In a real implementation, you would save this to a dedicated table
      res.json({ message: "Progress saved successfully", data: progressData });
    } catch (error) {
      console.error("Error saving onboarding progress:", error);
      res.status(500).json({ message: "Failed to save onboarding progress" });
    }
  });

  app.post('/api/onboarding/submit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const onboardingData = req.body;
      
      // Process final onboarding submission
      // In a real implementation, you would save this data and trigger workflows
      
      // Update employee onboarding status
      const employee = await storage.getEmployee(userId);
      if (employee) {
        await storage.updateEmployee(employee.id, {
          onboardingStatus: 'completed',
          onboardingProgress: 100
        });
      }

      res.json({ 
        message: "Onboarding completed successfully",
        data: onboardingData 
      });
    } catch (error) {
      console.error("Error submitting onboarding:", error);
      res.status(500).json({ message: "Failed to submit onboarding" });
    }
  });

  // Get all onboarding checklists
  app.get('/api/onboarding-checklists', async (req: any, res) => {
    try {
      const checklists = await storage.getAllOnboardingChecklists();
      res.json(checklists);
    } catch (error) {
      console.error("Error fetching all onboarding checklists:", error);
      res.status(500).json({ message: "Failed to fetch onboarding checklists" });
    }
  });

  // Two-phase onboarding endpoints
  // Step 1: Employee submits their details
  app.post('/api/onboarding/employee-details', async (req: any, res) => {
    try {
      const employeeData = req.body;
      
      // Create employee submission
      const submission = await storage.createEmployeeSubmission({
        ...employeeData,
        status: 'pending',
        submittedAt: new Date(),
        hrStepsCompleted: [],
        hrStepsNotes: {}
      });
      
      res.json({ 
        success: true, 
        submissionId: submission.id,
        message: "Your details have been submitted successfully. HR will complete your onboarding process." 
      });
    } catch (error) {
      console.error("Error creating employee submission:", error);
      res.status(500).json({ message: "Failed to submit employee details" });
    }
  });

  // Get all employee submissions for HR
  app.get('/api/onboarding/employee-submissions', async (req: any, res) => {
    try {
      const submissions = await storage.getEmployeeSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching employee submissions:", error);
      res.status(500).json({ message: "Failed to fetch employee submissions" });
    }
  });

  // Get specific employee submission
  app.get('/api/onboarding/employee-submission/:id', async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const submission = await storage.getEmployeeSubmission(id);
      
      if (!submission) {
        return res.status(404).json({ message: "Employee submission not found" });
      }
      
      res.json(submission);
    } catch (error) {
      console.error("Error fetching employee submission:", error);
      res.status(500).json({ message: "Failed to fetch employee submission" });
    }
  });

  // Step 2: HR updates onboarding step
  app.put('/api/onboarding/hr-step/:stepId', async (req: any, res) => {
    try {
      const { stepId } = req.params;
      const { employeeId, isCompleted, notes } = req.body;
      
      if (!employeeId) {
        return res.status(400).json({ message: "Employee ID is required" });
      }
      
      const updatedSubmission = await storage.updateHRStep(employeeId, stepId, isCompleted, notes);
      res.json(updatedSubmission);
    } catch (error) {
      console.error("Error updating HR step:", error);
      res.status(500).json({ message: "Failed to update HR step" });
    }
  });

  // Complete onboarding process
  app.post('/api/onboarding/complete/:employeeId', async (req: any, res) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      
      const completedSubmission = await storage.updateEmployeeSubmission(employeeId, {
        status: 'completed',
        completedAt: new Date(),
        assignedHR: req.user?.claims?.sub
      });
      
      res.json({ 
        success: true, 
        message: "Employee onboarding completed successfully",
        submission: completedSubmission 
      });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  app.post('/api/onboarding', async (req: any, res) => {
    try {
      const validatedData = insertOnboardingChecklistSchema.parse(req.body);
      const checklist = await storage.createOnboardingChecklist(validatedData);
      res.json(checklist);
    } catch (error) {
      console.error("Error creating onboarding checklist:", error);
      res.status(500).json({ message: "Failed to create onboarding checklist" });
    }
  });

  app.put('/api/onboarding/:id', async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertOnboardingChecklistSchema.partial().parse(req.body);
      const checklist = await storage.updateOnboardingChecklist(id, validatedData);
      res.json(checklist);
    } catch (error) {
      console.error("Error updating onboarding checklist:", error);
      res.status(500).json({ message: "Failed to update onboarding checklist" });
    }
  });

  // Document upload for onboarding items
  app.post('/api/onboarding/:id/upload', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { documentUrl, documentName } = req.body;
      
      const checklist = await storage.updateOnboardingChecklist(id, {
        documentUrl,
        documentName,
        isDocumentVerified: false // Reset verification status when new document is uploaded
      });
      
      res.json(checklist);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  // Document verification for HR
  app.post('/api/onboarding/:id/verify', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isVerified, verificationNotes } = req.body;
      const userId = req.user.claims.sub;
      
      const checklist = await storage.updateOnboardingChecklist(id, {
        isDocumentVerified: isVerified,
        verifiedBy: isVerified ? userId : null,
        verifiedAt: isVerified ? new Date() : null,
        verificationNotes
      });
      
      res.json(checklist);
    } catch (error) {
      console.error("Error verifying document:", error);
      res.status(500).json({ message: "Failed to verify document" });
    }
  });

  app.delete('/api/onboarding/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteOnboardingChecklist(id);
      res.json({ message: "Onboarding checklist deleted successfully" });
    } catch (error) {
      console.error("Error deleting onboarding checklist:", error);
      res.status(500).json({ message: "Failed to delete onboarding checklist" });
    }
  });

  // Document routes
  app.get('/api/documents', isAuthenticated, async (req: any, res) => {
    try {
      const { uploadedBy, relatedTo, relatedType } = req.query;
      const documents = await storage.getDocuments({ uploadedBy, relatedTo, relatedType });
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post('/api/documents', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(validatedData);
      res.json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  app.put('/api/documents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDocumentSchema.partial().parse(req.body);
      const document = await storage.updateDocument(id, validatedData);
      res.json(document);
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  app.delete('/api/documents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDocument(id);
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Psychometric Test routes
  app.get('/api/psychometric-tests', async (req: any, res) => {
    try {
      const tests = await storage.getPsychometricTests();
      res.json(tests);
    } catch (error) {
      console.error("Error fetching psychometric tests:", error);
      res.status(500).json({ message: "Failed to fetch psychometric tests" });
    }
  });

  // Export all psychometric tests with questions for PDF generation
  app.get('/api/psychometric-tests/export', async (req: any, res) => {
    try {
      const tests = await storage.getPsychometricTests();
      const testsWithQuestions = [];

      for (const test of tests) {
        const questions = await storage.getPsychometricQuestions(test.id);
        testsWithQuestions.push({
          ...test,
          questions
        });
      }

      res.json(testsWithQuestions);
    } catch (error) {
      console.error("Error exporting psychometric tests:", error);
      res.status(500).json({ message: "Failed to export psychometric tests" });
    }
  });

  app.get('/api/psychometric-tests/:id', async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const test = await storage.getPsychometricTest(id);
      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }
      res.json(test);
    } catch (error) {
      console.error("Error fetching psychometric test:", error);
      res.status(500).json({ message: "Failed to fetch psychometric test" });
    }
  });

  app.post('/api/psychometric-tests', async (req: any, res) => {
    try {
      const validatedData = insertPsychometricTestSchema.parse(req.body);
      const test = await storage.createPsychometricTest(validatedData);
      res.json(test);
    } catch (error) {
      console.error("Error creating psychometric test:", error);
      res.status(500).json({ message: "Failed to create psychometric test" });
    }
  });

  app.put('/api/psychometric-tests/:id', async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPsychometricTestSchema.partial().parse(req.body);
      const test = await storage.updatePsychometricTest(id, validatedData);
      res.json(test);
    } catch (error) {
      console.error("Error updating psychometric test:", error);
      res.status(500).json({ message: "Failed to update psychometric test" });
    }
  });

  app.delete('/api/psychometric-tests/:id', async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePsychometricTest(id);
      res.json({ message: "Psychometric test deleted successfully" });
    } catch (error) {
      console.error("Error deleting psychometric test:", error);
      res.status(500).json({ message: "Failed to delete psychometric test" });
    }
  });

  // Psychometric Questions routes
  app.get('/api/psychometric-tests/:testId/questions', async (req: any, res) => {
    try {
      const testId = parseInt(req.params.testId);
      const questions = await storage.getPsychometricQuestions(testId);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching psychometric questions:", error);
      res.status(500).json({ message: "Failed to fetch psychometric questions" });
    }
  });

  app.post('/api/psychometric-questions', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertPsychometricQuestionSchema.parse(req.body);
      const question = await storage.createPsychometricQuestion(validatedData);
      
      // Update test's total questions count
      const test = await storage.getPsychometricTest(validatedData.testId);
      if (test) {
        const questions = await storage.getPsychometricQuestions(validatedData.testId);
        await storage.updatePsychometricTest(validatedData.testId, {
          totalQuestions: questions.length
        });
      }
      
      res.json(question);
    } catch (error) {
      console.error("Error creating psychometric question:", error);
      res.status(500).json({ message: "Failed to create psychometric question" });
    }
  });

  // Psychometric Test Attempts routes
  app.get('/api/psychometric-test-attempts', async (req: any, res) => {
    try {
      const { testId, candidateEmail } = req.query;
      const attempts = await storage.getPsychometricTestAttempts({ 
        testId: testId ? parseInt(testId as string) : undefined,
        candidateEmail: candidateEmail as string 
      });
      res.json(attempts);
    } catch (error) {
      console.error("Error fetching psychometric test attempts:", error);
      res.status(500).json({ message: "Failed to fetch psychometric test attempts" });
    }
  });

  app.get('/api/psychometric-test-attempts/:id', async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const attempt = await storage.getPsychometricTestAttempt(id);
      if (!attempt) {
        return res.status(404).json({ message: "Test attempt not found" });
      }
      res.json(attempt);
    } catch (error) {
      console.error("Error fetching psychometric test attempt:", error);
      res.status(500).json({ message: "Failed to fetch psychometric test attempt" });
    }
  });

  app.post('/api/psychometric-test-attempts', async (req: any, res) => {
    try {
      const validatedData = insertPsychometricTestAttemptSchema.parse(req.body);
      const attempt = await storage.createPsychometricTestAttempt(validatedData);
      
      // If this is linked to an onboarding checklist, update it
      if (req.body.onboardingChecklistId) {
        await storage.updateOnboardingChecklist(parseInt(req.body.onboardingChecklistId), {
          psychometricTestAttemptId: attempt.id,
          psychometricTestCompleted: true,
          psychometricTestScore: attempt.totalScore,
          isCompleted: true,
          completedBy: attempt.candidateEmail
        });
      }
      
      res.json(attempt);
    } catch (error) {
      console.error("Error creating psychometric test attempt:", error);
      res.status(500).json({ message: "Failed to create psychometric test attempt" });
    }
  });

  // Complete psychometric test for onboarding
  app.put('/api/onboarding/:id/psychometric-test', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { attemptId, score } = req.body;
      
      const checklistItem = await storage.updateOnboardingChecklist(parseInt(id), {
        psychometricTestAttemptId: attemptId,
        psychometricTestCompleted: true,
        psychometricTestScore: score,
        isCompleted: true,
        completedBy: req.user?.claims?.sub
      });

      res.json(checklistItem);
    } catch (error) {
      console.error('Error updating psychometric test completion:', error);
      res.status(500).json({ message: 'Failed to update psychometric test completion' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
