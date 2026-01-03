export type TenantId = string;
export type UserId = string;
export type CampaignId = string;
export type ProspectId = string;
export type DealId = string;
export type ISODateString = string;

export type ReplyClassification =
  | "positive"
  | "neutral"
  | "objection"
  | "unsubscribe"
  | "ooo"
  | "bounce";

export const DEAL_CONFIDENCE_AUTO = 0.85;
export const DEAL_CONFIDENCE_APPROVAL = 0.65;
