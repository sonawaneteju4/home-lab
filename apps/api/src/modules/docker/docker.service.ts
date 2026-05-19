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
    await new Promise((resolve, reject) => {
      this.docker.modem.followProgress(stream, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

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
