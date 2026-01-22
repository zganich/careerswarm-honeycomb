import { Queue, Worker, Job, QueueEvents } from "bullmq";
import { getRedisConnection } from "./cache";

const redis = getRedisConnection();

/**
 * Job queue names
 */
export enum QueueName {
  SCRAPE_JOBS = "scrape-jobs",
  QUALIFY_APPLICATION = "qualify-application",
  PROFILE_COMPANY = "profile-company",
  TAILOR_RESUME = "tailor-resume",
  GENERATE_COVER_LETTER = "generate-cover-letter",
  SUBMIT_APPLICATION = "submit-application",
  TRACK_STATUS = "track-status",
  SEND_EMAIL = "send-email",
  ANALYZE_ACHIEVEMENT = "analyze-achievement",
}

/**
 * Job data types
 */
export interface ScrapeJobsData {
  userId: number;
  keywords: string;
  location?: string;
  platforms: ("linkedin" | "indeed" | "glassdoor")[];
}

export interface QualifyApplicationData {
  userId: number;
  jobId: number;
  resumeId: number;
}

export interface ProfileCompanyData {
  userId: number;
  companyName: string;
  jobId: number;
}

export interface TailorResumeData {
  userId: number;
  resumeId: number;
  jobId: number;
}

export interface GenerateCoverLetterData {
  userId: number;
  jobId: number;
  resumeId: number;
}

export interface SubmitApplicationData {
  userId: number;
  applicationId: number;
  jobUrl: string;
}

export interface TrackStatusData {
  userId: number;
  applicationId: number;
}

export interface SendEmailData {
  to: string;
  subject: string;
  body: string;
  userId?: number;
}

export interface AnalyzeAchievementData {
  userId: number;
  achievementId: number;
}

/**
 * Queue instances
 */
const queues = new Map<QueueName, Queue>();

/**
 * Get or create queue
 */
export function getQueue(name: QueueName): Queue {
  if (!redis) {
    throw new Error("Redis connection not available for job queue");
  }
  
  if (!queues.has(name)) {
    const queue = new Queue(name, {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        removeOnComplete: {
          count: 100, // Keep last 100 completed jobs
          age: 24 * 60 * 60, // 24 hours
        },
        removeOnFail: {
          count: 500, // Keep last 500 failed jobs for debugging
        },
      },
    });
    queues.set(name, queue);
  }
  return queues.get(name)!;
}

/**
 * Add job to queue
 */
export async function addJob<T>(
  queueName: QueueName,
  data: T,
  options?: {
    delay?: number;
    priority?: number;
    jobId?: string;
  }
): Promise<Job<T>> {
  const queue = getQueue(queueName);
  return queue.add(queueName, data, options);
}

/**
 * Add multiple jobs in bulk
 */
export async function addBulkJobs<T>(
  queueName: QueueName,
  jobs: Array<{ data: T; opts?: { delay?: number; priority?: number } }>
): Promise<Job<T>[]> {
  const queue = getQueue(queueName);
  return queue.addBulk(
    jobs.map((job) => ({
      name: queueName,
      data: job.data,
      opts: job.opts,
    }))
  );
}

/**
 * Get job by ID
 */
export async function getJob<T>(
  queueName: QueueName,
  jobId: string
): Promise<Job<T> | undefined> {
  const queue = getQueue(queueName);
  return queue.getJob(jobId);
}

/**
 * Get job counts
 */
export async function getJobCounts(queueName: QueueName) {
  const queue = getQueue(queueName);
  return queue.getJobCounts();
}

/**
 * Clean completed jobs
 */
export async function cleanQueue(
  queueName: QueueName,
  grace: number = 24 * 60 * 60 * 1000 // 24 hours
): Promise<string[]> {
  const queue = getQueue(queueName);
  return queue.clean(grace, 100, "completed");
}

/**
 * Pause queue
 */
export async function pauseQueue(queueName: QueueName): Promise<void> {
  const queue = getQueue(queueName);
  await queue.pause();
}

/**
 * Resume queue
 */
export async function resumeQueue(queueName: QueueName): Promise<void> {
  const queue = getQueue(queueName);
  await queue.resume();
}

/**
 * Worker processor type
 */
export type JobProcessor<T> = (job: Job<T>) => Promise<any>;

/**
 * Create worker for queue
 */
export function createWorker<T>(
  queueName: QueueName,
  processor: JobProcessor<T>,
  options?: {
    concurrency?: number;
    limiter?: {
      max: number;
      duration: number;
    };
  }
): Worker<T> {
  if (!redis) {
    throw new Error("Redis connection not available for worker");
  }
  
  return new Worker<T>(queueName, processor, {
    connection: redis,
    concurrency: options?.concurrency || 5,
    limiter: options?.limiter,
  });
}

/**
 * Listen to queue events
 */
export function createQueueEvents(queueName: QueueName): QueueEvents {
  if (!redis) {
    throw new Error("Redis connection not available for queue events");
  }
  return new QueueEvents(queueName, { connection: redis });
}

/**
 * Job progress tracking
 */
export async function updateJobProgress(
  job: Job,
  progress: number,
  message?: string
): Promise<void> {
  await job.updateProgress({ progress, message });
}

/**
 * Get all active jobs for a user
 */
export async function getUserActiveJobs(userId: number): Promise<
  Array<{
    queueName: string;
    jobId: string;
    data: any;
    progress: any;
    state: string;
  }>
> {
  const results: Array<{
    queueName: string;
    jobId: string;
    data: any;
    progress: any;
    state: string;
  }> = [];

  for (const [queueName, queue] of Array.from(queues.entries())) {
    const jobs = await queue.getJobs(["active", "waiting", "delayed"]);
    for (const job of jobs) {
      if (job.data && (job.data as any).userId === userId) {
        results.push({
          queueName,
          jobId: job.id!,
          data: job.data,
          progress: await job.getState(),
          state: await job.getState(),
        });
      }
    }
  }

  return results;
}

/**
 * Close all queues (for graceful shutdown)
 */
export async function closeAllQueues(): Promise<void> {
  for (const queue of Array.from(queues.values())) {
    await queue.close();
  }
  queues.clear();
}
