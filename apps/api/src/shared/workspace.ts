import fs from "fs";
import path from "path";

export function createWorkspace(deploymentId: string) {
  const workspaceRoot = "/var/deployer/workspaces";

  const workspacePath = path.join(workspaceRoot, deploymentId);

  fs.mkdirSync(workspaceRoot, {
    recursive: true,
  });

  return workspacePath;
}
