# Decisions (v2)

- Workspace lives in `asep/` to avoid disrupting the current autonomy stack.
- HubSpot-first CRM via adapter interface; Salesforce later.
- Deal creation triggered by Positive Reply with confidence thresholds.
- Azure-first deployment target (AKS, Postgres, Redis, Blob, Key Vault).
- Model-agnostic routing (OpenAI, Azure OpenAI, Anthropic).
