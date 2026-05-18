import { FastifyInstance } from "fastify";
import { DockerService } from "./docker.service";

const dockerService = new DockerService();

export async function dockerRoutes(app: FastifyInstance) {
  app.get("/docker/containers", async () => {
    const containers = await dockerService.listContainers();

    return containers;
  });

  app.get("/docker/list",async() =>{
    const result = await dockerService.listContainers()

    return result;
  })

  app.post("/docker/nginx", async () => {
  const result = await dockerService.runNginxContainer();

  return result;
});
}