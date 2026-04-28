export type LeadStatus = "New" | "Contacted" | "Converted" | "Lost";
export const LEAD_STATUSES: LeadStatus[] = ["New", "Contacted", "Converted", "Lost"];

export type LeadTag = "Hot" | "Warm" | "Cold";
export const LEAD_TAGS: LeadTag[] = ["Hot", "Warm", "Cold"];

export type LeadPriority = "High" | "Medium" | "Low";
export const LEAD_PRIORITIES: LeadPriority[] = ["High", "Medium", "Low"];

export type LeadSource = "Website" | "Instagram" | "Referral" | "Social Media" | "Email" | "Cold Call" | "Event" | "Other";
export const LEAD_SOURCES: LeadSource[] = ["Website", "Instagram", "Referral", "Social Media", "Email", "Cold Call", "Event", "Other"];

export type ActivityEntry = {
  id: string;
  at: string;
  message: string;
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: LeadStatus;
  tag: LeadTag;
  priority: LeadPriority;
  value: number; // mock revenue
  followUpAt?: string | null;
  notes: string;
  createdAt: string;
  activity: ActivityEntry[];
};
