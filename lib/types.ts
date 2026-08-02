export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "WON" | "LOST" | "SPAM";
export const LEAD_STATUSES: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST", "SPAM"];

export type ApplicationStatus = "NEW" | "REVIEWING" | "INTERVIEWING" | "REJECTED" | "HIRED";
export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "NEW",
  "REVIEWING",
  "INTERVIEWING",
  "REJECTED",
  "HIRED",
];

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  service: string | null;
  budget: string | null;
  message: string;
  source: string | null;
  status: LeadStatus;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  createdAt: string;
};

export type Subscriber = {
  id: string;
  email: string;
  source: string | null;
  createdAt: string;
};

export type JobApplication = {
  id: string;
  jobSlug: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string | null;
  portfolioUrl: string | null;
  coverLetter: string | null;
  resumeUrl: string | null;
  status: ApplicationStatus;
  createdAt: string;
};
