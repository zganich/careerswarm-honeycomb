/**
 * GTM agent types: B2B lead shape used by RecruiterFinderAgent and pipeline.
 */

export type LeadType =
  | "recruiter_inhouse"
  | "recruiter_agency"
  | "hr_leader"
  | "hiring_manager"
  | "startup"
  | "company";

export type SourceChannel =
  | "linkedin"
  | "reddit"
  | "twitter"
  | "company_site"
  | "job_board"
  | "newsletter"
  | "event";

export interface RawB2BLead {
  leadType: LeadType;
  name?: string;
  title?: string;
  companyName?: string;
  companyDomain?: string;
  linkedinUrl?: string;
  email?: string;
  sourceUrl?: string;
  sourceChannel: SourceChannel;
  industry?: string;
  companySize?: string;
  geography?: string;
  signals?: string;
  vertical?: string;
  snippet?: string;
}

export interface RecruiterFinderInput {
  channel: SourceChannel;
  vertical?: string;
  query?: string;
  rawText?: string; // e.g. Reddit post/comment text, pasted LinkedIn export
}

export interface RecruiterFinderOutput {
  leads: RawB2BLead[];
}
