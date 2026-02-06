/**
 * Lead scoring: rule-based priority/score for B2B leads.
 * Plan: posted job in last 30 days = +1, company 50–500 = +1, agency 5–50 = +1, "JD" pain = +2.
 */

import type { RawB2BLead } from "./types";

export type Priority = "high" | "medium" | "low";

export interface ScoredLead extends RawB2BLead {
  score: number;
  priority: Priority;
}

const COMPANY_SIZE_HIGH_VALUE = ["50-200", "51-200", "201-500", "100-500"];
const AGENCY_SIZE_HIGH_VALUE = ["5-50", "11-50", "6-20"];

export function scoreLead(lead: RawB2BLead): ScoredLead {
  let score = 0;
  const signals = (lead.signals ?? "").toLowerCase();
  const title = (lead.title ?? "").toLowerCase();
  const snippet = (lead.snippet ?? "").toLowerCase();
  const combined = `${signals} ${title} ${snippet}`;

  if (
    /posted.*(job|role|position)|hiring|we're hiring|open role/i.test(combined)
  )
    score += 1;
  if (/job description|jd |writing jd|write jd|job spec/i.test(combined))
    score += 2;
  const companySize = (lead.companySize ?? "").toLowerCase();
  if (COMPANY_SIZE_HIGH_VALUE.some(s => companySize.includes(s))) score += 1;
  if (
    lead.leadType === "recruiter_agency" &&
    AGENCY_SIZE_HIGH_VALUE.some(s => companySize.includes(s))
  )
    score += 1;
  if (lead.linkedinUrl) score += 1;
  if (lead.email) score += 1;

  const priority: Priority =
    score >= 4 ? "high" : score >= 2 ? "medium" : "low";
  return { ...lead, score, priority };
}

export function scoreLeads(leads: RawB2BLead[]): ScoredLead[] {
  return leads.map(scoreLead);
}
