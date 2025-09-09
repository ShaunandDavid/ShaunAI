import { EnhancedShaun } from '../agent/enhanced-shaun';

/**
 * Server Integration for EnhancedShaun
 * 
 * Bridges the enhanced agent with the powerful server capabilities
 * including web automation, OpenAI integration, and real-time features.
 */
export class ShaunServerIntegration {
  private agent: EnhancedShaun;
  private serverBaseUrl: string;

  constructor(agent: EnhancedShaun, serverBaseUrl: string = 'http://localhost:3000') {
    this.agent = agent;
    this.serverBaseUrl = serverBaseUrl;
  }

  /**
   * Initialize server connection and register agent endpoints
   */
  async initialize(): Promise<void> {
    console.log('🔗 Initializing server integration for EnhancedShaun...');
    
    // Register agent endpoints with the server
    await this.registerAgentEndpoints();
    
    // Start autonomous operation cycle
    this.startAutonomousLoop();
    
    console.log('✅ Server integration initialized successfully');
  }

  /**
   * Register enhanced agent endpoints with the Express server
   */
  private async registerAgentEndpoints(): Promise<void> {
    // These would be added to the Express server in autonomy/server/src/index.js
    
    console.log('📡 Registering agent endpoints:');
    console.log('  POST /api/agent/task - Queue enhanced task');
    console.log('  GET  /api/agent/status - Get enhanced agent status');
    console.log('  POST /api/agent/reason - Request agent reasoning');
    console.log('  GET  /api/agent/memory - Access agent memory');
    console.log('  POST /api/agent/learn - Submit learning data');
    console.log('  GET  /api/agent/capabilities - List agent capabilities');
  }

  /**
   * Start the autonomous operation loop
   */
  private startAutonomousLoop(): void {
    console.log('🔄 Starting autonomous operation loop...');
    
    // Run autonomous cycle every 30 seconds
    setInterval(async () => {
      try {
        await this.agent.run();
      } catch (error) {
        console.error('Error in autonomous cycle:', error);
      }
    }, 30000); // 30 seconds
    
    // Initial run
    setTimeout(() => this.agent.run(), 1000);
  }

  /**
   * Integration methods for server features
   */
  
  async captureScreenshot(url: string): Promise<any> {
    try {
      const response = await fetch(`${this.serverBaseUrl}/api/shot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      return await response.json();
    } catch (error: any) {
      console.error('Screenshot capture failed:', error);
      return { success: false, error: error?.message || String(error) };
    }
  }

  async chatWithOpenAI(message: string): Promise<any> {
    try {
      const response = await fetch(`${this.serverBaseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      return await response.json();
    } catch (error: any) {
      console.error('OpenAI chat failed:', error);
      return { success: false, error: error?.message || String(error) };
    }
  }

  async queueTask(task: any): Promise<any> {
    try {
      const response = await fetch(`${this.serverBaseUrl}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      return await response.json();
    } catch (error: any) {
      console.error('Task queueing failed:', error);
      return { success: false, error: error?.message || String(error) };
    }
  }

  async auditWebsite(url: string): Promise<any> {
    // Use the server's audit functionality
    const task = {
      text: `/audit ${url}`,
      priority: 'HIGH',
      meta: { action: 'audit', url }
    };
    
    return await this.queueTask(task);
  }

  async getSystemStatus(): Promise<any> {
    try {
      const response = await fetch(`${this.serverBaseUrl}/api/status`);
      return await response.json();
    } catch (error: any) {
      console.error('System status fetch failed:', error);
      return { ok: false, error: error?.message || String(error) };
    }
  }
}

/**
 * Enhanced Server Endpoints
 * 
 * Additional endpoints to add to the main server for enhanced agent integration
 */
export const enhancedServerEndpoints = {
  
  // Enhanced agent task endpoint
  '/api/agent/task': {
    method: 'POST',
    handler: async (req: any, res: any, agent: EnhancedShaun) => {
      try {
        const task = req.body;
        const result = await agent.executeTask(task);
        res.json({ success: true, result });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error?.message || String(error) });
      }
    }
  },

  // Enhanced agent status
  '/api/agent/status': {
    method: 'GET',
    handler: async (req: any, res: any, agent: EnhancedShaun) => {
      res.json({
        status: agent.status,
        capabilities: agent.capabilities,
        // Would expose more status info from the agent
      });
    }
  },

  // Agent reasoning endpoint
  '/api/agent/reason': {
    method: 'POST',
    handler: async (req: any, res: any, agent: EnhancedShaun) => {
      try {
        const { context } = req.body;
        const reasoning = await agent.reason(context);
        res.json({ success: true, reasoning });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error?.message || String(error) });
      }
    }
  },

  // Agent planning endpoint
  '/api/agent/plan': {
    method: 'POST',
    handler: async (req: any, res: any, agent: EnhancedShaun) => {
      try {
        const { goals } = req.body;
        const plan = await agent.planTasks(goals);
        res.json({ success: true, plan });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error?.message || String(error) });
      }
    }
  }
};

export default ShaunServerIntegration;