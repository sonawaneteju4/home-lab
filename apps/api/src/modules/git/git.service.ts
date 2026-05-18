import simpleGit from "simple-git";

export class GitService {
  async cloneRepository(
    repoUrl: string,
    targetPath: string
  ) {
    const git = simpleGit();

    await git.clone(
      repoUrl,
      targetPath
    );

    return {
      success: true,
    };
  }
}