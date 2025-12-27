/**
 * Chat Router - Detects browser tasks and routes to Operator Agent
 * 
 * This is the brain that decides: LLM answer vs browser action
 */

import { getOperator } from './operator-agent.js';

// Patterns that trigger browser automation
const BROWSER_PATTERNS = [
  /^go to /i,
  /^navigate to /i,
  /^open /i,
  /^visit /i,
  /^browse to /i,
  /^check out /i,
  /^screenshot /i,
  /^take a shot of /i,
  /^fill out /i,
  /^fill in /i,
  /^click on /i,
  /^click the /i,
  /^search for .* on /i,
  /^find .* on /i,
  /^look up /i,
  /^scrape /i,
  /^audit /i,
  /https?:\/\//i,  // Any URL
];

// Quick commands
const QUICK_COMMANDS: Record<string, (msg: string) => Promise<any>> = {
  '/shot': async () => {
    const op = getOperator();
    return op.shot();
  },
  '/close': async () => {
    const op = getOperator();
    await op.close();
    return { success: true, message: 'Browser closed' };
  }
};

export interface ChatResponse {
  type: 'text' | 'browser';
  message: string;
  screenshot?: string;
  data?: any;
}

/**
 * Route a chat message - either to LLM or to browser operator
 */
export async function routeMessage(message: string, llmChat: (msg: string) => Promise<string>): Promise<ChatResponse> {
  const trimmed = message.trim();

  // Check quick commands first
  for (const [cmd, handler] of Object.entries(QUICK_COMMANDS)) {
    if (trimmed.toLowerCase().startsWith(cmd)) {
      const result = await handler(trimmed);
      return {
        type: 'browser',
        message: result.message,
        screenshot: result.screenshot
      };
    }
  }

  // Check if this looks like a browser task
  const isBrowserTask = BROWSER_PATTERNS.some(pattern => pattern.test(trimmed));

  if (isBrowserTask) {
    console.log('[ROUTER] Browser task detected');
    const op = getOperator();
    const result = await op.doTask(trimmed);
    
    return {
      type: 'browser',
      message: result.message,
      screenshot: result.screenshot,
      data: result.data
    };
  }

  // Otherwise, just chat with LLM
  console.log('[ROUTER] LLM chat');
  const response = await llmChat(trimmed);
  return {
    type: 'text',
    message: response
  };
}

export default routeMessage;
