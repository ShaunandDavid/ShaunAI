import { Controller, Get, Res } from "@nestjs/common";
import type { Response } from "fastify";
import { Registry, collectDefaultMetrics } from "prom-client";

const registry = new Registry();
collectDefaultMetrics({ register: registry });

@Controller()
export class MetricsController {
  @Get("metrics")
  async metrics(@Res() res: Response) {
    res.header("Content-Type", registry.contentType);
    res.send(await registry.metrics());
  }
}
