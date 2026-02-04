/**
 * In-memory progress store for resume processing (processResumes + parseResumes).
 * Used by SSE endpoint so the client can show real-time progress.
 */

export type ResumeProgressPhase = "idle" | "processing" | "parsing" | "done" | "error";

export interface ResumeProgress {
  phase: ResumeProgressPhase;
  current?: number;
  total?: number;
  message?: string;
  updatedAt: number;
}

const store = new Map<number, ResumeProgress>();

export function setResumeProgress(
  userId: number,
  data: Omit<ResumeProgress, "updatedAt">
): void {
  store.set(userId, {
    ...data,
    updatedAt: Date.now(),
  });
}

export function getResumeProgress(userId: number): ResumeProgress | undefined {
  return store.get(userId);
}

export function clearResumeProgress(userId: number): void {
  store.delete(userId);
}
