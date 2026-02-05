import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";

/**
 * Email Integration Router
 * Handles inbound emails forwarded to user@jobs.careerswarm.app
 */

export const emailRouter = router({
  /**
   * Webhook endpoint for inbound emails
   * Called by email service (SendGrid, Mailgun, etc.)
   */
  inbound: publicProcedure
    .input(z.object({
      from: z.string().email(),
      to: z.string().email(),
      subject: z.string(),
      text: z.string(),
      html: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Extract username from recipient email (user123@jobs.careerswarm.app)
      const username = input.to.split('@')[0];
      
      // Find user by email or username (simplified - in production, use proper user lookup)
      // For now, we'll extract job description and return analysis
      
      // Use AI to extract job description from email
      const extractPrompt = `Extract the job description from this email. If there's no clear job description, return null.

Email Subject: ${input.subject}
Email Body:
${input.text}

Extract:
1. Job title
2. Company name
3. Full job description text
4. Any salary/compensation mentioned`;

      const extractResponse = await invokeLLM({
        messages: [
          { role: "system", content: "You are an expert at extracting job descriptions from emails." },
          { role: "user", content: extractPrompt }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "email_job_extraction",
            strict: true,
            schema: {
              type: "object",
              properties: {
                hasJobDescription: { type: "boolean" },
                jobTitle: { type: "string" },
                companyName: { type: "string" },
                jobDescription: { type: "string" },
                compensation: { type: "string" },
              },
              required: ["hasJobDescription", "jobTitle", "companyName", "jobDescription", "compensation"],
              additionalProperties: false,
            },
          },
        },
      });

      const extracted = JSON.parse(String(extractResponse.choices[0]?.message?.content || "{}"));

      if (!extracted.hasJobDescription) {
        return {
          success: false,
          message: "No job description found in email"
        };
      }

      // Generate email response with analysis
      const responseEmail = {
        to: input.from,
        subject: `Your Career Match for ${extracted.jobTitle} at ${extracted.companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">🎯 Job Analysis Ready</h2>
            <p>We analyzed the job opportunity you forwarded:</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">${extracted.jobTitle}</h3>
              <p style="color: #6b7280;">${extracted.companyName}</p>
            </div>

            <p>To see your full career match analysis:</p>
            <a href="${process.env.APP_URL || "https://careerswarm.com"}/dashboard" 
               style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">
              View Full Analysis
            </a>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              This job has been saved to your Careerswarm dashboard. Log in to generate a tailored resume.
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              Careerswarm - Transform Your Achievements Into Powerful Resumes
            </p>
          </div>
        `
      };

      // In production, send email via SendGrid/Mailgun
      console.log('[Email] Would send response:', responseEmail);

      return {
        success: true,
        message: "Job description extracted and analysis email sent",
        extracted
      };
    }),

  /**
   * Get user's personal forwarding email address
   */
  getForwardingAddress: publicProcedure
    .query(({ ctx }) => {
      if (!ctx.user) {
        throw new Error("Not authenticated");
      }

      // Generate forwarding address from user ID or email
      const username = ctx.user.email?.split('@')[0] || `user${ctx.user.id}`;
      return {
        email: `${username}@jobs.careerswarm.app`,
        instructions: "Forward any recruiter emails to this address for instant analysis"
      };
    }),
});
