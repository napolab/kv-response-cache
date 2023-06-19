import type { MiddlewareHandler } from "hono"

export const kvResponseCache = (): MiddlewareHandler => async (c, next) => {
  await next()
}
