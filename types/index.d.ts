interface Env {
  NODE_ENV?: "development" | "production" | "test";
  LOG_LEVEL?: import("@open-draft/logger").LogLevel;
  DEBUG?: "true" | "false" | "1" | "0";
}

declare namespace NodeJS {
  interface ProcessEnv extends Env {}
}
