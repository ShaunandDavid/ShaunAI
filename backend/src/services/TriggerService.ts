import { logger } from '../config/logger';

export interface Trigger {
  id: string;
  name: string;
  description?: string;
  type: 'schedule' | 'webhook' | 'event' | 'condition';
  condition: any; // JSON object defining the trigger condition
  action: any; // JSON object defining the action to take
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
}

export class TriggerService {
  private triggers: Map<string, Trigger> = new Map();

  async getAllTriggers(): Promise<Trigger[]> {
    return Array.from(this.triggers.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async createTrigger(triggerData: Omit<Trigger, 'id' | 'createdAt' | 'updatedAt' | 'triggerCount'>): Promise<Trigger> {
    const trigger: Trigger = {
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      triggerCount: 0,
      ...triggerData
    };

    this.triggers.set(trigger.id, trigger);
    logger.info(`Trigger created: ${trigger.id} - ${trigger.name}`);
    
    return trigger;
  }

  async toggleTrigger(id: string): Promise<Trigger | null> {
    const trigger = this.triggers.get(id);
    if (!trigger) {
      return null;
    }

    trigger.enabled = !trigger.enabled;
    trigger.updatedAt = new Date();
    
    this.triggers.set(id, trigger);
    logger.info(`Trigger ${trigger.enabled ? 'enabled' : 'disabled'}: ${id}`);
    
    return trigger;
  }

  async deleteTrigger(id: string): Promise<boolean> {
    const deleted = this.triggers.delete(id);
    if (deleted) {
      logger.info(`Trigger deleted: ${id}`);
    }
    return deleted;
  }

  async getTrigger(id: string): Promise<Trigger | null> {
    return this.triggers.get(id) || null;
  }

  async executeTrigger(id: string): Promise<boolean> {
    const trigger = this.triggers.get(id);
    if (!trigger || !trigger.enabled) {
      return false;
    }

    try {
      // TODO: Implement actual trigger execution logic
      logger.info(`Executing trigger: ${id} - ${trigger.name}`);
      
      trigger.lastTriggered = new Date();
      trigger.triggerCount += 1;
      trigger.updatedAt = new Date();
      
      this.triggers.set(id, trigger);
      
      return true;
    } catch (error) {
      logger.error(`Error executing trigger ${id}:`, error);
      return false;
    }
  }

  private generateId(): string {
    return `trigger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}