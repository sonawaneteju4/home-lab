import { DockerService } from "../docker/docker.service";
import { GitService } from "../git/git.service";

import { createWorkspace } from "../../shared/workspace";

export class DeploymentService {
  private dockerService: DockerService;
  private gitService: GitService;

  constructor() {
    this.dockerService = new DockerService();
    this.gitService = new GitService();
  }

  async deployRepository(repoUrl: string, dockerfilePath: string) {
    const deploymentId = `deployment-${Date.now()}`;

    const workspacePath = createWorkspace(deploymentId);

    await this.gitService.cloneRepository(repoUrl, workspacePath);

    const imageTag = `deployment:${Date.now()}`;

    await this.dockerService.buildImageFromPath(
      workspacePath,
      imageTag,
      dockerfilePath,
    );

    const runtime = await this.dockerService.runContainerFromImage(imageTag);

    return {
      deploymentId,
      workspacePath,
      imageTag,
      runtime,
    };
  }
}
