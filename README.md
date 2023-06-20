# @napolab/kv-response-cache

This package is a middleware for [Hono](https://hono.dev/), It provides a response cache mechanism using Cloudflare's KV (Key Value) storage.

One of the key features of this middleware is that it can be used even when a custom domain is not available.

## Features

- **Response Cache**: The middleware provides a caching mechanism for responses, reducing latency and network load.
- **Cloudflare KV**: The caching mechanism leverages Cloudflare's fast and distributed KV storage system.
- **No Custom Domain Required**: Unlike some caching solutions, this middleware works even when you don't have a custom domain.

## Provided Functionality

Here is an overview of the functions this middleware provides:

### kvCaches

The `kvCaches` function is the primary way to use this middleware. Here's its TypeScript definition:

```typescript
import type { Context, Env, MiddlewareHandler } from "hono"

type Filter<T extends Record<string, unknown>, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};

type Namespace<E extends Env> = string | ((c: Context<E>) => string)
type KVCacheOption<E extends Env> = {
  key: keyof Filter<Exclude<E["Bindings"], undefined>, KVNamespace>
  namespace: Namespace<E>
  options?: KVNamespacePutOptions
}

declare const kvCaches = <E extends Env>({ namespace, key: bindingKey, options }: KVCacheOption<E>): MiddlewareHandler<E>
```

## Installation

Here are the steps to install this project. We'll assume you are using npm for this example:

```shell
npm install @napolab/kv-response-cache
```

## Usage

To use this middleware in your Hono application, you need to import the kvCaches function and use it as per your caching needs.

## Example

Here is a simple example of how to use kvCaches in a Hono application:

```typescript
import { kvCaches } from "@napolab/kv-response-cache";

const cacheOptions = {
  key: "myKVNamespace",
  namespace: "myNamespace",
};

const middleware = kvCaches(cacheOptions);

// Use the middleware in your application
// app.use(middleware);
```

In this example, myKVNamespace is the key for the KV Namespace binding and myNamespace is the namespace for the cache. Adjust these values to match your Cloudflare KV settings.
