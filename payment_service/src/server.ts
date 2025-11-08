import * as cfg from "./config";
import { ExpressApp } from "./express-app";
import { logger } from "./utils";

export const StartServer = async () => {
  const expressApp = await ExpressApp();
  expressApp.listen(cfg.APP_PORT, () => {
    logger.info(`Listining to port ${cfg.APP_PORT}`);
  });

  process.on("uncaughtException", async (err) => {
    logger.error(err);
    process.exit(1);
  });
};

StartServer().then(() => {
  console.log("server started");
});
