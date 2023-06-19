import type { Filter } from "./types"
import type { Context, Env, MiddlewareHandler } from "hono"


type Namespace<E extends Env> = string | ((c: Context<Env>) => string)
type KVCacheOption<E extends Env> = {
  namespace: Namespace<E>
  bindingKey: keyof Filter<Exclude<E["Bindings"], undefined>, KVNamespace>
}

export const caches = <E extends Env>({ namespace, bindingKey }: KVCacheOption<E>): MiddlewareHandler<Env> => async (c, next) => {
  const cache: KVNamespace = c.env?.[bindingKey as string] as KVNamespace

  await next()
}