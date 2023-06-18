import { config } from "dotenv";

import { logger } from "@adapters/logger";

config();

export const main = async () => {
  logger.debug("Hello, world!");
  logger.info("Hello, world!");
  logger.success("Hello, world!");
  logger.warning("Hello, world!");
  logger.error("Hello, world!");
};

void main();
