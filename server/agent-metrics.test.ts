import { describe, it, expect, beforeAll } from 'vitest';
import { getDb } from './db';
import { agentMetrics } from '../drizzle/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { tailorResume } from './agents/tailor';
import { generateOutreach } from './agents/scribe';
import { assembleApplicationPackage } from './agents/assembler';

describe('Agent Metrics Tracking', () => {
  const testUserId = 999999;
  const testApplicationId = 999999;

  beforeAll(async () => {
    // Clean up any existing test metrics
    const db = await getDb();
    if (db) {
      await db.delete(agentMetrics).where(eq(agentMetrics.userId, testUserId));
    }
  });

  it('should track Tailor agent metrics on success', async () => {
    const input = {
      userProfile: {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '555-0100',
        location: 'San Francisco, CA',
        linkedIn: 'https://linkedin.com/in/testuser',
        workExperience: [
          {
            company: 'Tech Corp',
            title: 'Software Engineer',
            startDate: '2020-01',
            endDate: '2023-12',
            achievements: [
              'Built scalable microservices handling 1M+ requests/day',
              'Led team of 5 engineers on critical infrastructure project',
            ],
          },
        ],
        skills: ['Python', 'TypeScript', 'React', 'Node.js'],
        education: [
          {
            institution: 'Stanford University',
            degree: 'BS',
            field: 'Computer Science',
            graduationYear: '2020',
          },
        ],
      },
      jobDescription: 'Senior Software Engineer position requiring Python, TypeScript, and cloud infrastructure experience.',
      companyName: 'Test Company',
      roleTitle: 'Senior Software Engineer',
    };

    const result = await tailorResume(input, {
      applicationId: testApplicationId,
      userId: testUserId,
    });

    expect(result).toBeDefined();
    expect(result.resumeMarkdown).toBeTruthy();
    expect(result.confidence).toBeGreaterThan(0);

    // Verify metric was recorded
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    const metrics = await db
      .select()
      .from(agentMetrics)
      .where(
        and(
          eq(agentMetrics.agentType, 'tailor'),
          eq(agentMetrics.userId, testUserId)
        )
      )
      .orderBy(sql`${agentMetrics.createdAt} DESC`)
      .limit(1);
    
    expect(metrics.length).toBe(1);
    expect(metrics[0].success).toBe(true);
    expect(metrics[0].duration).toBeGreaterThan(0);
    expect(metrics[0].applicationId).toBe(testApplicationId);
    expect(metrics[0].metadata).toBeDefined();
  });

  it('should track Scribe agent metrics on success', async () => {
    const input = {
      userProfile: {
        fullName: 'Test User',
        currentTitle: 'Software Engineer',
        topAchievements: [
          'Built scalable microservices handling 1M+ requests/day',
          'Led team of 5 engineers on critical infrastructure project',
          'Reduced deployment time by 60% through CI/CD automation',
        ],
      },
      companyName: 'Test Company',
      roleTitle: 'Senior Software Engineer',
      strategicMemo: 'Test Company recently raised $50M Series B and is expanding their engineering team.',
      jobDescription: 'Senior Software Engineer position requiring Python, TypeScript, and cloud infrastructure experience.',
    };

    const result = await generateOutreach(input, {
      applicationId: testApplicationId,
      userId: testUserId,
    });

    expect(result).toBeDefined();
    expect(result.coverLetter).toBeTruthy();
    expect(result.linkedInMessage).toBeTruthy();

    // Verify metric was recorded
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    const metrics = await db
      .select()
      .from(agentMetrics)
      .where(
        and(
          eq(agentMetrics.agentType, 'scribe'),
          eq(agentMetrics.userId, testUserId)
        )
      )
      .orderBy(sql`${agentMetrics.createdAt} DESC`)
      .limit(1);
    
    expect(metrics.length).toBe(1);
    expect(metrics[0].success).toBe(true);
    expect(metrics[0].duration).toBeGreaterThan(0);
    expect(metrics[0].applicationId).toBe(testApplicationId);
  });

  it('should track Assembler agent metrics on success', async () => {
    const input = {
      applicationId: testApplicationId.toString(),
      resumeMarkdown: '# Test Resume\n\n## Experience\n\n- Built things',
      coverLetter: 'Dear Hiring Manager, I am interested in this position.',
      linkedInMessage: 'Hi, I saw your posting and would love to connect.',
      userFullName: 'Test User',
      companyName: 'Test Company',
      roleTitle: 'Senior Software Engineer',
    };

    const result = await assembleApplicationPackage(input, {
      applicationId: testApplicationId,
      userId: testUserId,
    });

    expect(result).toBeDefined();
    expect(result.packageUrl).toBeTruthy();
    expect(result.files.resumePDF).toBeTruthy();
    expect(result.files.resumeDOCX).toBeTruthy();

    // Verify metric was recorded
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    const metrics = await db
      .select()
      .from(agentMetrics)
      .where(
        and(
          eq(agentMetrics.agentType, 'assembler'),
          eq(agentMetrics.userId, testUserId)
        )
      )
      .orderBy(sql`${agentMetrics.createdAt} DESC`)
      .limit(1);
    
    expect(metrics.length).toBe(1);
    expect(metrics[0].success).toBe(true);
    expect(metrics[0].duration).toBeGreaterThan(0);
    expect(metrics[0].applicationId).toBe(testApplicationId);
  });

  it('should verify analytics endpoints return metrics', async () => {
    // Query metrics via Drizzle ORM (simulating tRPC endpoint)
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const metrics = await db
      .select()
      .from(agentMetrics)
      .where(
        and(
          eq(agentMetrics.userId, testUserId),
          gte(agentMetrics.createdAt, twentyFourHoursAgo)
        )
      );

    expect(metrics.length).toBeGreaterThan(0);
    
    // Verify we have metrics for all three agents
    const agentTypes = metrics.map((m) => m.agentType);
    expect(agentTypes).toContain('tailor');
    expect(agentTypes).toContain('scribe');
    expect(agentTypes).toContain('assembler');
  });
});
