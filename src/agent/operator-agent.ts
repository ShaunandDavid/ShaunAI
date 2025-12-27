/**
 * ShaunAI Operator Agent - Chat-Driven Browser Automation
 * 
 * YOU talk to it, browser pops up, you WATCH it work, results come back to chat.
 */

import Puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

// Windows Chrome path
const CHROME_WIN = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

interface OperatorResult {
  success: boolean;
  message: string;
  data?: any;
  screenshot?: string;
  error?: string;
}

export class OperatorAgent {
  private browser: Puppeteer.Browser | null = null;
  private page: Puppeteer.Page | null = null;
  private serverUrl: string;
  private artifactsDir: string;

  constructor(serverUrl: string = 'http://127.0.0.1:5000') {
    this.serverUrl = serverUrl;
    this.artifactsDir = path.resolve(process.cwd(), 'artifacts');
    fs.mkdirSync(this.artifactsDir, { recursive: true });
  }

  /**
   * Launch visible browser - YOU CAN WATCH IT
   */
  async launch(): Promise<void> {
    if (this.browser) return;

    const executablePath = process.platform === 'win32' ? CHROME_WIN : undefined;

    this.browser = await Puppeteer.launch({
      headless: false,  // VISIBLE - you watch it work
      defaultViewport: { width: 1366, height: 768 },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--start-maximized'
      ],
      executablePath
    });

    this.page = await this.browser.newPage();
    console.log('[OPERATOR] Browser launched - watching mode');
  }

  /**
   * Close browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  /**
   * Take screenshot and save it
   */
  async screenshot(label?: string): Promise<string> {
    if (!this.page) throw new Error('Browser not launched');

    const today = new Date().toISOString().slice(0, 10);
    const timestamp = Date.now();
    const dir = path.join(this.artifactsDir, today);
    fs.mkdirSync(dir, { recursive: true });

    const filename = label ? `${label}-${timestamp}.png` : `shot-${timestamp}.png`;
    const filepath = path.join(dir, filename);

    await this.page.screenshot({ path: filepath, fullPage: true });
    return `/artifacts/${today}/${filename}`;
  }

  /**
   * Call GPT-4o Vision to analyze and decide
   */
  private async askVision(task: string, screenshotBase64: string): Promise<{
    observation: string;
    action: string;
    selector?: string;
    text?: string;
    url?: string;
    done: boolean;
    answer?: string;
  }> {
    const response = await fetch(`${this.serverUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are ShaunAI's browser operator. You see a screenshot and help complete the user's task.

TASK: ${task}

Respond in JSON only:
{
  "observation": "What you see on screen",
  "action": "click|type|scroll|navigate|wait|done",
  "selector": "CSS selector if clicking/typing",
  "text": "text to type if typing",
  "url": "url if navigating",
  "done": true/false,
  "answer": "If done, the answer/result to tell the user"
}

RULES:
- When task is complete, set done: true and provide answer
- Be specific with selectors
- If you need to scroll to find something, do it
- Keep it simple and direct`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze the screen and decide next action.' },
              { type: 'image_url', image_url: { url: `data:image/png;base64,${screenshotBase64}` } }
            ]
          }
        ],
        max_tokens: 500
      })
    });

    const data = await response.json();
    
    // Handle both direct response and nested choices
    let content = data;
    if (data.choices) {
      content = data.choices[0].message.content;
    } else if (data.content) {
      content = data.content;
    }

    if (typeof content === 'string') {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    return { observation: 'Could not parse', action: 'done', done: true, answer: String(content) };
  }

  /**
   * Execute a single browser action
   */
  private async executeAction(action: string, params: any): Promise<string> {
    if (!this.page) throw new Error('Browser not launched');

    try {
      switch (action) {
        case 'click':
          if (params.selector) {
            await this.page.waitForSelector(params.selector, { timeout: 5000 });
            await this.page.click(params.selector);
            return `Clicked: ${params.selector}`;
          }
          return 'No selector for click';

        case 'type':
          if (params.selector && params.text) {
            await this.page.waitForSelector(params.selector, { timeout: 5000 });
            await this.page.click(params.selector);
            await this.page.keyboard.type(params.text, { delay: 30 });
            return `Typed into ${params.selector}`;
          }
          return 'Missing selector or text';

        case 'scroll':
          await this.page.evaluate(() => window.scrollBy(0, 400));
          return 'Scrolled down';

        case 'navigate':
          if (params.url) {
            await this.page.goto(params.url, { waitUntil: 'networkidle2', timeout: 30000 });
            return `Navigated to: ${params.url}`;
          }
          return 'No URL provided';

        case 'wait':
          await new Promise(r => setTimeout(r, 2000));
          return 'Waited 2 seconds';

        case 'done':
          return 'Task complete';

        default:
          return `Unknown action: ${action}`;
      }
    } catch (err: any) {
      return `Action failed: ${err.message}`;
    }
  }

  /**
   * MAIN: Execute a task from chat
   * This is what gets called when you type something in chat
   */
  async doTask(task: string): Promise<OperatorResult> {
    console.log(`[OPERATOR] Task: ${task}`);

    try {
      // Launch browser if not already open
      await this.launch();

      // Check if task has a URL - if so, navigate first
      const urlMatch = task.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        console.log(`[OPERATOR] Navigating to: ${urlMatch[0]}`);
        await this.page!.goto(urlMatch[0], { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(r => setTimeout(r, 1000));
      }

      // Vision-action loop (max 15 steps)
      let steps = 0;
      const maxSteps = 15;

      while (steps < maxSteps) {
        steps++;
        console.log(`[OPERATOR] Step ${steps}`);

        // Screenshot
        const buffer = await this.page!.screenshot({ encoding: 'base64' });
        const screenshotBase64 = buffer as string;

        // Ask vision what to do
        const decision = await this.askVision(task, screenshotBase64);
        console.log(`[OPERATOR] See: ${decision.observation}`);
        console.log(`[OPERATOR] Action: ${decision.action}`);

        // If done, return the answer
        if (decision.done) {
          const shotUrl = await this.screenshot('result');
          return {
            success: true,
            message: decision.answer || 'Task completed',
            screenshot: shotUrl
          };
        }

        // Execute the action
        const result = await this.executeAction(decision.action, decision);
        console.log(`[OPERATOR] Result: ${result}`);

        // Small delay for page to update
        await new Promise(r => setTimeout(r, 1000));
      }

      // Hit max steps
      const shotUrl = await this.screenshot('max-steps');
      return {
        success: false,
        message: 'Hit max steps without completing task',
        screenshot: shotUrl
      };

    } catch (err: any) {
      console.error(`[OPERATOR] Error: ${err.message}`);
      return {
        success: false,
        message: 'Task failed',
        error: err.message
      };
    }
  }

  /**
   * Quick actions - no vision loop needed
   */
  async goto(url: string): Promise<OperatorResult> {
    await this.launch();
    await this.page!.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    const shotUrl = await this.screenshot('goto');
    return { success: true, message: `Navigated to ${url}`, screenshot: shotUrl };
  }

  async shot(): Promise<OperatorResult> {
    if (!this.page) {
      return { success: false, message: 'No browser open' };
    }
    const shotUrl = await this.screenshot('manual');
    return { success: true, message: 'Screenshot taken', screenshot: shotUrl };
  }
}

// Singleton instance
let operator: OperatorAgent | null = null;

export function getOperator(): OperatorAgent {
  if (!operator) {
    operator = new OperatorAgent();
  }
  return operator;
}

export default OperatorAgent;
