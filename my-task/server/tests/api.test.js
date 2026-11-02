import request from 'supertest';
import app from '../src/app.js';
import { breakdownTaskWithAI } from '../src/services/aiService.js';
import { calculateGoalProgress, getNextRecurrenceDate } from '../src/utils/helpers.js';

describe('MY TASK Automated Test Suite', () => {
  // Test Health endpoint
  describe('GET /api/health', () => {
    it('should return 200 with healthy status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.app).toBe('MY TASK API');
    });
  });

  // Test Route Protection & Authentication
  describe('Protected Routes & Authorization', () => {
    it('should reject unauthenticated request to /api/tasks with 401', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject unauthenticated request to /api/goals with 401', async () => {
      const res = await request(app).get('/api/goals');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject unauthenticated request to /api/analytics/dashboard with 401', async () => {
      const res = await request(app).get('/api/analytics/dashboard');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject unauthenticated request to /api/calendar/events with 401', async () => {
      const res = await request(app).get('/api/calendar/events');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // Test Input Validation on Registration & Login
  describe('Input Validation on Auth Endpoints', () => {
    it('should reject registration with invalid email or weak password', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'A',
        email: 'invalid-email-address',
        password: '123',
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('should reject login with missing password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // Test AI Breakdown Service Heuristic Engine
  describe('AI Breakdown Heuristic Fallback Engine', () => {
    it('should generate structured daily task plan even when external API key is absent', async () => {
      const result = await breakdownTaskWithAI('Master Full-Stack in 7 days', 7);
      expect(result).toBeDefined();
      expect(result.dailyPlan).toBeDefined();
      expect(result.dailyPlan.length).toBe(7);
      expect(result.dailyPlan[0].subtasks.length).toBeGreaterThan(0);
      expect(result.dailyPlan[0].priority).toBe('HIGH');
    });

    it('should clamp requested days between 3 and 30', async () => {
      const resultShort = await breakdownTaskWithAI('Quick sprint', 1);
      expect(resultShort.dailyPlan.length).toBe(3);

      const resultLong = await breakdownTaskWithAI('Long project', 50);
      expect(resultLong.dailyPlan.length).toBe(30);
    });
  });

  // Test Calculation Helpers: Goal Progress & Recurrence
  describe('Business Logic: Goal Progress & Recurrence Calculations', () => {
    it('should accurately calculate goal progress based on milestones and tasks', () => {
      const milestones = [
        { isCompleted: true },
        { isCompleted: true },
        { isCompleted: false },
        { isCompleted: false },
      ]; // 50% milestone completion

      const tasks = [
        { status: 'COMPLETED' },
        { status: 'PENDING' },
      ]; // 50% task completion

      // 60% * 50% + 40% * 50% = 50%
      const progress = calculateGoalProgress(milestones, tasks);
      expect(progress).toBe(50);
    });

    it('should return 100% when all milestones and tasks are completed', () => {
      const milestones = [{ isCompleted: true }, { isCompleted: true }];
      const tasks = [{ status: 'COMPLETED' }];
      const progress = calculateGoalProgress(milestones, tasks);
      expect(progress).toBe(100);
    });

    it('should correctly advance recurrence dates for Daily, Weekly, and Monthly', () => {
      const base = new Date('2026-11-01T12:00:00Z');
      const dailyNext = getNextRecurrenceDate(base, 'DAILY', 1);
      expect(dailyNext.getUTCDate()).toBe(2);

      const weeklyNext = getNextRecurrenceDate(base, 'WEEKLY', 1);
      expect(weeklyNext.getUTCDate()).toBe(8);

      const monthlyNext = getNextRecurrenceDate(base, 'MONTHLY', 1);
      expect(monthlyNext.getUTCMonth()).toBe(11); // December
    });
  });
});
