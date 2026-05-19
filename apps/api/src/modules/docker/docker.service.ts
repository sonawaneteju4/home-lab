import Docker from "dockerode";
import tar from "tar-fs";

export class DockerService {
  private docker: Docker;

  constructor() {
    this.docker = new Docker({
      socketPath: "/var/run/docker.sock",
    });
  }

  // List Of Containers
  async listContainers() {
    return this.docker.listContainers({
      all: true,
    });
  }

  // Hello World Container
  async runHelloWorld() {
    const container = await this.docker.createContainer({
      Image: "hello-world",
      name: `test-${Date.now()}`,
    });

    await container.start();

    return {
      id: container.id,
    };
  }

  // Nginx Contianer
  async runNginxContainer() {
    const container = await this.docker.createContainer({
      Image: "nginx:alpine",

      name: `nginx-${Date.now()}`,

      ExposedPorts: {
        "80/tcp": {},
      },

      HostConfig: {
        PortBindings: {
          "80/tcp": [
            {
              HostPort: "",
            },
          ],
        },
      },
    });

    await container.start();

    const inspect = await container.inspect();

    const assignedPort = inspect.NetworkSettings.Ports["80/tcp"][0].HostPort;

    return {
      id: container.id,
      port: assignedPort,
    };
  }

  //Build Image
  async buildImageFromPath(
    workspacePath: string,
    imageTag: string,
    dockerfilePath: string,
  ) {
    const tarStream = tar.pack(workspacePath);

    const stream = await this.docker.buildImage(tarStream, {
      t: imageTag,
      dockerfile: dockerfilePath,
    });

    const result = await new Promise<any[]>((resolve, reject) => {
      this.docker.modem.followProgress(stream, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result ?? []);
        }
      });
    });

    const buildLogs = result
      .flatMap((event) => {
        if (typeof event?.stream === "string") {
          return event.stream
            .split("\n")
            .map((line: string) => line.trim())
            .filter((line: string) => line.length > 0);
        }

        if (typeof event?.status === "string") {
          return [event.status.trim()];
        }

        return [];
      })
      .filter((line) => line.length > 0);

    const buildError = result.find(
      (event) => event?.error || event?.errorDetail?.message,
    );

    if (buildError) {
      const logTail = buildLogs.slice(-30).join("\n");
      const baseMessage =
        buildError.error ||
        buildError.errorDetail?.message ||
        "Docker build failed";

      throw new Error(
        logTail
          ? `${baseMessage}\nDocker build log tail:\n${logTail}`
          : baseMessage,
      );
    }

    try {
      await this.docker.getImage(imageTag).inspect();
    } catch (error) {
      throw new Error(
        `Docker build finished but image tag was not created: ${imageTag}`,
      );
    }

    return {
      imageTag,
    };
  }

  // Run Container TCP

  async runContainerFromImage(image: string) {
    const container = await this.docker.createContainer({
      Image: image,

      name: `runtime-${Date.now()}`,

      ExposedPorts: {
        "3000/tcp": {},
      },

      HostConfig: {
        PortBindings: {
          "3000/tcp": [
            {
              HostPort: "",
            },
          ],
        },
      },
    });

    await container.start();

    const inspect = await container.inspect();

    const assignedPort = inspect.NetworkSettings.Ports["3000/tcp"][0].HostPort;

    return {
      id: container.id,
      port: assignedPort,
    };
  }
}
