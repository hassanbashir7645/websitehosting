import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createInsertSchema } from "drizzle-zod";
import { psychometricTests, psychometricQuestions, psychometricTestAttempts, departments } from "@shared/schema";

const insertPsychometricTestSchema = createInsertSchema(psychometricTests);
const insertPsychometricQuestionSchema = createInsertSchema(psychometricQuestions);
const insertPsychometricTestAttemptSchema = createInsertSchema(psychometricTestAttempts);
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // For demo purposes, return a default admin user
      const user = await storage.getUser('demo_admin');
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

  // Dashboard routes
  app.get('/api/dashboard/stats', async (req: any, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Candidates route (alias for test attempts)
  app.get('/api/candidates', async (req: any, res) => {
    try {
      const attempts = await storage.getPsychometricTestAttempts();
      res.json(attempts);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      res.status(500).json({ message: "Failed to fetch candidates" });
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

  app.post('/api/psychometric-questions', async (req: any, res) => {
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
      res.json(attempt);
    } catch (error) {
      console.error("Error creating psychometric test attempt:", error);
      res.status(500).json({ message: "Failed to create psychometric test attempt" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
