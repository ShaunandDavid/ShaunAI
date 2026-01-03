import Fastify from "fastify";
import { z } from "zod";

const app = Fastify({ logger: true });

app.get("/healthz", async () => ({ ok: true, service: "browser-sandbox" }));

const renderSchema = z.object({
  url: z.string().url(),
  allowlist: z.array(z.string()).optional()
});

app.post("/render", async (req, reply) => {
  const parsed = renderSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.code(400).send({ error: "Invalid payload" });
  }

  return {
    ok: false,
    reason: "Render not implemented yet",
    url: parsed.data.url
  };
});

const port = Number(process.env.PORT || 4100);
const host = process.env.HOST || "0.0.0.0";

app
  .listen({ port, host })
  .then(() => {
    // eslint-disable-next-line no-console
    console.log(`Browser sandbox listening on http://${host}:${port}`);
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Browser sandbox failed", err);
    process.exit(1);
  });
