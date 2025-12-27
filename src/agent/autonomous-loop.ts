import Puppeteer from 'puppeteer';

/**
 * Autonomous Agent Loop - Operator-Level Browser Automation
 * 
 * This is the core vision-action loop that makes ShaunAI truly autonomous.
 * Screenshot → Vision LLM → Action → Verify → Repeat
 */

interface AgentState {
  task: string;
  currentStep: number;
  maxSteps: number;
  history: ActionRecord[];
  status: 'running' | 'completed' | 'failed' | 'needs_human';
}

interface ActionRecord {
  step: number;
  screenshot: string;
  reasoning: string;
  action: AgentAction;
  result: string;
  timestamp: Date;
}

interface AgentAction {
  type: 'click' | 'type' | 'scroll' | 'navigate' | 'wait' | 'done' | 'ask_human';
  selector?: string;
  text?: string;
  url?: string;
  x?: number;
  y?: number;
  direction?: 'up' | 'down';
  reason?: string;
}

interface VisionResponse {
  observation: string;
  reasoning: string;
  nextAction: AgentAction;
  confidence: number;
  taskProgress: number;
}

export class AutonomousAgent {
  private browser: Puppeteer.Browser | null = null;
  private page: Puppeteer.Page | null = null;
  private serverUrl: string;
  private state: AgentState;

  constructor(serverUrl: string = 'http://127.0.0.1:5000') {
    this.serverUrl = serverUrl;
    this.state = {
      task: '',
      currentStep: 0,
      maxSteps: 50,
      history: [],
      status: 'running'
    };
  }

  async initialize(): Promise<void> {
    this.browser = await Puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1280, height: 800 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    console.log('[AGENT] Browser initialized');
  }

