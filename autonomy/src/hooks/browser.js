// --- Safety rail for buy() ---
export async function buy(payload) {
  if (process.env.ALLOW_PURCHASES !== 'true') {
    return { ok: false, msg: 'buy_disabled_safemode: set ALLOW_PURCHASES=true to enable' };
  }
  const whitelist = (process.env.PURCHASE_WHITELIST || '').split(',').map(s=>s.trim()).filter(Boolean);
  const url = String(payload || '').toLowerCase();
  if (!whitelist.some(dom => url.includes(dom))) {
    return { ok: false, msg: 'domain_not_whitelisted' };
  }
  return { ok: false, msg: 'flow_not_implemented_for_domain' }; // implement per-site later
}

import puppeteer from 'puppeteer';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import puppeteerExtra from 'puppeteer-extra';
import { nextFilePath, writeJSON } from '../core/artifacts.js';
import { toPublicUrl } from '../core/uploads.js';

puppeteerExtra.use(StealthPlugin());

async function getBrowser() {
  const browser = await puppeteerExtra.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  return { browser, page };
}

export const browser = {
  async visit(url, { title = 'visit' } = {}) {
    const { browser, page } = await getBrowser();
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60_000 });
      const artifact = await writeJSON({ title, data: { url, status: 'visited' }, subdir: 'browser/visits' });
      return { ok: true, msg: `visited ${url}`, artifact };
    } finally {
      await browser.close();
    }
  },

  async screenshot(urlOrSelectorLine, { title = 'screenshot' } = {}) {
    const { browser, page } = await getBrowser();
    try {
      const [url, selector] = splitUrlSelector(urlOrSelectorLine);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60_000 });

      const file = await nextFilePath({ title, ext: '.png', subdir: 'browser/screenshots' });
      if (selector) {
        await page.waitForSelector(selector, { timeout: 10_000 });
        const el = await page.$(selector);
        await el.screenshot({ path: file });
      } else {
        await page.screenshot({ path: file, fullPage: true });
      }
      const publicUrl = await toPublicUrl(file);
      return { ok: true, msg: `screenshot -> ${file}`, path: file, publicUrl };
    } finally {
      await browser.close();
    }
  },

  async scrape(url, { title = 'scrape' } = {}) {
    const { browser, page } = await getBrowser();
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      const data = await page.$$eval('a, h1, h2, p', nodes =>
        nodes.slice(0, 200).map(n => ({ tag: n.tagName, text: (n.textContent || '').trim(), href: n.href || null }))
      );
      const artifact = await writeJSON({ title, data: { url, items: data }, subdir: 'browser/scrapes' });
      return { ok: true, data, artifact };
    } finally {
      await browser.close();
    }
  },

  async fill(payload) {
    return { ok: true, msg: 'form_fill_stub (safe-mode). Enable real actions after test passes.' };
  },

  async buy(payload) {
    if (process.env.ALLOW_PURCHASES !== 'true') {
      return { ok: false, msg: 'buy_disabled_safemode: set ALLOW_PURCHASES=true to enable' };
    }
    const whitelist = (process.env.PURCHASE_WHITELIST || '').split(',').map(s=>s.trim()).filter(Boolean);
    const url = String(payload || '').toLowerCase();
    if (!whitelist.some(dom => url.includes(dom))) {
      return { ok: false, msg: 'domain_not_whitelisted' };
    }
    return { ok: false, msg: 'flow_not_implemented_for_domain' };
  },
};

function splitUrlSelector(s) {
  const parts = s.split('@ selector:');
  const url = parts[0].trim();
  const selector = parts[1]?.trim();
  return [url, selector];
}
