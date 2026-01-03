import { Client } from "@hubspot/api-client";
import type { CrmConnectResult, CrmExternalId, CrmProvider } from "@shaunai/crm";

export class HubSpotCrmProvider implements CrmProvider {
  private client: Client;

  constructor(accessToken?: string) {
    this.client = new Client({ accessToken });
  }

  async connect(_tenantId: string): Promise<CrmConnectResult> {
    throw new Error("HubSpot connect not implemented");
  }

  async exchangeCodeForToken(_tenantId: string, _code: string): Promise<void> {
    throw new Error("HubSpot token exchange not implemented");
  }

  async refreshTokenIfNeeded(_tenantId: string): Promise<void> {
    return;
  }

  async upsertCompany(
    _tenantId: string,
    _company: { domain: string; name?: string; website?: string }
  ): Promise<CrmExternalId> {
    throw new Error("HubSpot upsertCompany not implemented");
  }

  async upsertContact(
    _tenantId: string,
    _contact: {
      email: string;
      firstName?: string;
      lastName?: string;
      title?: string;
      companyDomain?: string;
    }
  ): Promise<CrmExternalId> {
    throw new Error("HubSpot upsertContact not implemented");
  }

  async logEmail(
    _tenantId: string,
    _payload: {
      contactExternalId: string;
      dealExternalId?: string;
      subject: string;
      body: string;
      direction: "inbound" | "outbound";
      sentAt: string;
      messageId: string;
    }
  ): Promise<void> {
    throw new Error("HubSpot logEmail not implemented");
  }

  async logEngagement(
    _tenantId: string,
    _payload: {
      type: "EMAIL" | "NOTE";
      contactExternalId: string;
      dealExternalId?: string;
      subject?: string;
      body: string;
      occurredAt: string;
    }
  ): Promise<void> {
    throw new Error("HubSpot logEngagement not implemented");
  }

  async logMeeting(
    _tenantId: string,
    _payload: {
      contactExternalId: string;
      dealExternalId?: string;
      title: string;
      startAt: string;
      endAt: string;
      attendees: string[];
    }
  ): Promise<void> {
    throw new Error("HubSpot logMeeting not implemented");
  }

  async createTask(
    _tenantId: string,
    _payload: {
      contactExternalId: string;
      dealExternalId?: string;
      title: string;
      dueAt?: string;
      note?: string;
    }
  ): Promise<void> {
    throw new Error("HubSpot createTask not implemented");
  }

  async suppress(
    _tenantId: string,
    _payload: { email: string; reason: string }
  ): Promise<void> {
    throw new Error("HubSpot suppress not implemented");
  }

  async findDeal(
    _tenantId: string,
    _payload: { contactExternalId?: string; companyExternalId?: string; campaignId?: string }
  ): Promise<CrmExternalId | null> {
    return null;
  }

  async createDeal(
    _tenantId: string,
    _payload: {
      name: string;
      pipelineId: string;
      stageId: string;
      amount?: number;
      closeDate?: string;
      source?: string;
    }
  ): Promise<CrmExternalId> {
    throw new Error("HubSpot createDeal not implemented");
  }

  async updateDealStage(
    _tenantId: string,
    _payload: { dealExternalId: string; stageId: string }
  ): Promise<void> {
    throw new Error("HubSpot updateDealStage not implemented");
  }

  async associateDealToContact(
    _tenantId: string,
    _payload: { dealExternalId: string; contactExternalId: string }
  ): Promise<void> {
    throw new Error("HubSpot associateDealToContact not implemented");
  }

  async associateDealToCompany(
    _tenantId: string,
    _payload: { dealExternalId: string; companyExternalId: string }
  ): Promise<void> {
    throw new Error("HubSpot associateDealToCompany not implemented");
  }
}
