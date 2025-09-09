import cron from "node-cron";
import { runLoop, runUntilEmpty } from "./loop.js";
import { seedDaily } from "./seed.js";
import fs from "fs";
import path from "path";

const LOG = path.join(process.cwd(), "operator.log");
const log = (m) => fs.appendFileSync(LOG, `[${new Date().toISOString()}] ${m}\n`);

async function heartbeat() {
  try {
    log("HEARTBEAT start");
    await runUntilEmpty(); // drain queue in priority order
    log("HEARTBEAT end");
  } catch (e) {
    log(`HEARTBEAT error: ${e?.message || e}`);
  }
}

async function main() {
  log("OPERATOR boot");
  // run immediately once
  await heartbeat();

  // every 2 minutes: check queue and act
  cron.schedule("*/2 * * * *", heartbeat);

  // daily auto-seed at 09:00 local
  cron.schedule("0 9 * * *", async () => {
    await seedDaily();
    log("SEED inserted daily tasks");
  });

  // light status ping every 30 minutes
  cron.schedule("*/30 * * * *", () => log("STATUS alive"));
}

main();
