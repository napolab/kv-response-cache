import { Hono, type MiddlewareHandler } from "hono";

import { kvCaches } from "./middleware";
const describe = setupMiniflareIsolatedStorage();

type Bindings = {
  KV: KVNamespace;
};
type HonoEnv = {
  Bindings: Bindings;
};

describe("kvCaches", () => {
  let app: Hono<HonoEnv>;
  let env: Bindings;
  let ctx: ExecutionContext;
  let kvCache: MiddlewareHandler<HonoEnv>;

  beforeEach(() => {
    env = getMiniflareBindings<Bindings>();
    ctx = new ExecutionContext();

    app = new Hono<HonoEnv>();
    kvCache = kvCaches<HonoEnv>({ namespace: "test", key: "KV" });

    app.get("/", kvCache, async (c) => {
      return c.body("Hello, World!");
    });
  });

  it("returns original response and sets cache on first request", async () => {
    const req = new Request("http://localhost/");
    const res = await app.fetch(req, env, ctx);
    expect(res.status).toEqual(200);
    expect(res.headers.get("X-KV-CACHE")).toBeNull();
  });

  it("returns cached response if available", async () => {
    const req1 = new Request("http://localhost/");
    const res1 = await app.fetch(req1, env, ctx);
    expect(res1.status).toEqual(200);
    expect(res1.headers.get("X-KV-CACHE")).toBeNull(); // First request should not be cached
    await getMiniflareWaitUntil(ctx);

    const req2 = new Request("http://localhost/");
    const res2 = await app.fetch(req2, env, ctx);
    expect(res2.status).toEqual(200);
    expect(res2.headers.get("X-KV-CACHE")).toEqual("hit"); // Second request should be cached
  });

  it("saves the response to cache after processing", async () => {
    const req = new Request("http://localhost/");
    await app.fetch(req, env, ctx);
    await getMiniflareWaitUntil(ctx);

    const cachedRes = await env.KV.get("test:" + new URL(req.url).pathname + ":body", "text");
    expect(cachedRes).toEqual("Hello, World!");
  });

  it("does not cache the response if status code is not 2xx", async () => {
    app.get("/error", kvCache, async (c) => {
      return c.body("Error", { status: 500 });
    });

    const req1 = new Request("http://localhost/error");
    const res1 = await app.fetch(req1, env, ctx);
    expect(res1.status).toEqual(500);
    expect(res1.headers.get("X-KV-CACHE")).toBeNull(); // First request should not be cached
    await getMiniflareWaitUntil(ctx);

    const req2 = new Request("http://localhost/error");
    const res2 = await app.fetch(req2, env, ctx);
    expect(res2.status).toEqual(500);
    expect(res2.headers.get("X-KV-CACHE")).toBeNull(); // Second request should not be cached as well

    const cachedRes = await env.KV.get("test:" + new URL(req1.url).pathname + ":body", "text");
    expect(cachedRes).toBeNull(); // Response should not be cached
  });
});
