import fs from "fs";
import path from "path";

export function createWorkspace(
  deploymentId: string
) {
  const workspacePath = path.join(
    "/var/deployer/workspaces",
    deploymentId
  );

  fs.mkdirSync(workspacePath, {
    recursive: true,
  });

  return workspacePath;
}