
# ShaunAI Operator & Faceless Browser TODO

🎯 **Core Mission**
ShaunAI = Shaun’s digital twin. It must think, act, and execute like Shaun — from buying essentials to building entire companies — without babysitting. Operator mode = perpetual cycle of plan → act → verify → log → next task.

🧠 **Operator Mode Features**
- Perpetual Loop: Patch index.js to run continuously with heartbeat + operator.log
- Priority Queue: Update loop.js to process High → Med → Low tasks until empty
- Daily Auto-Seeding: Add seed.js to inject default tasks (e.g., [High] Generate R3 post, outreach, ops log)
- Memory + Style: Load persona/memory so outputs reflect Shaun’s voice (Jocko + RDJ + Apostle Paul)
- Operator Log: Record every action/result with timestamp in operator.log

🌐 **Faceless Browser Integration**
- Install Puppeteer (npm i puppeteer)
- Build src/hooks/browser.js for headless browser automation (scraping, screenshots, form-fills, ordering, account creation)
- Add task parser rules for browser actions (e.g., “Visit URL,” “Buy product,” “Scrape content”)
- Expand capabilities with puppeteer-extra stealth + plugins

🛒 **Real-World Actions ShaunAI Must Handle**
- Purchasing: [High] Order 24-pack water on Amazon
- Brand Build: [High] Launch YouTube channel + upload intro video
- Social Media: [High] Create Instagram/TikTok accounts for Level 7 Recovery
- Business Ops: [High] File LLC paperwork for new brand Laura
- Marketing: [High] Draft 10 outreach emails + push to Airtable
- Content: [High] Generate daily R3 micro-post (publish-ready)

⚡ **Verification Criteria**
- Operator loop runs continuously, logs heartbeat/status
- All tasks in inbox.md processed in priority order until queue empty
- Daily seeding injects baseline tasks automatically at 9 AM
- Faceless browser executes automation tasks (scrape, screenshot, fill, buy)
- External integrations (Make.com, Airtable, Notion) receive and log outputs
- operator.log + tasks/done.md capture every action with results

✅ This turns your TODO into a mission doc: not “patch files,” but “train ShaunAI to be you.”
