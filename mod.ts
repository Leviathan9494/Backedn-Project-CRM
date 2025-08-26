// Entry point for the Deno product management API
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { routerHandler } from "./router.ts";

export function startServer(port = 8000) {
  const controller = new AbortController();
  const { signal } = controller;

  // start server in background; serve returns a promise that resolves when aborted
  serve((req) => routerHandler(req), { port, signal });
  return { controller, port };
}

if (import.meta.main) {
  const port = Number(Deno.env.get("PORT") || 8000);
  console.log(`Starting server on http://localhost:${port}`);
  startServer(port);
  // keep the process alive
  await new Promise(() => {});
}
