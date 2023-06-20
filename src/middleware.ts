import { kvResponseCache } from "./caches";

import type { Filter } from "./types";
import type { Context, Env, MiddlewareHandler } from "hono";

type Namespace<E extends Env> = string | ((c: Context<E>) => string);
type KVCacheOption<E extends Env> = {
  key: keyof Filter<Exclude<E["Bindings"], undefined>, KVNamespace>;
  namespace: Namespace<E>;
  options?: KVNamespacePutOptions;
};

export const kvCaches =
  <E extends Env>({ namespace, key: bindingKey, options }: KVCacheOption<E>): MiddlewareHandler<E> =>
  async (c, next) => {
    const kv: KVNamespace = c.env?.[bindingKey as string] as KVNamespace;
    const kvNamespace = typeof namespace === "function" ? namespace(c) : namespace;

    const kvCaches = kvResponseCache(kv);
    const cache = kvCaches(kvNamespace);

    const key = new URL(c.req.url).pathname;
    const response = await cache.match(key);
    if (response) return response;

    await next();

    c.executionCtx.waitUntil(cache.put(key, c.res.clone(), options));
  };