  async shutdown(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  /**
   * Core vision call - sends screenshot to LLM, gets next action
   */
  private async analyzeAndDecide(screenshotBase64: string): Promise<VisionResponse> {
    const systemPrompt = `You are an autonomous browser agent. You see a screenshot and decide the next action to complete the user's task.

TASK: ${this.state.task}

HISTORY (last 5 actions):
${this.state.history.slice(-5).map(h => `Step ${h.step}: ${h.action.type} - ${h.reasoning}`).join('\n')}

Respond in JSON only:
{
  "observation": "What you see on screen",
  "reasoning": "Why you're taking this action",
  "nextAction": {
    "type": "click|type|scroll|navigate|wait|done|ask_human",
    "selector": "CSS selector if clicking/typing",
    "x": number (if clicking by coordinates),
    "y": number (if clicking by coordinates),
    "text": "text to type if typing",
    "url": "url if navigating",
    "direction": "up|down if scrolling",
    "reason": "why asking human if ask_human"
  },
  "confidence": 0.0-1.0,
  "taskProgress": 0-100
}

RULES:
- If you can't find an element, try scrolling
- If stuck for 3+ actions, ask_human
- When task is complete, use type: "done"
- Prefer selectors over coordinates when possible
- If a login/captcha blocks you, ask_human`;

    const response = await fetch(`${this.serverUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: `Step ${this.state.currentStep + 1}. Analyze and decide next action.` },
              { type: 'image_url', image_url: { url: `data:image/png;base64,${screenshotBase64}` } }
            ]
          }
        ],
        max_tokens: 1000
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in LLM response');
    
    return JSON.parse(jsonMatch[0]) as VisionResponse;
  }

  /**
   * Execute a single browser action
   */
  private async executeAction(action: AgentAction): Promise<string> {
    if (!this.page) throw new Error('Browser not initialized');

    try {
      switch (action.type) {
        case 'click':
          if (action.selector) {
            await this.page.waitForSelector(action.selector, { timeout: 5000 });
            await this.page.click(action.selector);
            return `Clicked: ${action.selector}`;
          } else if (action.x !== undefined && action.y !== undefined) {
            await this.page.mouse.click(action.x, action.y);
            return `Clicked coordinates: (${action.x}, ${action.y})`;
          }
          return 'Click failed: no target specified';

        case 'type':
          if (action.selector && action.text) {
            await this.page.waitForSelector(action.selector, { timeout: 5000 });
            await this.page.click(action.selector);
            await this.page.keyboard.type(action.text, { delay: 50 });
            return `Typed "${action.text}" into ${action.selector}`;
          }
          return 'Type failed: missing selector or text';

        case 'scroll':
          const scrollAmount = action.direction === 'up' ? -300 : 300;
          await this.page.evaluate((y) => window.scrollBy(0, y), scrollAmount);
          return `Scrolled ${action.direction}`;

        case 'navigate':
          if (action.url) {
            await this.page.goto(action.url, { waitUntil: 'networkidle2', timeout: 30000 });
            return `Navigated to: ${action.url}`;
          }
          return 'Navigate failed: no URL';

        case 'wait':
          await new Promise(r => setTimeout(r, 2000));
          return 'Waited 2 seconds';

        case 'done':
          this.state.status = 'completed';
          return 'Task completed';

        case 'ask_human':
          this.state.status = 'needs_human';
          return `Needs human: ${action.reason}`;

        default:
          return `Unknown action: ${action.type}`;
      }
    } catch (err: any) {
      return `Action failed: ${err.message}`;
    }
  }

  /**
   * Take screenshot and return base64
   */
  private async captureScreen(): Promise<string> {
    if (!this.page) throw new Error('Browser not initialized');
    const buffer = await this.page.screenshot({ encoding: 'base64' });
    return buffer as string;
  }

  /**
   * THE MAIN AUTONOMOUS LOOP
   */
  async run(task: string, startUrl?: string): Promise<AgentState> {
    this.state.task = task;
    this.state.status = 'running';
    this.state.currentStep = 0;
    this.state.history = [];

    console.log(`[AGENT] Starting task: ${task}`);

    if (!this.page) await this.initialize();

    if (startUrl) {
      await this.page!.goto(startUrl, { waitUntil: 'networkidle2' });
      console.log(`[AGENT] Navigated to: ${startUrl}`);
    }

    // Core autonomous loop
    while (this.state.status === 'running' && this.state.currentStep < this.state.maxSteps) {
      this.state.currentStep++;
      console.log(`\n[AGENT] === Step ${this.state.currentStep} ===`);

      try {
        // 1. Screenshot
        const screenshot = await this.captureScreen();
        console.log('[AGENT] Screenshot captured');

        // 2. Analyze and decide
        const decision = await this.analyzeAndDecide(screenshot);
        console.log(`[AGENT] Observation: ${decision.observation}`);
        console.log(`[AGENT] Reasoning: ${decision.reasoning}`);
        console.log(`[AGENT] Action: ${decision.nextAction.type}`);
        console.log(`[AGENT] Progress: ${decision.taskProgress}%`);

        // 3. Execute action
        const result = await this.executeAction(decision.nextAction);
        console.log(`[AGENT] Result: ${result}`);

        // 4. Record history
        this.state.history.push({
          step: this.state.currentStep,
          screenshot: screenshot.substring(0, 100) + '...',
          reasoning: decision.reasoning,
          action: decision.nextAction,
          result: result,
          timestamp: new Date()
        });

        // 5. Small delay to let page update
        await new Promise(r => setTimeout(r, 1000));

      } catch (err: any) {
        console.error(`[AGENT] Step failed: ${err.message}`);
        if (this.state.currentStep > 3) {
          const recentFailures = this.state.history.slice(-3).filter(h => h.result.includes('failed'));
          if (recentFailures.length >= 3) {
            this.state.status = 'failed';
            console.log('[AGENT] Too many consecutive failures');
          }
        }
      }
    }

    if (this.state.currentStep >= this.state.maxSteps) {
      this.state.status = 'failed';
      console.log('[AGENT] Max steps reached');
    }

    console.log(`\n[AGENT] Final status: ${this.state.status}`);
    return this.state;
  }
}

/**
 * Example usage and test runner
 */
async function main() {
  const agent = new AutonomousAgent('http://127.0.0.1:5000');
  
  try {
    const result = await agent.run(
      'Go to Google and search for "XenTeck AI automation" and tell me what you find',
      'https://google.com'
    );
    
    console.log('\n=== FINAL REPORT ===');
    console.log(`Status: ${result.status}`);
    console.log(`Steps taken: ${result.currentStep}`);
    console.log(`History:`, result.history.map(h => ({
      step: h.step,
      action: h.action.type,
      result: h.result
    })));
    
  } finally {
    await agent.shutdown();
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { main };
