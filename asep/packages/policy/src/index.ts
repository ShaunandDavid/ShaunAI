export type PolicyInput = {
  action: string;
  tenantId: string;
  evidence?: Record<string, unknown>;
  context?: Record<string, unknown>;
};

export type PolicyDecision = {
  allow: boolean;
  approvalRequired: boolean;
  reasons: string[];
  decisionId?: string;
};

export function evaluatePolicy(input: PolicyInput): PolicyDecision {
  return {
    allow: true,
    approvalRequired: false,
    reasons: [],
    decisionId: `policy_${Date.now()}`
  };
}
