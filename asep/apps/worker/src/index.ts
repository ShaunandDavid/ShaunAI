import { Worker } from "@temporalio/worker";
import path from "node:path";

const taskQueue = process.env.TEMPORAL_TASK_QUEUE || "asep-main";

async function run() {
  const worker = await Worker.create({
    workflowsPath: path.join(__dirname, "workflows"),
    activities: {},
    taskQueue
  });

  // eslint-disable-next-line no-console
  console.log(`Worker started (taskQueue=${taskQueue})`);
  await worker.run();
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Worker failed", err);
  process.exit(1);
});
