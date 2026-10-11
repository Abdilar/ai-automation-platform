import fastify from "fastify";
import { jobRoutes } from "./api";

export function buildApp() {
  const app = fastify({
    logger: true,
  });

  app.get("/health", async () => ({
    status: "ok",
  }));

  app.register(jobRoutes, {prefix: '/api/v1/jobs'})

  return app
}
