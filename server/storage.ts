import {
  psychometricTests,
  psychometricQuestions,
  psychometricTestAttempts,
  users,
  type User,
  type UpsertUser,
  type PsychometricTest,
  type InsertPsychometricTest,
  type PsychometricQuestion,
  type InsertPsychometricQuestion,
  type PsychometricTestAttempt,
  type InsertPsychometricTestAttempt,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, like, or, count, sum, isNull, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Dashboard operations
  getDashboardStats(): Promise<{
    totalTests: number;
    totalAttempts: number;
    completedAttempts: number;
    averageScore: number;
  }>;
  
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
    // Return mock user for demo
    return { id, email: 'admin@psychotestpro.com', firstName: 'Admin', lastName: 'User', role: 'hr_admin' } as User;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Return mock user for demo
    return userData as User;
  }

  // Dashboard operations
  async getDashboardStats(): Promise<{
    totalTests: number;
    totalAttempts: number;
    completedAttempts: number;
    averageScore: number;
  }> {
    const tests = await this.getPsychometricTests();
    const attempts = await this.getPsychometricTestAttempts();
    const completed = attempts.filter(a => a.status === 'completed');
    const avgScore = completed.length > 0 
      ? Math.round(completed.reduce((sum, a) => sum + (a.percentageScore || 0), 0) / completed.length)
      : 0;
    
    return {
      totalTests: tests.length,
      totalAttempts: attempts.length,
      completedAttempts: completed.length,
      averageScore: avgScore,
    };
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
}

export const storage = new DatabaseStorage();