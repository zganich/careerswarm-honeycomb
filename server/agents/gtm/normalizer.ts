/**
 * Normalize raw B2B lead to DB schema and compute idempotency key for dedupe.
 */

import type { RawB2BLead, SourceChannel } from "./types";

function slug(s: string | undefined): string {
  if (!s || typeof s !== "string") return "";
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Dedupe key: prefer LinkedIn URL, else email, else name+company slug.
 */
export function idempotencyKey(lead: RawB2BLead): string | null {
  if (lead.linkedinUrl && lead.linkedinUrl.trim())
    return lead.linkedinUrl.trim();
  if (lead.email && lead.email.trim())
    return `email:${lead.email.trim().toLowerCase()}`;
  const nameCompany = `${slug(lead.name)}|${slug(lead.companyName)}`;
  if (nameCompany !== "|") return nameCompany;
  return null;
}

/**
 * Normalize raw lead for DB insert: ensure enums and required fields.
 */
export function normalizeLeadForDb(
  lead: RawB2BLead,
  defaults: { sourceChannel: SourceChannel; sourceUrl?: string }
): Record<string, unknown> {
  const key = idempotencyKey(lead);
  return {
    leadType: lead.leadType,
    name: lead.name ?? null,
    title: lead.title ?? null,
    companyName: lead.companyName ?? null,
    companyDomain: lead.companyDomain ?? null,
    linkedinUrl: lead.linkedinUrl ?? null,
    email: lead.email ?? null,
    sourceUrl: lead.sourceUrl ?? defaults.sourceUrl ?? null,
    sourceChannel: lead.sourceChannel ?? defaults.sourceChannel,
    industry: lead.industry ?? null,
    companySize: lead.companySize ?? null,
    geography: lead.geography ?? null,
    signals: lead.signals ?? null,
    vertical: lead.vertical ?? null,
    priority: "medium",
    outreachStatus: "none",
    idempotencyKey: key,
  };
}
