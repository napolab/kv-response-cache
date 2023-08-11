import { kvResponseCache } from ".";

import type { KVResponseCache } from ".";
import type { Mock } from "vitest";

const describe = setupMiniflareIsolatedStorage();

describe("kvResponseCache", () => {
  let mockKV: KVNamespace;
  let cache: KVResponseCache;

  beforeEach(() => {
    mockKV = {
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as KVNamespace;

    cache = kvResponseCache(mockKV)("testCache");
  });

  it("should correctly match a cached response", async () => {
    const testKey = "sampleKey";
    const headers = { "Content-Type": "text/plain" };
    const status = "200";
    const body = new ReadableStream();

    (mockKV.get as Mock).mockImplementation((key: string) => {
      if (key === "testCache:sampleKey:headers") return JSON.stringify(headers);
      if (key === "testCache:sampleKey:status") return status;
      if (key === "testCache:sampleKey:body") return body;

      return null;
    });

    const res = await cache.match(testKey);
    expect(res).not.toBeNull();
    expect(res?.status).toEqual(200);
    expect(res?.headers.get("Content-Type")).toEqual("text/plain");
  });

  it("should correctly put a response into cache", async () => {
    const testKey = "sampleKey";
    const res = new Response("Hello, World!", { status: 200, headers: { "Content-Type": "text/plain" } });

    await cache.put(testKey, res);

    expect(mockKV.put).toHaveBeenCalledTimes(3);
  });

  it("should correctly delete a cached response", async () => {
    const testKey = "sampleKey";

    await cache.delete(testKey);

    expect(mockKV.delete).toHaveBeenCalledTimes(3);
  });

  it("should correctly put and match a response into/from cache", async () => {
    cache = kvResponseCache(mockKV)("testCache");
    const testKey = "sampleKey";
    const bodyContent = "Hello, World!";
    const res = new Response(bodyContent, { status: 200, headers: { "Content-Type": "text/plain" } });

    await cache.put(testKey, res);

    // Mock the KV get responses to simulate a cache hit
    (mockKV.get as Mock).mockImplementation((key: string) => {
      if (key === "testCache:sampleKey:headers") return JSON.stringify({ "Content-Type": "text/plain" });
      if (key === "testCache:sampleKey:status") return "200";
      if (key === "testCache:sampleKey:body")
        return new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(bodyContent));
            controller.close();
          },
        });

      return null;
    });

    const cachedRes = await cache.match(testKey);
    expect(cachedRes).not.toBeNull();
    expect(cachedRes?.status).toEqual(200);
    expect(cachedRes?.headers.get("Content-Type")).toEqual("text/plain");
    const cachedBody = await cachedRes?.text();
    expect(cachedBody).toEqual(bodyContent);
  });
  it("should correctly delete a cached response", async () => {
    cache = kvResponseCache(mockKV)("testCache");
    const testKey = "sampleKey";

    await cache.delete(testKey);

    expect(mockKV.delete).toHaveBeenCalledWith("testCache:sampleKey:headers");
    expect(mockKV.delete).toHaveBeenCalledWith("testCache:sampleKey:status");
    expect(mockKV.delete).toHaveBeenCalledWith("testCache:sampleKey:body");
  });
});
