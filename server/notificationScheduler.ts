import { getDb } from "./db";
import { applications } from "../drizzle/schema";
import { eq, and, lte, gte, isNull, or } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

interface NotificationConfig {
  followUpDays: number[]; // Days after submission to send follow-up reminders
  interviewPrepHours: number; // Hours before interview to send prep reminder
}

const DEFAULT_CONFIG: NotificationConfig = {
  followUpDays: [3, 7, 14], // 3 days, 1 week, 2 weeks
  interviewPrepHours: 24, // 1 day before
};

/**
 * Check and send follow-up reminders for applications
 * Run this periodically (e.g., every hour via cron or interval)
 */
export async function processFollowUpReminders() {
  const db = await getDb();
  if (!db) return;

  const now = new Date();
  
  for (const days of DEFAULT_CONFIG.followUpDays) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() - days);
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // Find applications submitted exactly N days ago that are still in "submitted" status
    const applicationsToRemind = await db
      .select()
      .from(applications)
      .where(
        and(
          eq(applications.status, "submitted"),
          gte(applications.submittedAt, targetDate),
          lte(applications.submittedAt, nextDay)
        )
      );
    
    for (const app of applicationsToRemind) {
      try {
        // Send notification
        const delivered = await notifyOwner({
          title: `Follow-up Reminder: ${days} days since application`,
          content: `It's been ${days} days since you applied to a position. Consider sending a follow-up email to show continued interest.`,
        });
        
        if (delivered) {
          console.log(`[Notification] Sent ${days}-day follow-up reminder for application ${app.id}`);
        }
      } catch (err) {
        console.error(`[Notification] Failed to send follow-up for application ${app.id}:`, err);
      }
    }
  }
}

/**
 * Check and send interview prep reminders
 * Run this periodically (e.g., every hour)
 */
export async function processInterviewPrepReminders() {
  const db = await getDb();
  if (!db) return;

  const now = new Date();
  const reminderWindow = new Date(now);
  reminderWindow.setHours(reminderWindow.getHours() + DEFAULT_CONFIG.interviewPrepHours);
  
  const nextWindow = new Date(reminderWindow);
  nextWindow.setHours(nextWindow.getHours() + 1);
  
  // Find applications with interviews scheduled (status = interview_scheduled)
  const applicationsToRemind = await db
    .select()
    .from(applications)
    .where(
      or(
        eq(applications.status, "interview_scheduled"),
        eq(applications.status, "screening")
      )
    );
  
  for (const app of applicationsToRemind) {
    try {
      // Parse interviewDates JSON array
      const interviewDates = app.interviewDates as string[] | null;
      if (!interviewDates || interviewDates.length === 0) continue;
      
      // Get the next upcoming interview
      const upcomingInterviews = interviewDates
        .map(d => new Date(d))
        .filter(d => d > now)
        .sort((a, b) => a.getTime() - b.getTime());
      
      if (upcomingInterviews.length === 0) continue;
      const interviewDate = upcomingInterviews[0];
      
      // Check if interview is in the reminder window (24-25 hours from now)
      if (interviewDate < reminderWindow || interviewDate > nextWindow) continue;
      
      // Send notification
      const delivered = await notifyOwner({
        title: "Interview Prep Reminder",
        content: `Your interview is tomorrow at ${interviewDate.toLocaleString()}! Review your achievements, research the company, and prepare questions to ask.`,
      });
      
      if (delivered) {
        console.log(`[Notification] Sent interview prep reminder for application ${app.id}`);
      }
    } catch (err) {
      console.error(`[Notification] Failed to send interview prep for application ${app.id}:`, err);
    }
  }
}

/**
 * Start the notification scheduler
 * Runs checks every hour
 */
export function startNotificationScheduler() {
  console.log("[Notification] Starting scheduler (database-backed)");
  
  // Run immediately on start
  processFollowUpReminders().catch(console.error);
  processInterviewPrepReminders().catch(console.error);
  
  // Then run every hour
  const HOUR_MS = 60 * 60 * 1000;
  
  setInterval(() => {
    processFollowUpReminders().catch(console.error);
  }, HOUR_MS);
  
  setInterval(() => {
    processInterviewPrepReminders().catch(console.error);
  }, HOUR_MS);
  
  console.log("[Notification] Scheduler started (checks every hour)");
}

/**
 * Auto-schedule reminders when application status changes to "submitted"
 */
export async function onApplicationSubmitted(
  applicationId: number,
  submittedAt: Date
) {
  console.log(`[Notification] Application ${applicationId} submitted, reminders will be sent at ${DEFAULT_CONFIG.followUpDays.join(", ")} days`);
  // Reminders are handled automatically by the scheduler
  // No need to create individual jobs
}

/**
 * Auto-schedule interview prep reminder when interview is scheduled
 */
export async function onInterviewScheduled(
  applicationId: number,
  interviewDate: Date
) {
  const reminderTime = new Date(interviewDate);
  reminderTime.setHours(reminderTime.getHours() - DEFAULT_CONFIG.interviewPrepHours);
  
  console.log(`[Notification] Interview scheduled for application ${applicationId}, reminder will be sent at ${reminderTime.toLocaleString()}`);
  // Reminder is handled automatically by the scheduler
}
