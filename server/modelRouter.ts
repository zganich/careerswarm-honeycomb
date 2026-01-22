/**
 * Model Router - Intelligent model selection for cost optimization
 * 
 * Cost per 1M tokens (input/output):
 * - GPT-4o-mini: $0.15 / $0.60
 * - GPT-4o: $2.50 / $10.00
 * - Claude 3.5 Sonnet: $3.00 / $15.00
 * 
 * Strategy:
 * - Simple tasks (scoring, classification): GPT-4o-mini (90% cheaper)
 * - Medium tasks (analysis, extraction): GPT-4o
 * - Complex tasks (reasoning, generation): Claude 3.5 Sonnet
 */

export enum TaskComplexity {
  SIMPLE = "simple",
  MEDIUM = "medium",
  COMPLEX = "complex",
}

export enum Model {
  GPT_4O_MINI = "gpt-4o-mini",
  GPT_4O = "gpt-4o",
  CLAUDE_35_SONNET = "claude-3-5-sonnet-20241022",
}

/**
 * Model selection based on task complexity
 */
export function selectModel(complexity: TaskComplexity): Model {
  switch (complexity) {
    case TaskComplexity.SIMPLE:
      return Model.GPT_4O_MINI;
    case TaskComplexity.MEDIUM:
      return Model.GPT_4O;
    case TaskComplexity.COMPLEX:
      return Model.CLAUDE_35_SONNET;
    default:
      return Model.GPT_4O_MINI;
  }
}

/**
 * Task complexity classification
 */
export const TaskType = {
  // Simple tasks (GPT-4o-mini)
  IMPACT_METER_SCORING: TaskComplexity.SIMPLE,
  POWER_VERB_DETECTION: TaskComplexity.SIMPLE,
  METRIC_DETECTION: TaskComplexity.SIMPLE,
  KEYWORD_MATCHING: TaskComplexity.SIMPLE,
  CLASSIFICATION: TaskComplexity.SIMPLE,
  SENTIMENT_ANALYSIS: TaskComplexity.SIMPLE,
  
  // Medium tasks (GPT-4o)
  SKILL_EXTRACTION: TaskComplexity.MEDIUM,
  JD_ANALYSIS: TaskComplexity.MEDIUM,
  ACHIEVEMENT_PARSING: TaskComplexity.MEDIUM,
  COMPANY_RESEARCH: TaskComplexity.MEDIUM,
  RESUME_MATCHING: TaskComplexity.MEDIUM,
  EMAIL_PARSING: TaskComplexity.MEDIUM,
  
  // Complex tasks (Claude 3.5 Sonnet)
  STAR_TO_XYZ_TRANSFORMATION: TaskComplexity.COMPLEX,
  COVER_LETTER_GENERATION: TaskComplexity.COMPLEX,
  RESUME_TAILORING: TaskComplexity.COMPLEX,
  INTERVIEW_PREP: TaskComplexity.COMPLEX,
  CAREER_ADVICE: TaskComplexity.COMPLEX,
  DEEP_REASONING: TaskComplexity.COMPLEX,
} as const;

/**
 * Get model for specific task type
 */
export function getModelForTask(taskType: keyof typeof TaskType): Model {
  const complexity = TaskType[taskType];
  return selectModel(complexity);
}

/**
 * Estimate token cost for a request
 */
export function estimateCost(
  model: Model,
  inputTokens: number,
  outputTokens: number
): number {
  const costs = {
    [Model.GPT_4O_MINI]: { input: 0.15, output: 0.60 },
    [Model.GPT_4O]: { input: 2.50, output: 10.00 },
    [Model.CLAUDE_35_SONNET]: { input: 3.00, output: 15.00 },
  };

  const cost = costs[model];
  return (inputTokens * cost.input + outputTokens * cost.output) / 1_000_000;
}

/**
 * Track model usage for analytics
 */
export interface ModelUsage {
  model: Model;
  taskType: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  timestamp: Date;
  userId?: number;
}

const usageLog: ModelUsage[] = [];

export function logModelUsage(usage: ModelUsage): void {
  usageLog.push(usage);
  
  // Keep only last 10000 entries in memory
  if (usageLog.length > 10000) {
    usageLog.shift();
  }
}

export function getUsageStats(): {
  totalCost: number;
  totalRequests: number;
  byModel: Record<Model, { requests: number; cost: number }>;
} {
  const stats = {
    totalCost: 0,
    totalRequests: usageLog.length,
    byModel: {
      [Model.GPT_4O_MINI]: { requests: 0, cost: 0 },
      [Model.GPT_4O]: { requests: 0, cost: 0 },
      [Model.CLAUDE_35_SONNET]: { requests: 0, cost: 0 },
    },
  };

  for (const usage of usageLog) {
    stats.totalCost += usage.cost;
    stats.byModel[usage.model].requests++;
    stats.byModel[usage.model].cost += usage.cost;
  }

  return stats;
}

/**
 * Prompt token estimation (rough approximation)
 */
export function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}
