/**
 * Operator Integration for Express Server
 * 
 * Drop-in module that adds browser automation to your chat endpoint.
 * Import and use in your server's /api/chat route.
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// For ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Puppeteer
let puppeteer = null;

async function loadPuppeteer() {
  if (!puppeteer) {
    puppeteer = (await import('puppeteer')).default;
  }
  return puppeteer;
}

// Windows Chrome path
const CHROME_WIN = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

// State
let browser = null;
let page = null;
const artifactsDir = path.resolve(process.cwd(), 'artifacts');
fs.mkdirSync(artifactsDir, { recursive: true });

// Browser patterns that trigger automation
const BROWSER_TRIGGERS = [
  /^go to /i,
  /^navigate to /i,
  /^open /i,
  /^visit /i,
  /^browse /i,
  /^check out /i,
  /^screenshot /i,
  /^shot /i,
  /^fill out /i,
  /^fill in /i,
  /^click /i,
  /^search .* on /i,
  /^find .* on /i,
  /^scrape /i,
  /^audit /i,
  /https?:\/\//i,
];

/**
 * Check if message should trigger browser
 */
export function isBrowserTask(message) {
  return BROWSER_TRIGGERS.some(p => p.test(message.trim()));
}

/**
 * Launch visible browser
 */
async function launchBrowser() {
  if (browser) return;
  
  const pptr = await loadPuppeteer();
  const executablePath = process.platform === 'win32' ? CHROME_WIN : undefined;
  
  browser = await pptr.launch({
    headless: false,
    defaultViewport: { width: 1366, height: 768 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized'],
    executablePath
  });
  
  page = await browser.newPage();
  console.log('[OPERATOR] Browser launched - visible mode');
}

/**
 * Close browser
 */
export async function closeBrowser() {
  if (browser) {
    await browser.close().catch(() => {});
    browser = null;
    page = null;
  }
}

/**
 * Take screenshot
 */
async function takeScreenshot(label) {
  if (!page) throw new Error('No browser');
  
  const today = new Date().toISOString().slice(0, 10);
  const ts = Date.now();
  const dir = path.join(artifactsDir, today);
  fs.mkdirSync(dir, { recursive: true });
  
  const filename = `${label || 'shot'}-${ts}.png`;
  const filepath = path.join(dir, filename);
  
  await page.screenshot({ path: filepath, fullPage: true });
  return `/artifacts/${today}/${filename}`;
}

/**
 * Ask GPT-4o Vision what to do
 */
async function askVision(task, screenshotBase64, openaiKey, model = 'gpt-4o') {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: `You are ShaunAI's browser operator. Analyze the screenshot and complete the task.

TASK: ${task}

Respond ONLY in JSON:
{
  "observation": "what you see",
  "action": "click|type|scroll|navigate|wait|done",
  "selector": "CSS selector if click/type",
  "text": "text if typing",
  "url": "url if navigating",
  "done": true/false,
  "answer": "final answer if done"
}`
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'What should I do next?' },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${screenshotBase64}` } }
          ]
        }
      ],
      max_tokens: 500
    })
  });
  
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  const match = content.match(/\{[\s\S]*\}/);
  return match ? JSON.parse(match[0]) : { done: true, answer: content };
}

/**
 * Execute browser action
 */
async function executeAction(action, params) {
  if (!page) throw new Error('No browser');
  
  switch (action) {
    case 'click':
      if (params.selector) {
        await page.waitForSelector(params.selector, { timeout: 5000 });
        await page.click(params.selector);
        return `Clicked ${params.selector}`;
      }
      return 'No selector';
      
    case 'type':
      if (params.selector && params.text) {
        await page.waitForSelector(params.selector, { timeout: 5000 });
        await page.click(params.selector);
        await page.keyboard.type(params.text, { delay: 30 });
        return `Typed into ${params.selector}`;
      }
      return 'Missing params';
      
    case 'scroll':
      await page.evaluate(() => window.scrollBy(0, 400));
      return 'Scrolled';
      
    case 'navigate':
      if (params.url) {
        await page.goto(params.url, { waitUntil: 'networkidle2', timeout: 30000 });
        return `Navigated to ${params.url}`;
      }
      return 'No URL';
      
    case 'wait':
      await new Promise(r => setTimeout(r, 2000));
      return 'Waited';
      
    default:
      return 'Done';
  }
}

/**
 * MAIN: Execute a browser task
 */
export async function doBrowserTask(task, openaiKey, broadcast) {
  
  const say = (msg) => {
    console.log(`[OPERATOR] ${msg}`);
    if (broadcast) broadcast({ type: 'log', content: msg, at: new Date().toISOString() });
  };
  
  try {
    await launchBrowser();
    say('Browser ready');
    
    // Check for URL in task
    const urlMatch = task.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      say(`Navigating to ${urlMatch[0]}`);
      await page.goto(urlMatch[0], { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 1000));
    }
    
    // Vision loop
    let steps = 0;
    const maxSteps = 15;
    
    while (steps < maxSteps) {
      steps++;
      say(`Step ${steps}`);
      
      const buffer = await page.screenshot({ encoding: 'base64' });
      const decision = await askVision(task, buffer, openaiKey);
      
      say(`See: ${decision.observation}`);
      say(`Action: ${decision.action}`);
      
      if (decision.done) {
        const shot = await takeScreenshot('result');
        return { ok: true, content: decision.answer || 'Done', screenshot: shot };
      }
      
      await executeAction(decision.action, decision);
      await new Promise(r => setTimeout(r, 1000));
    }
    
    const shot = await takeScreenshot('timeout');
    return { ok: false, content: 'Max steps reached', screenshot: shot };
    
  } catch (err) {
    console.error('[OPERATOR]', err);
    return { ok: false, content: `Error: ${err.message}` };
  }
}

/**
 * Quick screenshot command
 */
export async function doScreenshot() {
  if (!page) {
    return { ok: false, content: 'No browser open. Say "go to <url>" first.' };
  }
  const shot = await takeScreenshot('manual');
  return { ok: true, content: 'Screenshot taken', screenshot: shot };
}

export default { isBrowserTask, doBrowserTask, doScreenshot, closeBrowser };
