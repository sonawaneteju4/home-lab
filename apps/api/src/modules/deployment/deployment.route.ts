import { FastifyInstance } from "fastify";
import { DeploymentService } from "./deployment.service";

const deploymentService = new DeploymentService();

export async function deploymentRoutes(app: FastifyInstance) {
  app.post("/deploy/repo", async (request) => {
    const body = request.body as {
      repoUrl: string;
      dockerfilePath: string;
    };

    return deploymentService.deployRepository(
      body.repoUrl,
      body.dockerfilePath,
    );
  });
}
