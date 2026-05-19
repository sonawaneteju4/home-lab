import { DockerService } from "../docker/docker.service";
import { GitService } from "../git/git.service";
import fs from "fs";
import path from "path";

import { createWorkspace } from "../../shared/workspace";

export class DeploymentService {
  private dockerService: DockerService;
  private gitService: GitService;

  constructor() {
    this.dockerService = new DockerService();
    this.gitService = new GitService();
  }

  private getRepoName(repoUrl: string) {
    const trimmed = repoUrl.endsWith(".git")
      ? repoUrl.slice(0, -4)
      : repoUrl;
    return trimmed.split("/").pop() ?? "";
  }

  private resolveDockerfilePath(
    repoUrl: string,
    dockerfilePath: string,
  ) {
    const repoName = this.getRepoName(repoUrl);

    let candidate = dockerfilePath
      .replace(/\\/g, "/")
      .replace(/^\.\//, "")
      .replace(/^\/+/, "");

    if (repoName && candidate.startsWith(`${repoName}/`)) {
      candidate = candidate.slice(repoName.length + 1);
    }

    const normalized = path.posix.normalize(candidate);

    if (
      !normalized ||
      normalized === "." ||
      normalized === ".." ||
      normalized.startsWith("../")
    ) {
      throw new Error(`Invalid dockerfilePath: ${dockerfilePath}`);
    }

    return normalized;
  }

  async deployRepository(repoUrl: string, dockerfilePath: string) {
    const deploymentId = `deployment-${Date.now()}`;

    const workspacePath = createWorkspace(deploymentId);

    await this.gitService.cloneRepository(repoUrl, workspacePath);

    const resolvedDockerfilePath = this.resolveDockerfilePath(
      repoUrl,
      dockerfilePath,
    );

    const fullDockerfilePath = path.join(workspacePath, resolvedDockerfilePath);

    if (!fs.existsSync(fullDockerfilePath)) {
      throw new Error(`Cannot locate Dockerfile in workspace: ${resolvedDockerfilePath}`);
    }

    const imageTag = `deployment:${Date.now()}`;

    await this.dockerService.buildImageFromPath(
      workspacePath,
      imageTag,
      resolvedDockerfilePath,
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
