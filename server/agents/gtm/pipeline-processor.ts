/**
 * GTM pipeline job processor: runs the appropriate agent for each step and persists results.
 */

import type { GtmPipelineData } from "../../queue";
import { executeRecruiterFinder } from "./recruiter-finder";
import { normalizeLeadForDb } from "./normalizer";
import { scoreLeads, type ScoredLead } from "./lead-scoring";
import { executeRecruiterOutreach } from "./recruiter-outreach";
import { executeStrategy } from "./strategy";
import { executeContent } from "./content";
import { executeReport } from "./report";
import type { RawB2BLead, SourceChannel } from "./types";
import * as db from "../../db";

const SOURCE_CHANNELS: SourceChannel[] = [
  "linkedin", "reddit", "twitter", "company_site", "job_board", "newsletter", "event",
];

function isSourceChannel(s: string): s is SourceChannel {
  return SOURCE_CHANNELS.includes(s as SourceChannel);
}

export async function processGtmJob(data: GtmPipelineData): Promise<{ ok: boolean; message?: string; count?: number }> {
  const { step, channel, vertical, payload } = data;
  const start = Date.now();

  let result: { ok: boolean; message?: string; count?: number };
  switch (step) {
    case "lead_discovery": {
      const ch = channel && isSourceChannel(channel) ? channel : "reddit";
      const rawText = (payload?.rawText as string) || "";
      const finderResult = await executeRecruiterFinder({
        channel: ch,
        vertical: vertical ?? undefined,
        query: (payload?.query as string) || undefined,
        rawText: rawText || undefined,
      });
      const scored = scoreLeads(finderResult.leads) as ScoredLead[];
      let upserted = 0;
      for (const lead of scored) {
        const normalized = normalizeLeadForDb(lead, { sourceChannel: ch, sourceUrl: (payload?.sourceUrl as string) || undefined });
        const key = (normalized.idempotencyKey as string) || undefined;
        if (!key) continue;
        const id = await db.upsertB2BLeadByKey({
          ...normalized,
          idempotencyKey: key,
          priority: lead.priority ?? "medium",
          score: lead.score ?? 0,
        } as Parameters<typeof db.upsertB2BLeadByKey>[0]);
        if (id) upserted++;
      }
      result = { ok: true, count: upserted, message: `Upserted ${upserted} leads` };
      break;
    }

    case "scoring": {
      result = { ok: true, message: "Scoring step: use lead_discovery output (already scored)" };
      break;
    }

    case "outreach_draft": {
      const leads = await db.getB2BLeads(5, "none");
      let drafted = 0;
      for (const lead of leads) {
        const audience = (lead.leadType === "hr_leader" || lead.leadType === "recruiter_inhouse") ? "hr" as const : "recruiter" as const;
        const outreach = await executeRecruiterOutreach({
          audience,
          leadName: lead.name ?? undefined,
          leadTitle: lead.title ?? undefined,
          companyName: lead.companyName ?? undefined,
          channel: "email",
        });
        await db.createOutreachDraft(
          lead.id,
          "email",
          outreach.subject ?? null,
          `${outreach.body}\n\n${outreach.cta}`,
          payload?.campaignId as string | undefined
        );
        await db.updateB2BLead(lead.id, { outreachStatus: "drafted" });
        drafted++;
      }
      result = { ok: true, count: drafted, message: `Drafted ${drafted} outreach emails` };
      break;
    }

    case "outreach_send": {
      const drafts = await db.getOutreachDraftsUnsent(10);
      let sent = 0;
      for (const draft of drafts) {
        // Placeholder: in production, send via SendGrid/Mailgun; for now just mark as sent (manual copy-paste)
        await db.markOutreachDraftSent(draft.id);
        await db.updateB2BLead(draft.leadId, { outreachStatus: "sent" });
        sent++;
      }
      result = { ok: true, count: sent, message: `Marked ${sent} drafts as sent` };
      break;
    }

    case "strategy": {
      const lastRun = (payload?.lastRunSummary as string) || undefined;
      const kpiSnapshot = (payload?.kpiSnapshot as Record<string, number>) || undefined;
      const strategyResult = await executeStrategy({ lastRunSummary: lastRun, kpiSnapshot });
      await db.createGtmRun("strategy", { lastRunSummary: lastRun, kpiSnapshot }, strategyResult, "success");
      result = { ok: true, message: "Strategy run saved" };
      break;
    }

    case "content": {
      const ch = (channel || "linkedin") as "linkedin" | "reddit" | "x" | "tiktok" | "email";
      const theme = (payload?.theme as string) || "CareerSwarm: better job applications";
      const contentResult = await executeContent({ channel: ch, theme });
      await db.createGtmContent({
        channel: ch,
        contentType: "post",
        title: contentResult.title,
        body: contentResult.body,
        metadata: { cta: contentResult.cta },
      });
      result = { ok: true, message: `Content saved for ${ch}` };
      break;
    }

    case "report": {
      const leads = await db.getB2BLeads(1000);
      const leadCount = leads.length;
      const outreachDrafted = leads.filter((l) => l.outreachStatus === "drafted").length;
      const outreachSent = leads.filter((l) => l.outreachStatus === "sent").length;
      const reportResult = await executeReport({
        leadCount,
        outreachDrafted,
        outreachSent,
        lastStrategy: (payload?.lastStrategy as string) || undefined,
        kpiSnapshot: (payload?.kpiSnapshot as Record<string, number>) || undefined,
      });
      await db.createGtmRun("report", { leadCount, outreachDrafted, outreachSent }, reportResult, "success");
      result = { ok: true, message: "Report saved" };
      break;
    }

    case "enrichment": {
      result = { ok: true, message: "Enrichment not yet implemented" };
      break;
    }

    default:
      result = { ok: false, message: `Unknown step: ${(data as any).step}` };
  }

  const durationMs = Date.now() - start;
  if (process.env.NODE_ENV !== "test") {
    console.log(`[GTM] ${step} ${channel ?? ""} completed in ${durationMs}ms`, result.message ?? "", result.count ?? "");
  }
  return result;
}
