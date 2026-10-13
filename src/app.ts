import fastify from "fastify";
import { errorHandler, jobRoutes } from "./api";

export function buildApp() {
  const app = fastify({
    logger: {
      redact: ['req.headers.x-api-key', 'req.headers.authorization']
    },
  });

  app.setErrorHandler(errorHandler)
  
  app.get("/health", async () => ({
    status: "ok",
  }));

  app.register(jobRoutes, {prefix: '/api/v1/jobs'})

  return app
}
