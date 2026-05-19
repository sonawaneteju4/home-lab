import simpleGit from "simple-git";
import fs from "fs";
import path from "path";

export class GitService {
  async cloneRepository(repoUrl: string, targetPath: string) {
    const git = simpleGit();

    // Ensure parent exists and target is clean before cloning.
    fs.mkdirSync(path.dirname(targetPath), {
      recursive: true,
    });

    if (fs.existsSync(targetPath)) {
      fs.rmSync(targetPath, {
        recursive: true,
        force: true,
      });
    }

    try {
      await git.clone(repoUrl, targetPath);
    } catch (error) {
      console.error("Clone failed", {
        repoUrl,
        targetPath,
        error,
      });
      throw error;
    }

    const entries = fs.readdirSync(targetPath);

    if (entries.length === 0) {
      throw new Error(`Clone completed but target is empty: ${targetPath}`);
    }

    return {
      success: true,
    };
  }
}
