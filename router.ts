// HTTP router separated for readability
import { listProducts, createProduct, batchUpdate, getProduct, updateProduct, deleteProduct } from "./products.ts";
import { createUser, authenticate } from "./users.ts";

export async function routerHandler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // basic request logging for debugging
  try {
    const origin = req.headers.get('origin') || 'none';
    console.log(`[router] ${new Date().toISOString()} - ${req.method} ${pathname} origin=${origin}`);
  } catch (_e) {
    // ignore logging errors
  }

  // CORS preflight handling and helper for JSON responses
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(), 'content-type': 'application/json' } });
  }

  type MaybeError = { error?: string }

  function corsHeaders() {
    return {
      'access-control-allow-origin': 'http://localhost:3000',
      'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'access-control-allow-headers': 'content-type,authorization',
    } as Record<string, string>;
  }

  // helper to require authentication for protected routes
  async function requireAuth(req: Request) {
    const auth = req.headers.get('authorization') || '';
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (!m) return null;
    const token = m[1];
    try {
      const verified = await (await import('./users.ts')).verifyToken(token);
      return verified;
    } catch (_e) {
      return null;
    }
  }

  // Serve swagger UI and spec
  if (pathname === "/swagger" || pathname === "/") {
    const html = await Deno.readTextFile(new URL("./swagger.html", import.meta.url));
    return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", ...corsHeaders() } });
  }
  if (pathname === "/openapi.json") {
    const spec = await Deno.readTextFile(new URL("./openapi.json", import.meta.url));
    return new Response(spec, { headers: { "content-type": "application/json; charset=utf-8", ...corsHeaders() } });
  }

  // Products endpoints
  if (pathname === "/products" && req.method === "GET") {
    const items = await listProducts(url.searchParams);
    return jsonResponse(items);
  }

  if (pathname === "/products" && req.method === "POST") {
    const body = await req.json().catch(() => ({}));
  const user = await requireAuth(req);
  if (!user) return jsonResponse({ error: 'unauthorized' }, 401);
  const created = await createProduct(body);
  return jsonResponse(created, 201);
  }

  // Signup
  if (pathname === "/signup" && req.method === "POST") {
    const body = await req.json().catch(() => ({}));
  const result = await createUser(body) as unknown as MaybeError;
  if (result.error) return jsonResponse({ error: result.error }, 400);
    return jsonResponse(result, 201);
  }

  // Login
  if (pathname === "/login" && req.method === "POST") {
    const body = await req.json().catch(() => ({}));
  const result = await authenticate(body) as unknown as MaybeError;
  if (result.error) return jsonResponse({ error: result.error }, 401);
    return jsonResponse(result, 200);
  }

  // batch update
  if (pathname === "/products/batch" && (req.method === "PATCH" || req.method === "PUT")) {
    const body = await req.json().catch(() => ({}));
  const user = await requireAuth(req);
  if (!user) return jsonResponse({ error: 'unauthorized' }, 401);
  const ids = Array.isArray(body.ids) ? body.ids.map(Number) : null;
  try {
    const updated = await batchUpdate(ids, body.update || {});
    return new Response(JSON.stringify(updated), { headers: { "content-type": "application/json", ...corsHeaders() } });
  } catch (err) {
    let msg = 'invalid request'
    if (typeof err === 'object' && err && 'message' in (err as Record<string, unknown>)) {
      const r = err as Record<string, unknown>
      msg = String(r.message)
    } else {
      msg = String(err)
    }
    return jsonResponse({ error: String(msg || 'invalid request') }, 400);
  }
  }

  // batch delete: accept { ids: [1,2,3] }
  if (pathname === "/products/batch" && req.method === "DELETE") {
    const user = await requireAuth(req);
    if (!user) return jsonResponse({ error: 'unauthorized' }, 401);
    const body = await req.json().catch(() => ({}));
    const ids = Array.isArray(body.ids) ? body.ids.map(Number) : [];
    const deleted: number[] = [];
    for (const id of ids) {
      try {
        const ok = await deleteProduct(id);
        if (ok) deleted.push(id);
      } catch (_e) {
        // ignore per-id errors
      }
    }
    return jsonResponse({ deleted }, 200);
  }

  // /products/:id
  const productIdMatch = pathname.match(/^\/products\/(\d+)$/);
  if (productIdMatch) {
    const id = Number(productIdMatch[1]);
    if (req.method === "GET") {
      const p = await getProduct(id);
      if (!p) return new Response(null, { status: 404, headers: corsHeaders() });
      return jsonResponse(p);
    }
    if (req.method === "PUT" || req.method === "PATCH") {
      const body = await req.json().catch(() => ({}));
  const user = await requireAuth(req);
  if (!user) return jsonResponse({ error: 'unauthorized' }, 401);
  const updated = await updateProduct(id, body);
  if (!updated) return new Response(null, { status: 404, headers: corsHeaders() });
  return jsonResponse(updated);
    }
    if (req.method === "DELETE") {
  const user = await requireAuth(req);
  if (!user) return jsonResponse({ error: 'unauthorized' }, 401);
  const ok = await deleteProduct(id);
  return new Response(null, { status: ok ? 204 : 404, headers: corsHeaders() });
    }
  }
  return jsonResponse({ error: "not found" }, 404);
}
