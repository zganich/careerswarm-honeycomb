import { describe, it, expect, beforeAll } from 'vitest';
import * as db from './db';

describe('Analytics Endpoints', () => {
  describe('Agent Metrics', () => {
    it('should insert agent metric successfully', async () => {
      await db.insertAgentMetric({
        agentType: 'tailor',
        duration: 1500,
        success: true,
        applicationId: 1,
        userId: 1,
        metadata: { keywordCount: 25, confidence: 59.52 },
      });
      
      // If no error thrown, test passes
      expect(true).toBe(true);
    });

    it('should retrieve agent metrics with filters', async () => {
      const metrics = await db.getAgentMetrics({
        agentType: 'tailor',
        limit: 10,
      });
      
      expect(Array.isArray(metrics)).toBe(true);
    });

    it('should get agent performance stats', async () => {
      const stats = await db.getAgentPerformanceStats();
      
      expect(stats).toBeDefined();
      expect(Array.isArray(stats)).toBe(true);
    });
  });

  describe('Database Schema', () => {
    it('should have agentMetrics table available', async () => {
      // Test that we can query the agentMetrics table
      const metrics = await db.getAgentMetrics({ limit: 1 });
      
      expect(Array.isArray(metrics)).toBe(true);
    });
  });
});
