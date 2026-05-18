import dotenv from "dotenv";
import { app } from "./app";

dotenv.config();

const start = async () => {
  try {
    await app.listen({
      port: 4001,
      host: "0.0.0.0",
    });

    console.log("server started");
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();