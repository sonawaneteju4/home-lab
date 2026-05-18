import Fastify from "fastify";
import { dockerRoutes } from "./modules/docker/docker.route";
import { deploymentRoutes } from "./modules/deployment/deployment.route";

export const app = Fastify({
  logger: true,
});

app.get("/health", async () => {
  return {
    status: "ok",
  };
});

app.register(deploymentRoutes);
app.register(dockerRoutes);