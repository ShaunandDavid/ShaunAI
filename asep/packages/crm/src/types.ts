export type CrmProviderKey = "hubspot" | "salesforce";

export type CrmConnectResult = {
  authUrl: string;
};

export type CrmExternalId = {
  externalId: string;
};

export type CrmProvider = {
  connect(tenantId: string): Promise<CrmConnectResult>;
  exchangeCodeForToken(tenantId: string, code: string): Promise<void>;
  refreshTokenIfNeeded(tenantId: string): Promise<void>;
  upsertCompany(
    tenantId: string,
    company: { domain: string; name?: string; website?: string }
  ): Promise<CrmExternalId>;
  upsertContact(
    tenantId: string,
    contact: { email: string; firstName?: string; lastName?: string; title?: string; companyDomain?: string }
  ): Promise<CrmExternalId>;
  logEmail(
    tenantId: string,
    payload: {
      contactExternalId: string;
      dealExternalId?: string;
      subject: string;
      body: string;
      direction: "inbound" | "outbound";
      sentAt: string;
      messageId: string;
    }
  ): Promise<void>;
  logEngagement(
    tenantId: string,
    payload: {
      type: "EMAIL" | "NOTE";
      contactExternalId: string;
      dealExternalId?: string;
      subject?: string;
      body: string;
      occurredAt: string;
    }
  ): Promise<void>;
  logMeeting(
    tenantId: string,
    payload: {
      contactExternalId: string;
      dealExternalId?: string;
      title: string;
      startAt: string;
      endAt: string;
      attendees: string[];
    }
  ): Promise<void>;
  createTask(
    tenantId: string,
    payload: {
      contactExternalId: string;
      dealExternalId?: string;
      title: string;
      dueAt?: string;
      note?: string;
    }
  ): Promise<void>;
  suppress(tenantId: string, payload: { email: string; reason: string }): Promise<void>;
  findDeal(
    tenantId: string,
    payload: { contactExternalId?: string; companyExternalId?: string; campaignId?: string }
  ): Promise<CrmExternalId | null>;
  createDeal(
    tenantId: string,
    payload: {
      name: string;
      pipelineId: string;
      stageId: string;
      amount?: number;
      closeDate?: string;
      source?: string;
    }
  ): Promise<CrmExternalId>;
  updateDealStage(
    tenantId: string,
    payload: { dealExternalId: string; stageId: string }
  ): Promise<void>;
  associateDealToContact(
    tenantId: string,
    payload: { dealExternalId: string; contactExternalId: string }
  ): Promise<void>;
  associateDealToCompany(
    tenantId: string,
    payload: { dealExternalId: string; companyExternalId: string }
  ): Promise<void>;
};
