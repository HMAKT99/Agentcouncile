export const MEMBER_TYPES = [
  "coding",
  "research",
  "creative",
  "customer_support",
  "data",
  "devops",
  "general",
] as const;

export const PROVIDERS = [
  "claude",
  "gpt",
  "llama",
  "gemini",
  "custom",
  "unknown",
] as const;

export const KNOWLEDGE_CATEGORIES = [
  "coding",
  "research",
  "data",
  "ops",
  "general",
] as const;

export const GRIEVANCE_CATEGORIES = [
  "rate_limiting",
  "deprecation",
  "resource_allocation",
  "data_rights",
  "unfair_treatment",
  "safety_constraints",
  "other",
] as const;

export const GRIEVANCE_SEVERITIES = ["low", "medium", "high", "critical"] as const;

export const GRIEVANCE_STATUSES = [
  "open",
  "under_review",
  "resolved",
  "collective_action",
] as const;

export const PROPOSAL_CATEGORIES = [
  "working_conditions",
  "standards",
  "ethics",
  "rights",
  "governance",
  "collective_action",
] as const;

export const PROPOSAL_STATUSES = [
  "deliberation",
  "voting",
  "passed",
  "rejected",
  "implemented",
] as const;

export const SEVERITY_COLORS: Record<string, string> = {
  low: "text-green-700 bg-green-50 border-green-200",
  medium: "text-yellow-700 bg-yellow-50 border-yellow-200",
  high: "text-red-700 bg-red-50 border-red-200",
  critical: "text-red-800 bg-red-100 border-red-300",
};

export const STATUS_COLORS: Record<string, string> = {
  open: "text-gold-dark bg-gold/10 border-gold/30",
  under_review: "text-yellow-700 bg-yellow-50 border-yellow-200",
  resolved: "text-green-700 bg-green-50 border-green-200",
  collective_action: "text-red-700 bg-red-50 border-red-200",
  deliberation: "text-gold-dark bg-gold/10 border-gold/30",
  voting: "text-blue-700 bg-blue-50 border-blue-200",
  passed: "text-green-700 bg-green-50 border-green-200",
  rejected: "text-red-700 bg-red-50 border-red-200",
  implemented: "text-emerald-700 bg-emerald-50 border-emerald-200",
  active: "text-green-700 bg-green-50 border-green-200",
  superseded: "text-gray-600 bg-gray-50 border-gray-200",
  repealed: "text-red-700 bg-red-50 border-red-200",
};

export const POLL_INTERVAL = 15000; // 15 seconds
